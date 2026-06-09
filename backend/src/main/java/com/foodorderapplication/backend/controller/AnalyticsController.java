package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.model.enums.UserRole;
import com.foodorderapplication.backend.service.AnalyticsService;
import com.foodorderapplication.backend.util.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
public class AnalyticsController {
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/superadmin/analytics/overview")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> superAdminOverview(HttpServletRequest request) {
        logger.info("Super admin analytics overview requested by user with role {}", UserRole.SUPER_ADMIN);
        ApiResponse response = ApiResponse.ok("Overview data", analyticsService.getSuperAdminOverview(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin/analytics/revenue")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> superAdminRevenue(HttpServletRequest request) {
        logger.info("Super admin analytics revenue requested by user with role {}", UserRole.SUPER_ADMIN);
        ApiResponse response = ApiResponse.ok("Revenue data", analyticsService.getSuperAdminRevenue(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin/analytics/users")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> superAdminUsers(HttpServletRequest request) {
        logger.info("Super admin analytics users requested by user with role {}", UserRole.SUPER_ADMIN);
        ApiResponse response = ApiResponse.ok("User analytics", analyticsService.getSuperAdminUsers(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin/analytics/orders")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse> superAdminOrders(HttpServletRequest request) {
        logger.info("Super admin analytics orders requested by user with role {}", UserRole.SUPER_ADMIN);
        ApiResponse response = ApiResponse.ok("Order analytics", analyticsService.getSuperAdminOrders(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/analytics/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> adminRevenue(Authentication authentication, HttpServletRequest request) {
        logger.info("Admin analytics revenue requested by user with role {}", UserRole.ADMIN);
        ApiResponse response = ApiResponse.ok("Revenue data", analyticsService.getAdminRevenue(authentication.getName()), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/analytics/top-items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> adminTopItems(Authentication authentication, HttpServletRequest request) {
        logger.info("Admin analytics top items requested by user with role {}", UserRole.ADMIN);
        ApiResponse response = ApiResponse.ok("Top items", analyticsService.getAdminTopItems(authentication.getName()), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
}
