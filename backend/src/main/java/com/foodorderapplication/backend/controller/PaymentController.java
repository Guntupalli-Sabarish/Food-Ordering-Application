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

    @PostMapping("/api/customer/payments/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> initiate(Authentication authentication, @RequestBody Map<String, Object> body) {
        Long orderId = parseLong(body.get("orderId"));
        com.foodorderapplication.backend.model.enums.PaymentMethod method =
            com.foodorderapplication.backend.model.enums.PaymentMethod.valueOf(((String) body.get("method")).toUpperCase());
        Payment p = paymentService.initiatePayment(authentication.getName(), orderId, method);
        return ResponseEntity.ok(p);
    }

    @PostMapping("/api/customer/payments/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> verify(Authentication authentication, @RequestBody Map<String, Object> body) {
        Long paymentId = parseLong(body.get("paymentId"));
        Payment p = paymentService.verifyPayment(authentication.getName(), paymentId);
        return ResponseEntity.ok(p);
    }

    private Long parseLong(Object obj) {
        if (obj == null) {
            throw new IllegalArgumentException("Required parameter is missing");
        }
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        }
        return Long.parseLong(obj.toString());
    }

    @GetMapping("/api/customer/payments/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Payment>> getByOrder(Authentication authentication, @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsForOrder(authentication.getName(), orderId));
    }
}
