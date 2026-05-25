package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.model.Payment;
import com.foodorderapplication.backend.service.PaymentService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/api/payments/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> initiate(Authentication authentication, @RequestBody Map<String, Object> body) {
        Long orderId = ((Number) body.get("orderId")).longValue();
        com.foodorderapplication.backend.model.enums.PaymentMethod method =
            com.foodorderapplication.backend.model.enums.PaymentMethod.valueOf(((String) body.get("method")).toUpperCase());
        Payment p = paymentService.initiatePayment(authentication.getName(), orderId, method);
        return ResponseEntity.ok(p);
    }

    @PostMapping("/api/payments/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> verify(Authentication authentication, @RequestBody Map<String, Object> body) {
        Long paymentId = ((Number) body.get("paymentId")).longValue();
        boolean success = Boolean.TRUE.equals(body.get("success")) || (body.get("success") instanceof Boolean && (Boolean) body.get("success"));
        Payment p = paymentService.verifyPayment(authentication.getName(), paymentId, success);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/api/payments/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Payment>> getByOrder(Authentication authentication, @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsForOrder(authentication.getName(), orderId));
    }
}
