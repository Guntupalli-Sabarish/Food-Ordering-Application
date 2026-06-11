package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.event.OrderNotificationEvent;
import com.foodorderapplication.backend.model.NotificationJob;
import com.foodorderapplication.backend.model.enums.NotificationJobStatus;
import com.foodorderapplication.backend.repository.NotificationJobRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import com.foodorderapplication.backend.util.EmailRequest;
import com.foodorderapplication.backend.util.EmailType;
import com.foodorderapplication.backend.util.SmtpProperties;
import com.foodorderapplication.backend.util.SmtpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class NotificationService {
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final SmtpClient smtpClient;
    private final SmtpProperties smtpProperties;
    private final UserRepository userRepository;
    private final NotificationJobRepository notificationJobRepository;

    public NotificationService(SmtpClient smtpClient, SmtpProperties smtpProperties,
                               UserRepository userRepository, NotificationJobRepository notificationJobRepository) {
        this.smtpClient = smtpClient;
        this.smtpProperties = smtpProperties;
        this.userRepository = userRepository;
        this.notificationJobRepository = notificationJobRepository;
    }

    /**
     * Handles {@link OrderNotificationEvent} published by {@code OrderService}.
     *
     * <p>Fires <em>only after the enclosing transaction commits</em> via
     * {@code @TransactionalEventListener(phase = AFTER_COMMIT)}, so a rollback
     * will never dispatch an email. {@code @Async} ensures SMTP I/O runs on a
     * background thread and does not block the HTTP response.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleOrderEvent(OrderNotificationEvent event) {
        if (event == null || event.getOrder() == null) return;
        com.foodorderapplication.backend.model.Order order = event.getOrder();
        userRepository.findById(order.getUserId()).ifPresent(user -> {
            EmailRequest req = new EmailRequest();
            req.setTo(user.getEmail());
            if (event.getKind() == OrderNotificationEvent.Kind.CONFIRMATION) {
                StringBuilder itemsBuilder = new StringBuilder();
                if (order.getItems() != null) {
                    for (com.foodorderapplication.backend.model.OrderItem item : order.getItems()) {
                        itemsBuilder.append("- ")
                                    .append(item.getMenuItemName() != null ? item.getMenuItemName() : "Item #" + item.getMenuItemId())
                                    .append(" x ")
                                    .append(item.getQuantity())
                                    .append(" (₹")
                                    .append(item.getUnitPrice())
                                    .append(")\n");
                    }
                }
                req.setType(EmailType.ORDER_CONFIRMATION);
                req.setContext(Map.of(
                        "name", user.getName() == null ? "Customer" : user.getName(),
                        "orderId", String.valueOf(order.getOrderId()),
                        "restaurantName", order.getRestaurantName() == null ? "Restaurant" : order.getRestaurantName(),
                        "itemsOrdered", itemsBuilder.toString(),
                        "totalAmount", order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0.00"
                ));
            } else {
                req.setType(EmailType.ORDER_STATUS_UPDATE);
                req.setContext(Map.of(
                        "name", user.getName() == null ? "Customer" : user.getName(),
                        "orderId", String.valueOf(order.getOrderId()),
                        "status", order.getOrderStatus().name()));
            }
            logger.info("Dispatching {} email for order {} to {} after commit",
                    event.getKind(), order.getOrderId(), user.getEmail());
            sendEmail(req);
        });
    }

    public NotificationJob sendEmail(EmailRequest request) {
        if (request == null) {
            logger.warn("Attempted to send null email request");
            return null;
        }
        if (request.getTo() == null || request.getTo().isBlank()) {
            logger.warn("Attempted to send email with empty recipient");
            return null;
        }

        String subject = request.getSubject();
        String body = request.getBody();
        EmailType type = request.getType();

        if ((subject == null || subject.isBlank()) || (body == null || body.isBlank())) {
            Map<String, String> context = request.getContext();
            subject = buildSubject(type, context, subject);
            body = buildBody(type, context, body);
        }

        NotificationJob job = new NotificationJob();
        job.setRecipient(request.getTo());
        job.setSubject(subject);
        job.setBody(body);
        job.setStatus(NotificationJobStatus.PENDING);
        job.setAttempts(0);
        job.setCreatedAt(LocalDateTime.now());

        NotificationJob savedJob = notificationJobRepository.save(job);

        // Process asynchronously using the executor bean
        executeJobAsync(savedJob.getJobId());

        return savedJob;
    }

    @Async("emailExecutor")
    public void executeJobAsync(Long jobId) {
        try {
            processJob(jobId);
        } catch (Exception e) {
            logger.error("Error running executeJobAsync for job {}: {}", jobId, e.getMessage(), e);
        }
    }

    @Transactional
    public void processJob(Long jobId) {
        NotificationJob job = notificationJobRepository.findById(jobId).orElse(null);
        if (job == null || job.getStatus() == NotificationJobStatus.SUCCESS) {
            return;
        }

        job.setAttempts(job.getAttempts() + 1);
        job.setLastAttemptAt(LocalDateTime.now());

        if (!isSmtpConfigured()) {
            logger.info("SMTP not configured – fallback: logging email to job {} for recipient {} with subject '{}'.", jobId, job.getRecipient(), job.getSubject());
            // Mark as SUCCESS to not block order flow
            job.setStatus(NotificationJobStatus.SUCCESS);
            notificationJobRepository.save(job);
            return;

        }

        try {
            smtpClient.send(job.getRecipient(), job.getSubject(), job.getBody());
            job.setStatus(NotificationJobStatus.SUCCESS);
            logger.info("Email job {} successfully sent to {}", jobId, job.getRecipient());
        } catch (Exception ex) {
            job.setStatus(NotificationJobStatus.FAILED);
            logger.error("Failed to send email job {} to {}: {}", jobId, job.getRecipient(), ex.getMessage(), ex);
        }
        notificationJobRepository.save(job);
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedDelay = 15000)
    public void retryFailedOrPendingJobs() {
        java.util.List<NotificationJob> jobsToRetry = notificationJobRepository.findByStatusInAndAttemptsLessThan(
                java.util.Arrays.asList(NotificationJobStatus.PENDING, NotificationJobStatus.FAILED),
                5
        );

        for (NotificationJob job : jobsToRetry) {
            long backoffSeconds = (long) Math.pow(2, job.getAttempts()) * 5L; // 5s, 10s, 20s, 40s...
            LocalDateTime lastAttempt = job.getLastAttemptAt();
            if (lastAttempt == null || LocalDateTime.now().isAfter(lastAttempt.plusSeconds(backoffSeconds))) {
                logger.info("Retrying email job {} to {}, attempt #{}", job.getJobId(), job.getRecipient(), job.getAttempts() + 1);
                executeJobAsync(job.getJobId());
            }
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
            case ORDER_CONFIRMATION -> "Hello " + name + ",\n\nYour order " + orderId + " from " 
                    + getContextValue(context, "restaurantName", "Restaurant") + " has been confirmed.\n\n"
                    + "Items ordered:\n" + getContextValue(context, "itemsOrdered", "") 
                    + "\nTotal Amount: ₹" + getContextValue(context, "totalAmount", "0.00") + ".";
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
