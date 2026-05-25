package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.model.Payment;
import com.foodorderapplication.backend.model.PaymentMethod;
import com.foodorderapplication.backend.service.PaymentService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<Payment> initiate(@RequestBody Map<String, Object> body) {
        Long orderId = ((Number) body.get("orderId")).longValue();
        PaymentMethod method = PaymentMethod.valueOf(((String) body.get("method")).toUpperCase());
        Payment p = paymentService.initiatePayment(orderId, method);
        return ResponseEntity.ok(p);
    }

    @PostMapping("/api/payments/verify")
    public ResponseEntity<Payment> verify(@RequestBody Map<String, Object> body) {
        Long paymentId = ((Number) body.get("paymentId")).longValue();
        boolean success = Boolean.TRUE.equals(body.get("success")) || (body.get("success") instanceof Boolean && (Boolean) body.get("success"));
        Payment p = paymentService.verifyPayment(paymentId, success);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/api/payments/{orderId}")
    public ResponseEntity<List<Payment>> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsForOrder(orderId));
    }
}
