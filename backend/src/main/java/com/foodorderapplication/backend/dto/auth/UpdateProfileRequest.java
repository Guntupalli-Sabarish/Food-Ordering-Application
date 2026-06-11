package com.foodorderapplication.backend.dto.auth;

import jakarta.validation.constraints.Email;

public class UpdateProfileRequest {

    private String name;

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
