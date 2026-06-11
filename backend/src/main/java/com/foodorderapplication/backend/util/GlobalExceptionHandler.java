package com.foodorderapplication.backend.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.http.HttpServletRequest;


public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        logger.warn("Bad request: {}", ex.getMessage());
        ApiResponse response = ApiResponse.error(ex.getMessage(), null, request.getRequestURI(), HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiResponse> handleResponseStatus(ResponseStatusException ex, HttpServletRequest request) {
        logger.warn("Status error: {}", ex.getReason());
        int statusCode = ex.getStatusCode() != null ? ex.getStatusCode().value() : HttpStatus.INTERNAL_SERVER_ERROR.value();
        String message = ex.getReason() != null ? ex.getReason() : ex.getMessage();
        ApiResponse response = ApiResponse.error(message, null, request.getRequestURI(), statusCode);
        return ResponseEntity.status(statusCode).body(response);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse> handleIllegalState(IllegalStateException ex, HttpServletRequest request) {
        logger.warn("Illegal state: {}", ex.getMessage());
        ApiResponse response = ApiResponse.error(ex.getMessage(), null, request.getRequestURI(), HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        StringBuilder sb = new StringBuilder("Validation failed: ");
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            sb.append("[").append(error.getField()).append(": ").append(error.getDefaultMessage()).append("] ")
        );
        String message = sb.toString().trim();
        logger.warn("Validation failed: {}", message);
        ApiResponse response = ApiResponse.error(message, null, request.getRequestURI(), HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse> handleMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex, HttpServletRequest request) {
        logger.warn("Malformed JSON request: {}", ex.getMessage());
        ApiResponse response = ApiResponse.error("Malformed JSON request body", null, request.getRequestURI(), HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse> handleTypeMismatch(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        logger.warn("Type mismatch: {}", ex.getMessage());
        String typeName = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown";
        String message = String.format("Parameter '%s' should be of type %s", ex.getName(), typeName);
        ApiResponse response = ApiResponse.error(message, null, request.getRequestURI(), HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler({AuthorizationDeniedException.class, AccessDeniedException.class})
    public ResponseEntity<ApiResponse> handleAccessDenied(Exception ex, HttpServletRequest request) {
        logger.warn("Access denied: {}", ex.getMessage());
        ApiResponse response = ApiResponse.error("Access denied", null, request.getRequestURI(), HttpStatus.FORBIDDEN.value());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneric(Exception ex, HttpServletRequest request) {
        logger.error("Unhandled error", ex);
        ApiResponse response = ApiResponse.error("Internal server error", null, request.getRequestURI(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
