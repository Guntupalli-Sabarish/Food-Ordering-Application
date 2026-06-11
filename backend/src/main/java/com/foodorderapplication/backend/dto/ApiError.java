package com.foodorderapplication.backend.dto;

import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Standard API error response sent to the client.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private String path;

    public ApiError(HttpStatus status, String message, String path) {
        this.timestamp = Instant.now();
        this.status = status.value();
        this.error = status.getReasonPhrase();
        this.message = message;
        this.path = path;
    }
}
