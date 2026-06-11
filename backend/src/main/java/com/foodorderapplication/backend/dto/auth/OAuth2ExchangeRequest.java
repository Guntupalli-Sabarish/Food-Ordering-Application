package com.foodorderapplication.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;

public class OAuth2ExchangeRequest {

    @NotBlank(message = "Authorization code is required")
    private String code;

    public OAuth2ExchangeRequest() {}

    public OAuth2ExchangeRequest(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
