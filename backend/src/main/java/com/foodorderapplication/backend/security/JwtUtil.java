package com.foodorderapplication.backend.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String HMAC_ALGO = "HmacSHA256";

    @Value("${jwt.secret:change-this-secret-for-prod}")
    private String secret;

    @Value("${jwt.expiration-ms:3600000}")
    private long expirationMs;

    public String generateToken(String subject, String role) {
        long nowSeconds = Instant.now().getEpochSecond();
        long expSeconds = nowSeconds + (expirationMs / 1000);

        Map<String, Object> header = new HashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new HashMap<>();
        payload.put("sub", subject);
        payload.put("role", role);
        payload.put("iat", nowSeconds);
        payload.put("exp", expSeconds);

        String headerPart = base64UrlEncode(toJsonBytes(header));
        String payloadPart = base64UrlEncode(toJsonBytes(payload));
        String signature = sign(headerPart + "." + payloadPart);

        return headerPart + "." + payloadPart + "." + signature;
    }

    public boolean validateToken(String token) {
        try {
            Map<String, Object> claims = getAllClaims(token);
            Object exp = claims.get("exp");
            if (exp instanceof Number) {
                long expSeconds = ((Number) exp).longValue();
                return Instant.now().getEpochSecond() <= expSeconds;
            }
            return false;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getSubject(String token) {
        return String.valueOf(getAllClaims(token).get("sub"));
    }

    public String getRole(String token) {
        Object role = getAllClaims(token).get("role");
        return role == null ? null : String.valueOf(role);
    }

    private Map<String, Object> getAllClaims(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid JWT format");
        }

        String headerPart = parts[0];
        String payloadPart = parts[1];
        String signaturePart = parts[2];
        String expectedSignature = sign(headerPart + "." + payloadPart);

        if (!MessageDigest.isEqual(
                signaturePart.getBytes(StandardCharsets.UTF_8),
                expectedSignature.getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Invalid JWT signature");
        }

        byte[] payloadJson = base64UrlDecode(payloadPart);
        try {
            return OBJECT_MAPPER.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            throw new IllegalArgumentException("Unable to parse JWT payload", ex);
        }
    }

    private byte[] toJsonBytes(Map<String, Object> map) {
        try {
            return OBJECT_MAPPER.writeValueAsBytes(map);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to serialize JWT", ex);
        }
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGO));
            byte[] signatureBytes = mac.doFinal(content.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(signatureBytes);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign JWT", ex);
        }
    }

    private String base64UrlEncode(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private byte[] base64UrlDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }
}
