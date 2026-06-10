package com.foodorderapplication.backend.dto;

/**
 * Typed request body for POST /api/customer/payments/initiate.
 * Replaces the raw {@code Map<String, Object>} previously accepted.
 */
public class PaymentInitiateRequest {
    private Long orderId;
    private String method;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }
}
