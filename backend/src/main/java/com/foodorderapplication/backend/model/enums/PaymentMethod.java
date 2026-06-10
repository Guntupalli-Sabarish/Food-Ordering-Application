package com.foodorderapplication.backend.model.enums;

public enum PaymentMethod {
    CARD,
    /** Cash on Delivery — canonical name. */
    COD,
    /** Legacy alias for Cash on Delivery kept for backward compatibility. */
    CASH,
    UPI,
    WALLET;

    /**
     * Case-insensitive normalizer: accepts "cod", "COD", "cash", "CASH", "card", "upi", "wallet".
     * Throws {@link org.springframework.web.server.ResponseStatusException} 400 for unrecognised values.
     */
    public static PaymentMethod fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Payment method is required");
        }
        String upper = value.trim().toUpperCase();
        // Normalize legacy CASH -> COD
        if ("CASH".equals(upper)) {
            return COD;
        }
        try {
            return PaymentMethod.valueOf(upper);
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Unsupported payment method '" + value + "'. Accepted: COD, CARD, UPI, WALLET");
        }
    }
}
