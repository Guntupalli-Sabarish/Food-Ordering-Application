package com.foodorderapplication.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final int MAX_REQUESTS = 10;
    private static final long TIME_WINDOW_MS = 60000;

    private final Map<String, RequestTracker> limiters = new ConcurrentHashMap<>();

    private static class RequestTracker {
        int count = 0;
        long resetTime = System.currentTimeMillis() + TIME_WINDOW_MS;

        synchronized boolean tryAcquire() {
            long now = System.currentTimeMillis();
            if (now > resetTime) {
                count = 0;
                resetTime = now + TIME_WINDOW_MS;
            }
            if (count < MAX_REQUESTS) {
                count++;
                return true;
            }
            return false;
        }
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        
        if (path.startsWith("/api/auth/login") ||
            path.startsWith("/api/auth/forgot-password") ||
            path.startsWith("/api/auth/reset-password")) {
            
            String ip = getClientIp(request);
            RequestTracker tracker = limiters.computeIfAbsent(ip, k -> new RequestTracker());
            
            if (!tracker.tryAcquire()) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many requests. Please try again in a minute.\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
