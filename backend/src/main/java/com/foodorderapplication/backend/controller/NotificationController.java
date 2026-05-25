package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.service.NotificationService;
import com.foodorderapplication.backend.util.ApiResponse;
import com.foodorderapplication.backend.util.EmailRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send-email")
    public ResponseEntity<ApiResponse> sendEmail(@RequestBody EmailRequest request, HttpServletRequest httpRequest) {
        logger.info("Send email request received");
        ApiResponse response = ApiResponse.ok(
                "Email sent",
                notificationService.sendEmail(request),
                httpRequest.getRequestURI(),
                HttpStatus.OK.value()
        );
        return ResponseEntity.ok(response);
    }
}
