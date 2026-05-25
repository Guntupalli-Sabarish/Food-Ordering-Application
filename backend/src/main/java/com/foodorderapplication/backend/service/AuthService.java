package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.auth.AuthResponse;
import com.foodorderapplication.backend.dto.auth.LoginRequest;
import com.foodorderapplication.backend.dto.auth.RegisterRequest;
import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.model.enums.UserRole;
import com.foodorderapplication.backend.repository.UserRepository;
import com.foodorderapplication.backend.security.JwtUtil;
import com.foodorderapplication.backend.util.EmailRequest;
import com.foodorderapplication.backend.util.EmailType;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
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
    private final Map<String, String> resetTokens = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.notificationService = notificationService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(parseRole(request.getRole()));
        user.setEmailVerified(false);
        String verificationToken = generateResetToken();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiresAt(LocalDateTime.now().plusHours(24));

        User savedUser = userRepository.save(user);
        sendVerificationEmail(savedUser, verificationToken);
        return toAuthResponse(savedUser, null);
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
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Email not verified");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
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
        return userRepository
                .findByEmail(normalizedEmail)
                .map(
                        user -> {
                            String token = generateResetToken();
                            resetTokens.put(normalizedEmail, token);
                            return Map.of(
                                    "message",
                                    "Password reset token generated",
                                    "resetToken",
                                    token);
                        })
                .orElseGet(() -> Map.of("message", "Password reset token generated"));
    }

    public Map<String, String> resetPassword(String email, String token, String newPassword) {
        if (isBlank(email) || isBlank(token) || isBlank(newPassword)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email, token, and new password are required");
        }

        String normalizedEmail = normalizeEmail(email);
        String expectedToken = resetTokens.get(normalizedEmail);
        if (expectedToken == null || !expectedToken.equals(token)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid reset token");
        }

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.NOT_FOUND, "User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetTokens.remove(normalizedEmail);

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

        User user = userRepository
                .findByVerificationToken(token)
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
                user.setPassword(passwordEncoder.encode(newPassword));
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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String generateResetToken() {
        byte[] bytes = new byte[24];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
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
}
