package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.service.SystemService;
import com.foodorderapplication.backend.util.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
public class SystemController {
    private static final Logger logger = LoggerFactory.getLogger(SystemController.class);

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health(HttpServletRequest request) {
        logger.info("Health check requested");
        ApiResponse response = ApiResponse.ok("Service is healthy", systemService.getHealth(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/config")
    public ResponseEntity<ApiResponse> config(HttpServletRequest request) {
        logger.info("Config requested");
        ApiResponse response = ApiResponse.ok("Configuration", systemService.getConfig(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
}
