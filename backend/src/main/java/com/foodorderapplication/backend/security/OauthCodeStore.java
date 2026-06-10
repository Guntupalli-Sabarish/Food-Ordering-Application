package com.foodorderapplication.backend.security;

import com.foodorderapplication.backend.dto.auth.AuthResponse;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class OauthCodeStore {
    private final Map<String, AuthResponse> store = new ConcurrentHashMap<>();
    private final Map<String, Long> expiry = new ConcurrentHashMap<>();
    
    public String generateCode(AuthResponse authResponse) {
        String code = UUID.randomUUID().toString();
        store.put(code, authResponse);
        expiry.put(code, System.currentTimeMillis() + 300000); // 5 minutes validity
        return code;
    }
    
    public AuthResponse exchange(String code) {
        if (code == null) return null;
        Long exp = expiry.remove(code);
        AuthResponse response = store.remove(code);
        if (exp != null && exp > System.currentTimeMillis()) {
            return response;
        }
        return null;
    }
}
