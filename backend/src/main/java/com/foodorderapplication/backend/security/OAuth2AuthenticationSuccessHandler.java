package com.foodorderapplication.backend.security;

import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.model.enums.UserRole;
import com.foodorderapplication.backend.repository.UserRepository;
import com.foodorderapplication.backend.dto.auth.AuthResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OauthCodeStore oauthCodeStore;

    @Value("${app.frontend.login-url:http://localhost:5173/login}")
    private String frontendLoginUrl;

    public OAuth2AuthenticationSuccessHandler(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, OauthCodeStore oauthCodeStore) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.oauthCodeStore = oauthCodeStore;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        if (response.isCommitted()) {
            return;
        }

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        if (email == null) {
            response.sendRedirect(frontendLoginUrl + "?error=" + encode("Email not found from Google provider"));
            return;
        }

        String normalizedEmail = email.trim().toLowerCase();
        java.util.Optional<User> existingUser = userRepository.findByEmail(normalizedEmail);
        boolean isNewUser = existingUser.isEmpty();
        User user = existingUser.orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(normalizedEmail);
            newUser.setName(name != null ? name : "Google User");
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString())); // set safe random password
            newUser.setRole(UserRole.CUSTOMER);
            newUser.setEmailVerified(true);
            return userRepository.save(newUser);
        });

        String jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
        AuthResponse authResponse = new AuthResponse(
            jwt,
            user.getUserId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
        String tempCode = oauthCodeStore.generateCode(authResponse);

        String redirectUrl = frontendLoginUrl 
            + "?code=" + encode(tempCode)
            + "&isNew=" + isNewUser;

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }

    private String encode(String value) {
        if (value == null) return "";
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
