package com.foodorderapplication.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateOrderRequest {

    @NotBlank(message = "Delivery address is required")
    @Size(max = 255, message = "Delivery address cannot exceed 255 characters")
    private String deliveryAddress;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    public CreateOrderRequest() {}

    public CreateOrderRequest(String deliveryAddress, String paymentMethod) {
        this.deliveryAddress = deliveryAddress;
        this.paymentMethod = paymentMethod;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
