package com.foodorderapplication.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SmtpProperties {
    @Value("${smtp.host:}")
    private String host;

    @Value("${smtp.port:587}")
    private int port;

    @Value("${smtp.username:}")
    private String username;

    @Value("${smtp.password:}")
    private String password;

    @Value("${smtp.from:}")
    private String from;

    @Value("${smtp.ssl:false}")
    private boolean ssl;

    @Value("${smtp.starttls:true}")
    private boolean starttls;

    @Value("${smtp.timeoutMs:10000}")
    private int timeoutMs;

    public String getHost() {
        return host;
    }

    public int getPort() {
        return port;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getFrom() {
        return from;
    }

    public boolean isSsl() {
        return ssl;
    }

    public boolean isStarttls() {
        return starttls;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }
}
