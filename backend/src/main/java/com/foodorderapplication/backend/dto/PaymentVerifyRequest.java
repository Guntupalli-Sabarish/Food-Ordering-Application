package com.foodorderapplication.backend.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentVerifyRequest {

    @NotNull(message = "Payment ID is required")
    private Long paymentId;

    public PaymentVerifyRequest() {}

    public PaymentVerifyRequest(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }
}
