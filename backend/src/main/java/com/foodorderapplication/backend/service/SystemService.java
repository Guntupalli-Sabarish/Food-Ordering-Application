package com.foodorderapplication.backend.service;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class SystemService {
    private final Environment environment;
    private final Instant startTime;

    public SystemService(Environment environment) {
        this.environment = environment;
        this.startTime = Instant.now();
    }

    public Map<String, Object> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("uptimeSeconds", Duration.between(startTime, Instant.now()).getSeconds());
        health.put("jvm", getJvmInfo());
        return health;
    }

    public Map<String, Object> getConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("applicationName", environment.getProperty("spring.application.name", "backend"));
        config.put("javaVersion", System.getProperty("java.version"));
        config.put("timezone", System.getProperty("user.timezone"));
        config.put("serverPort", environment.getProperty("server.port", "8080"));
        return config;
    }

    private Map<String, Object> getJvmInfo() {
        Map<String, Object> jvm = new HashMap<>();
        Runtime runtime = Runtime.getRuntime();
        jvm.put("freeMemory", runtime.freeMemory());
        jvm.put("totalMemory", runtime.totalMemory());
        jvm.put("maxMemory", runtime.maxMemory());
        jvm.put("startTime", ManagementFactory.getRuntimeMXBean().getStartTime());
        return jvm;
    }
}
