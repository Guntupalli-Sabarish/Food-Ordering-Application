package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.auth.AuthResponse;
import com.foodorderapplication.backend.dto.auth.LoginRequest;
import com.foodorderapplication.backend.dto.auth.RegisterRequest;
import com.foodorderapplication.backend.dto.auth.ForgotPasswordRequest;
import com.foodorderapplication.backend.dto.auth.ResetPasswordRequest;
import com.foodorderapplication.backend.dto.auth.OAuth2ExchangeRequest;
import com.foodorderapplication.backend.dto.auth.UpdateProfileRequest;
import com.foodorderapplication.backend.service.AuthService;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @Value("${app.frontend.login-url:http://localhost:5173/login}")
    private String frontendLoginUrl;

    @Value("${app.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${app.cookie.samesite:Lax}")
    private String cookieSameSite;

    @Value("${app.cookie.domain:}")
    private String cookieDomain;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.register(request);
        // Set HttpOnly cookie when email is already verified (dev bypass or immediate session)
        if (auth.getToken() != null) {
            setTokenCookie(auth.getToken(), response);
        }
        // Strip token from body — session is cookie-based
        AuthResponse body = new AuthResponse(null, auth.getUserId(), auth.getName(), auth.getEmail(), auth.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse auth = authService.login(request);
        setTokenCookie(auth.getToken(), response);
        // Strip token from body — session is cookie-based
        AuthResponse body = new AuthResponse(null, auth.getUserId(), auth.getName(), auth.getEmail(), auth.getRole());
        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        clearTokenCookie(response);
        return ResponseEntity.ok(authService.logout());
    }

    @PostMapping("/oauth2/exchange")
    public ResponseEntity<AuthResponse> oauth2Exchange(@jakarta.validation.Valid @RequestBody OAuth2ExchangeRequest body, HttpServletResponse response) {
        String code = body.getCode();
        AuthResponse auth = authService.exchangeOauthCode(code);
        if (auth == null || auth.getToken() == null) {
            throw new org.springframework.web.server.ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired authorization code");
        }
        
        setTokenCookie(auth.getToken(), response);
        
        AuthResponse secureResponse = new AuthResponse(
            null,
            auth.getUserId(),
            auth.getName(),
            auth.getEmail(),
            auth.getRole()
        );
        return ResponseEntity.ok(secureResponse);
    }

    private void setTokenCookie(String token, HttpServletResponse response) {
        if (token == null) return;
        String sameSiteStr = (cookieSameSite == null || cookieSameSite.isBlank()) ? "" : "; SameSite=" + cookieSameSite;
        String domainStr = (cookieDomain == null || cookieDomain.isBlank()) ? "" : "; Domain=" + cookieDomain;
        String secureStr = cookieSecure ? "; Secure" : "";
        String cookieHeader = String.format(
                "token=%s; Path=/; HttpOnly%s%s%s; Max-Age=604800", token, secureStr, sameSiteStr, domainStr);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    private void clearTokenCookie(HttpServletResponse response) {
        String sameSiteStr = (cookieSameSite == null || cookieSameSite.isBlank()) ? "" : "; SameSite=" + cookieSameSite;
        String domainStr = (cookieDomain == null || cookieDomain.isBlank()) ? "" : "; Domain=" + cookieDomain;
        String secureStr = cookieSecure ? "; Secure" : "";
        String cookieHeader = String.format(
                "token=; Path=/; HttpOnly%s%s%s; Max-Age=0", secureStr, sameSiteStr, domainStr);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@jakarta.validation.Valid @RequestBody ForgotPasswordRequest body) {
        return ResponseEntity.ok(authService.forgotPassword(body.getEmail()));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@jakarta.validation.Valid @RequestBody ResetPasswordRequest body) {
        return ResponseEntity.ok(
                authService.resetPassword(body.getEmail(), body.getToken(), body.getNewPassword()));
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> profile(Authentication authentication) {
        return ResponseEntity.ok(authService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile/update")
    public ResponseEntity<AuthResponse> updateProfile(
            Authentication authentication, @jakarta.validation.Valid @RequestBody UpdateProfileRequest body) {
        return ResponseEntity.ok(authService.updateProfile(authentication.getName(), body));
    }

    @GetMapping("/verify-email")
    public void verifyEmail(String token, HttpServletResponse response) throws Exception {
        authService.verifyEmail(token);
        String redirectUrl = frontendLoginUrl + "?verified=true";
        response.sendRedirect(redirectUrl);
    }
}
