package com.foodorderapplication.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.InetAddress;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * IP-based sliding-window rate limiter for sensitive auth endpoints.
 *
 * <p>Design decisions:
 * <ul>
 *   <li>X-Forwarded-For is trusted <em>only</em> when the TCP source address ({@code remoteAddr})
 *       matches a configured trusted-proxy CIDR/IP list. Otherwise {@code remoteAddr} is used
 *       directly, preventing IP spoofing via forged headers.</li>
 *   <li>Rate limits are keyed by {@code route:clientIp} so login, forgot-password, and
 *       reset-password each have independent counters and can be tuned independently.</li>
 *   <li>The key map is bounded to {@code MAX_ENTRIES} entries and is swept every
 *       {@code SWEEP_INTERVAL_SECONDS} by a background daemon thread, preventing unbounded growth
 *       from legitimate high-volume or scanning traffic.</li>
 * </ul>
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    // Per-route limits (requests / window)
    private static final int    LOGIN_MAX          = 10;
    private static final int    FORGOT_MAX         = 5;
    private static final int    RESET_MAX          = 5;
    private static final long   TIME_WINDOW_MS     = 60_000L;

    // Map size guard — entries are also swept by the background thread
    private static final int    MAX_ENTRIES        = 50_000;
    private static final long   SWEEP_INTERVAL_SECONDS = 120;

    private final Map<String, RequestTracker> limiters = new ConcurrentHashMap<>();
    private final ScheduledExecutorService sweeper =
            Executors.newSingleThreadScheduledExecutor(r -> {
                Thread t = new Thread(r, "rate-limit-sweeper");
                t.setDaemon(true);
                return t;
            });

    /**
     * Comma-separated list of trusted proxy IPs/CIDRs.
     * Default: loopback only (safe for direct-to-app deployments).
     * Set {@code APP_TRUSTED_PROXIES=10.0.0.0/8,172.16.0.0/12} when behind a load balancer.
     */
    @Value("${app.security.trusted-proxies:127.0.0.1,::1,0:0:0:0:0:0:0:1}")
    private String trustedProxiesRaw;

    private List<IpMatcher> trustedProxies;

    @jakarta.annotation.PostConstruct
    void init() {
        trustedProxies = java.util.Arrays.stream(trustedProxiesRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(IpMatcher::new)
                .toList();
        sweeper.scheduleAtFixedRate(
                this::sweepExpiredEntries,
                SWEEP_INTERVAL_SECONDS,
                SWEEP_INTERVAL_SECONDS,
                TimeUnit.SECONDS);
    }

    @jakarta.annotation.PreDestroy
    void shutdown() {
        sweeper.shutdownNow();
    }

    // ── route descriptors ────────────────────────────────────────────────────

    private record RouteLimit(String prefix, int maxRequests) {}

    private static final RouteLimit[] ROUTES = {
        new RouteLimit("/api/auth/login",            LOGIN_MAX),
        new RouteLimit("/api/auth/forgot-password",  FORGOT_MAX),
        new RouteLimit("/api/auth/reset-password",   RESET_MAX),
    };

    // ── filter ───────────────────────────────────────────────────────────────

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        for (RouteLimit route : ROUTES) {
            if (path.startsWith(route.prefix())) {
                String clientIp = resolveClientIp(request);
                String key = route.prefix() + ":" + clientIp;

                if (limiters.size() >= MAX_ENTRIES) {
                    // Safety valve: when map is full, sweep first
                    sweepExpiredEntries();
                }

                RequestTracker tracker = limiters.computeIfAbsent(key, k -> new RequestTracker(route.maxRequests()));

                if (!tracker.tryAcquire()) {
                    log.warn("Rate limit exceeded for route={} ip={}", route.prefix(), clientIp);
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Too many requests. Please try again in a minute.\"}");
                    return;
                }
                break; // matched — no need to check other routes
            }
        }

        filterChain.doFilter(request, response);
    }

    // ── IP resolution ────────────────────────────────────────────────────────

    /**
     * Returns the real client IP.
     * Reads X-Forwarded-For only when the immediate TCP peer (remoteAddr) is a known trusted proxy.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String remoteAddr = request.getRemoteAddr();
        String xff = request.getHeader("X-Forwarded-For");
        if (xff == null || xff.isBlank()) {
            return remoteAddr;
        }

        String[] ips = xff.split(",");
        String currentIp = remoteAddr;

        // Traverse the X-Forwarded-For list from right to left
        for (int i = ips.length - 1; i >= 0; i--) {
            if (isTrustedProxy(currentIp)) {
                currentIp = ips[i].trim();
            } else {
                break;
            }
        }
        return currentIp;
    }

    private boolean isTrustedProxy(String addr) {
        if (addr == null) return false;
        String normalized = addr.replaceAll("[\\[\\]]", "").trim();
        return trustedProxies.stream().anyMatch(matcher -> matcher.matches(normalized));
    }

    // ── sweep ────────────────────────────────────────────────────────────────

    private void sweepExpiredEntries() {
        try {
            long now = System.currentTimeMillis();
            Iterator<Map.Entry<String, RequestTracker>> it = limiters.entrySet().iterator();
            int removed = 0;
            while (it.hasNext()) {
                RequestTracker t = it.next().getValue();
                if (t.isExpired(now)) {
                    it.remove();
                    removed++;
                }
            }
            if (removed > 0) {
                log.debug("Rate-limit sweep removed {} expired entries; {} remaining", removed, limiters.size());
            }
        } catch (Exception ex) {
            log.error("Rate-limit sweep failed", ex);
        }
    }

    // ── tracker ──────────────────────────────────────────────────────────────

    private static final class RequestTracker {
        private final int maxRequests;
        private int count = 0;
        private long resetTime = System.currentTimeMillis() + TIME_WINDOW_MS;

        RequestTracker(int maxRequests) {
            this.maxRequests = maxRequests;
        }

        synchronized boolean tryAcquire() {
            long now = System.currentTimeMillis();
            if (now > resetTime) {
                count = 0;
                resetTime = now + TIME_WINDOW_MS;
            }
            if (count < maxRequests) {
                count++;
                return true;
            }
            return false;
        }

        synchronized boolean isExpired(long now) {
            return now > resetTime;
        }
    }

    private static class IpMatcher {
        private final java.net.InetAddress requiredAddress;
        private final int prefixLength;

        public IpMatcher(String ipAddress) {
            String[] parts = ipAddress.split("/");
            String baseIp = parts[0];
            try {
                this.requiredAddress = java.net.InetAddress.getByName(baseIp);
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid IP address: " + baseIp, e);
            }
            if (parts.length > 1) {
                this.prefixLength = Integer.parseInt(parts[1]);
                if (prefixLength < 0 || prefixLength > (requiredAddress.getAddress().length * 8)) {
                    throw new IllegalArgumentException("Invalid prefix length: " + parts[1]);
                }
            } else {
                this.prefixLength = requiredAddress.getAddress().length * 8;
            }
        }

        public boolean matches(String clientIp) {
            try {
                java.net.InetAddress address = java.net.InetAddress.getByName(clientIp);
                if (requiredAddress.getClass() != address.getClass()) {
                    return false;
                }
                byte[] requiredBytes = requiredAddress.getAddress();
                byte[] addressBytes = address.getAddress();

                int bitCount = prefixLength;
                for (int i = 0; i < requiredBytes.length && bitCount > 0; i++) {
                    int mask = 0xFF;
                    if (bitCount < 8) {
                        mask = (mask << (8 - bitCount)) & 0xFF;
                        bitCount = 0;
                    } else {
                        bitCount -= 8;
                    }
                    if ((requiredBytes[i] & mask) != (addressBytes[i] & mask)) {
                        return false;
                    }
                }
                return true;
            } catch (Exception e) {
                return false;
            }
        }
    }
}
