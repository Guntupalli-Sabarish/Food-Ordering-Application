package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.PaymentInitiateRequest;
import com.foodorderapplication.backend.model.Payment;
import com.foodorderapplication.backend.model.enums.PaymentMethod;
import com.foodorderapplication.backend.service.PaymentService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiate a payment for an order.
     * Uses a typed DTO instead of a raw Map so invalid payloads fail fast at deserialization.
     */
    @PostMapping("/api/customer/payments/initiate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> initiate(Authentication authentication,
            @RequestBody PaymentInitiateRequest body) {
        // fromString() normalizes case and maps CASH→COD; throws 400 for unknown values
        PaymentMethod method = PaymentMethod.fromString(body.getMethod());
        Payment p = paymentService.initiatePayment(authentication.getName(), body.getOrderId(), method);
        return ResponseEntity.ok(p);
    }

    /**
     * Verify a payment with the provider.
     * Currently returns 503 because no real payment provider is integrated.
     */
    @PostMapping("/api/customer/payments/verify")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Payment> verify(Authentication authentication,
            @RequestBody Map<String, Object> body) {
        // Guard: online payment verification is not yet available.
        // Remove this block once a real provider (Stripe/Razorpay) is integrated.
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Online payment verification is not available yet. Please use Cash on Delivery.");
    }

    @GetMapping("/api/customer/payments/{orderId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Payment>> getByOrder(Authentication authentication,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentsForOrder(authentication.getName(), orderId));
    }
}
