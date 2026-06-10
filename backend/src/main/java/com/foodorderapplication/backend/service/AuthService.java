package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.auth.AuthResponse;
import com.foodorderapplication.backend.dto.auth.LoginRequest;
import com.foodorderapplication.backend.dto.auth.RegisterRequest;
import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.model.enums.UserRole;
import com.foodorderapplication.backend.repository.UserRepository;
import com.foodorderapplication.backend.security.JwtUtil;
import com.foodorderapplication.backend.security.OauthCodeStore;
import com.foodorderapplication.backend.util.EmailRequest;
import com.foodorderapplication.backend.util.EmailType;
import com.foodorderapplication.backend.util.SmtpProperties;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;
    private final SmtpProperties smtpProperties;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    @Value("${app.frontend.reset-url:http://localhost:5173/reset-password}")
    private String appFrontendResetUrl;

    @Value("${app.dev.bypass-email-verification:false}")
    private boolean bypassEmailVerification;

    private final Environment env;

    private final OauthCodeStore oauthCodeStore;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            NotificationService notificationService, SmtpProperties smtpProperties, Environment env, OauthCodeStore oauthCodeStore) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
        this.smtpProperties = smtpProperties;
        this.env = env;
        this.oauthCodeStore = oauthCodeStore;
    }

    private boolean isSafeToBypass() {
        if (!bypassEmailVerification) return false;
        if (env.getActiveProfiles() != null) {
            return !Arrays.asList(env.getActiveProfiles()).contains("prod");
        }
        return true;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        // Validate email format
        String emailRaw = request.getEmail().trim();
        if (!emailRaw.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid email format");
        }
        // Validate field lengths
        if (emailRaw.length() > 254) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email must not exceed 254 characters");
        }
        if (request.getName() != null && request.getName().trim().length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name must not exceed 100 characters");
        }
        validatePasswordPolicy(request.getPassword());

        String email = normalizeEmail(emailRaw);
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CUSTOMER);
        user.setEmailVerified(false);
        String verificationToken = generateResetToken();
        user.setVerificationToken(hashToken(verificationToken));
        user.setVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24));

        User savedUser = userRepository.save(user);
        try {
            sendVerificationEmail(savedUser, verificationToken);
        } catch (Exception ex) {
            org.slf4j.LoggerFactory.getLogger(AuthService.class)
                .warn("Failed to send verification email for user {}: {}", savedUser.getEmail(), ex.getMessage());
        }

        if (isSafeToBypass()) {
            savedUser.setEmailVerified(true);
            savedUser.setVerificationToken(null);
            savedUser.setVerificationTokenExpiresAt(null);
            savedUser = userRepository.save(savedUser);
        }

        String token = savedUser.isEmailVerified()
                ? jwtUtil.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getTokenVersion())
                : null;
        return toAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        String email = normalizeEmail(request.getEmail());
        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        if (!user.isEmailVerified()) {
            if (isSafeToBypass()) {
                user.setEmailVerified(true);
                user.setVerificationToken(null);
                user.setVerificationTokenExpiresAt(null);
                user = userRepository.save(user);
            } else {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email not verified");
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
        return toAuthResponse(user, token);
    }

    public Map<String, String> logout() {
        return Map.of("message", "Logged out successfully");
    }

    public Map<String, String> forgotPassword(String email) {
        if (isBlank(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        String normalizedEmail = normalizeEmail(email);
        userRepository.findByEmail(normalizedEmail).ifPresent(user -> {
            String token = generateResetToken();
            user.setResetToken(hashToken(token));
            user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            String resetLink = appFrontendResetUrl
                    + "?email=" + encodeQueryValue(normalizedEmail)
                    + "&token=" + encodeQueryValue(token);
            // NOTE: Do not log the reset link or token — it is a sensitive credential.
            // A structured event log (e.g., "Password reset email queued for user") is acceptable.

            EmailRequest request = new EmailRequest();
            request.setTo(user.getEmail());
            request.setType(EmailType.PASSWORD_RESET);
            request.setContext(Map.of(
                    "name", user.getName() == null ? "Customer" : user.getName(),
                    "resetLink", resetLink));

            try {
                notificationService.sendEmail(request);
            } catch (Exception ex) {
                // Keep the flow usable locally even if SMTP is not available.
                org.slf4j.LoggerFactory.getLogger(AuthService.class)
                    .warn("Failed to send password reset email to {}: {}", user.getEmail(), ex.getMessage(), ex);
            }
        });

        return Map.of("message", "If the email exists, a password reset link has been sent");
    }

    public Map<String, String> resetPassword(String email, String token, String newPassword) {
        if (isBlank(email) || isBlank(token) || isBlank(newPassword)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request or token");
        }

        String normalizedEmail = normalizeEmail(email);
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request or token");
        }

        String hashedTokenInput = hashToken(token);
        if (user.getResetToken() == null || !java.security.MessageDigest.isEqual(
                user.getResetToken().getBytes(StandardCharsets.UTF_8),
                hashedTokenInput.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request or token");
        }

        if (user.getResetTokenExpiresAt() == null || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid request or token");
        }

        validatePasswordPolicy(newPassword);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        user.setTokenVersion(user.getTokenVersion() != null ? user.getTokenVersion() + 1 : 1);
        userRepository.save(user);

        return Map.of("message", "Password reset successfully");
    }

    public AuthResponse getProfile(String email) {
        if (isBlank(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        User user =
                userRepository
                        .findByEmail(normalizeEmail(email))
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "User not found"));
        return toAuthResponse(user, null);
    }

    public void verifyEmail(String token) {
        if (isBlank(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token");
        }

        String hashedToken = hashToken(token);
        User user = userRepository
                .findByVerificationToken(hashedToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token"));

        LocalDateTime expiresAt = user.getVerificationTokenExpiresAt();
        if (expiresAt == null || expiresAt.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification token expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiresAt(null);
        userRepository.save(user);
    }

    public AuthResponse updateProfile(String email, Map<String, String> updates) {
        if (isBlank(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        User user =
                userRepository
                        .findByEmail(normalizeEmail(email))
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "User not found"));

        if (updates != null) {
            String newName = updates.get("name");
            if (!isBlank(newName)) {
                user.setName(newName);
            }

            String newPassword = updates.get("password");
            if (!isBlank(newPassword)) {
                validatePasswordPolicy(newPassword);
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setTokenVersion(user.getTokenVersion() != null ? user.getTokenVersion() + 1 : 1);
            }
        }

        User savedUser = userRepository.save(user);
        return toAuthResponse(savedUser, null);
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return new AuthResponse(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name());
    }

    private UserRole parseRole(String role) {
        if (isBlank(role)) {
            return UserRole.CUSTOMER;
        }
        try {
            return UserRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private boolean isSmtpConfigured() {
        return smtpProperties != null
                && smtpProperties.getHost() != null
                && !smtpProperties.getHost().isBlank()
                && smtpProperties.getUsername() != null
                && !smtpProperties.getUsername().isBlank()
                && smtpProperties.getPassword() != null
                && !smtpProperties.getPassword().isBlank()
                && smtpProperties.getFrom() != null
                && !smtpProperties.getFrom().isBlank();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String generateResetToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String encodeQueryValue(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private void sendVerificationEmail(User user, String token) {
        if (user == null || isBlank(user.getEmail()) || isBlank(token)) {
            return;
        }

        String verificationLink = appBaseUrl + "/api/auth/verify-email?token=" + token;

        EmailRequest request = new EmailRequest();
        request.setTo(user.getEmail());
        request.setType(EmailType.EMAIL_VERIFICATION);
        request.setContext(Map.of(
                "name", user.getName() == null ? "Customer" : user.getName(),
                "verificationLink", verificationLink));
        notificationService.sendEmail(request);
    }

    private void validatePasswordPolicy(String password) {
        if (password == null || password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        if (password.length() > 128) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must not exceed 128 characters");
        }
    }

    private String hashToken(String token) {
        if (token == null) return null;
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to hash token", ex);
        }
    }

    public AuthResponse exchangeOauthCode(String code) {
        return oauthCodeStore.exchange(code);
    }
}
