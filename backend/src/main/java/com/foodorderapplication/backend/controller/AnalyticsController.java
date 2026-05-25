package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.service.AnalyticsService;
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
public class AnalyticsController {
    private static final Logger logger = LoggerFactory.getLogger(AnalyticsController.class);

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/superadmin/analytics/overview")
    public ResponseEntity<ApiResponse> superAdminOverview(HttpServletRequest request) {
        logger.info("Super admin analytics overview requested");
        ApiResponse response = ApiResponse.ok("Overview data", analyticsService.getSuperAdminOverview(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin/analytics/revenue")
    public ResponseEntity<ApiResponse> superAdminRevenue(HttpServletRequest request) {
        logger.info("Super admin analytics revenue requested");
        ApiResponse response = ApiResponse.ok("Revenue data", analyticsService.getSuperAdminRevenue(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin/analytics/users")
    public ResponseEntity<ApiResponse> superAdminUsers(HttpServletRequest request) {
        logger.info("Super admin analytics users requested");
        ApiResponse response = ApiResponse.ok("User analytics", analyticsService.getSuperAdminUsers(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/superadmin/analytics/orders")
    public ResponseEntity<ApiResponse> superAdminOrders(HttpServletRequest request) {
        logger.info("Super admin analytics orders requested");
        ApiResponse response = ApiResponse.ok("Order analytics", analyticsService.getSuperAdminOrders(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/analytics/revenue")
    public ResponseEntity<ApiResponse> adminRevenue(HttpServletRequest request) {
        logger.info("Admin analytics revenue requested");
        ApiResponse response = ApiResponse.ok("Revenue data", analyticsService.getAdminRevenue(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/analytics/top-items")
    public ResponseEntity<ApiResponse> adminTopItems(HttpServletRequest request) {
        logger.info("Admin analytics top items requested");
        ApiResponse response = ApiResponse.ok("Top items", analyticsService.getAdminTopItems(), request.getRequestURI(), HttpStatus.OK.value());
        return ResponseEntity.ok(response);
    }
}
