package com.foodorderapplication.backend.util;

import java.time.Instant;

public class ApiResponse {
    private final boolean success;
    private final String message;
    private final Object data;
    private final Instant timestamp;
    private final String path;
    private final int status;

    private ApiResponse(boolean success, String message, Object data, String path, int status) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = Instant.now();
        this.path = path;
        this.status = status;
    }

    public static ApiResponse ok(String message, Object data, String path, int status) {
        return new ApiResponse(true, message, data, path, status);
    }

    public static ApiResponse error(String message, Object data, String path, int status) {
        return new ApiResponse(false, message, data, path, status);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public Object getData() {
        return data;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getPath() {
        return path;
    }

    public int getStatus() {
        return status;
    }
}
