package com.foodorderapplication.backend.security;

import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final Environment env;

    @Value("${app.dev.bypass-email-verification:false}")
    private boolean bypassEmailVerification;

    public JwtFilter(JwtUtil jwtUtil, UserRepository userRepository, Environment env) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.env = env;
    }

    private boolean isSafeToBypass() {
        if (!bypassEmailVerification) return false;
        if (env.getActiveProfiles() != null) {
            return !Arrays.asList(env.getActiveProfiles()).contains("prod");
        }
        return true;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            token = header.substring(7);
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("token".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        if (token != null && jwtUtil.validateToken(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
            String email = jwtUtil.getSubject(token);
            java.util.Optional<User> userOpt = userRepository.findByEmail(email != null ? email.trim().toLowerCase() : "");
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                
                boolean isAllowed = user.isEmailVerified() || isSafeToBypass();
                Integer tokenVer = jwtUtil.getTokenVersion(token);
                boolean isVersionValid = tokenVer != null && tokenVer >= user.getTokenVersion();

                if (isAllowed && isVersionValid) {
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    if (user.getRole() != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
                    }

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}
