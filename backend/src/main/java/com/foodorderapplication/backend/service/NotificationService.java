package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.util.EmailRequest;
import com.foodorderapplication.backend.util.EmailType;
import com.foodorderapplication.backend.util.SmtpProperties;
import com.foodorderapplication.backend.util.SmtpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final SmtpClient smtpClient;
    private final SmtpProperties smtpProperties;

    public NotificationService(SmtpClient smtpClient, SmtpProperties smtpProperties) {
        this.smtpClient = smtpClient;
        this.smtpProperties = smtpProperties;
    }

    public Map<String, Object> sendEmail(EmailRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getTo() == null || request.getTo().isBlank()) {
            throw new IllegalArgumentException("Recipient address is required");
        }

        String subject = request.getSubject();
        String body = request.getBody();
        EmailType type = request.getType();

        if ((subject == null || subject.isBlank()) || (body == null || body.isBlank())) {
            Map<String, String> context = request.getContext();
            subject = buildSubject(type, context, subject);
            body = buildBody(type, context, body);
        }

        logger.info("Sending email to {} with type {}", request.getTo(), type);
        Map<String, Object> response = new HashMap<>();
        if (!isSmtpConfigured()) {
            logger.info("SMTP is not configured; skipping email send to {}", request.getTo());
            response.put("to", request.getTo());
            response.put("type", type == null ? "CUSTOM" : type.name());
            response.put("status", "SKIPPED");
            response.put("message", "SMTP is not configured");
            return response;
        }
        try {
            smtpClient.send(request.getTo(), subject, body);
            response.put("messageId", UUID.randomUUID().toString());
            response.put("to", request.getTo());
            response.put("type", type == null ? "CUSTOM" : type.name());
            response.put("status", "SENT");
            return response;
        } catch (Exception ex) {
            logger.warn("Failed to send email to {}: {}", request.getTo(), ex.getMessage());
            response.put("to", request.getTo());
            response.put("type", type == null ? "CUSTOM" : type.name());
            response.put("status", "FAILED");
            response.put("error", ex.getMessage());
            return response;
        }
    }

    private boolean isSmtpConfigured() {
        return smtpProperties != null
                && smtpProperties.getHost() != null
                && !smtpProperties.getHost().isBlank()
                && smtpProperties.getUsername() != null
                && !smtpProperties.getUsername().isBlank()
                && smtpProperties.getPassword() != null
                && !smtpProperties.getPassword().isBlank()
                && smtpProperties.getFrom() != null
                && !smtpProperties.getFrom().isBlank();
    }

    private String buildSubject(EmailType type, Map<String, String> context, String fallback) {
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        if (type == null) {
            return "Notification";
        }
        return switch (type) {
            case EMAIL_VERIFICATION -> "Verify your Food Ordering account";
            case REGISTRATION -> "Welcome to Food Ordering";
            case PASSWORD_RESET -> "Reset your Food Ordering password";
            case ORDER_CONFIRMATION -> "Your order is confirmed";
            case PAYMENT_STATUS -> "Payment status update";
            case ORDER_STATUS_UPDATE -> "Your order status has changed";
        };
    }

    private String buildBody(EmailType type, Map<String, String> context, String fallback) {
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        String name = getContextValue(context, "name", "Customer");
        String orderId = getContextValue(context, "orderId", "N/A");
        String status = getContextValue(context, "status", "PENDING");
        String amount = getContextValue(context, "amount", "0.00");
        String verificationLink = getContextValue(context, "verificationLink", "");

        if (type == null) {
            return "Hello " + name + ",\n\nYou have a new notification from Food Ordering.";
        }

        return switch (type) {
            case EMAIL_VERIFICATION -> "Hello " + name + ",\n\nPlease verify your email by visiting: "
                    + verificationLink + "\n\nThis link expires soon.";
            case REGISTRATION -> "Hello " + name + ",\n\nThanks for registering with Food Ordering.";
            case PASSWORD_RESET -> "Hello " + name + ",\n\nReset your password by visiting: "
                + getContextValue(context, "resetLink", "") + "\n\nThis link expires soon.";
            case ORDER_CONFIRMATION -> "Hello " + name + ",\n\nYour order " + orderId + " has been confirmed.";
            case PAYMENT_STATUS -> "Hello " + name + ",\n\nPayment status for order " + orderId + " is " + status + ". Amount: " + amount + ".";
            case ORDER_STATUS_UPDATE -> "Hello " + name + ",\n\nOrder " + orderId + " status is now " + status + ".";
        };
    }

    private String getContextValue(Map<String, String> context, String key, String fallback) {
        if (context == null) {
            return fallback;
        }
        String value = context.get(key);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
