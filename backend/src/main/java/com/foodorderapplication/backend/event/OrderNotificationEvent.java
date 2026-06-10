package com.foodorderapplication.backend.event;

import com.foodorderapplication.backend.model.Order;
import org.springframework.context.ApplicationEvent;

/**
 * Published after an order is saved and committed to the database.
 * Handled by {@link com.foodorderapplication.backend.service.NotificationService}
 * via {@code @TransactionalEventListener(phase = AFTER_COMMIT)}.
 */
public class OrderNotificationEvent extends ApplicationEvent {

    public enum Kind { CONFIRMATION, STATUS_UPDATE }

    private final Order order;
    private final Kind kind;

    public OrderNotificationEvent(Object source, Order order, Kind kind) {
        super(source);
        this.order = order;
        this.kind = kind;
    }

    public Order getOrder() {
        return order;
    }

    public Kind getKind() {
        return kind;
    }
}
