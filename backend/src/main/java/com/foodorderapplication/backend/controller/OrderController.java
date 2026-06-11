package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.service.OrderService;
import com.foodorderapplication.backend.dto.CreateOrderRequest;
import com.foodorderapplication.backend.dto.UpdateOrderStatusRequest;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/api/customer/orders/quote")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> getQuote(Authentication authentication) {
        return ResponseEntity.ok(orderService.calculateQuote(authentication.getName()));
    }

    @PostMapping("/api/customer/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> createOrder(
            Authentication authentication,
            @jakarta.validation.Valid @RequestBody CreateOrderRequest body,
            jakarta.servlet.http.HttpServletRequest request) {
        String idempotencyKey = request.getHeader("Idempotency-Key");
        log.info("Place order request by user {} with idempotencyKey={}", authentication.getName(), idempotencyKey);
        Order order = orderService.createOrder(authentication.getName(), body.getDeliveryAddress(), body.getPaymentMethod(), idempotencyKey);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/api/customer/orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<org.springframework.data.domain.Page<Order>> listOrders(Authentication authentication, org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(orderService.listOrdersForUser(authentication.getName(), pageable));
    }

    @GetMapping("/api/customer/orders/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> getOrder(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(authentication.getName(), id));
    }

    @PutMapping("/api/customer/orders/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Order> cancelOrder(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(authentication.getName(), id));
    }

    @GetMapping("/api/customer/orders/{id}/track")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Map<String, Object>> trackOrder(Authentication authentication, @PathVariable Long id) {
        Order o = orderService.trackOrder(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("orderId", o.getOrderId(), "status", o.getOrderStatus()));
    }

    // Admin endpoints
    @GetMapping("/api/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<org.springframework.data.domain.Page<Order>> listAllOrders(Authentication authentication, org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(orderService.listOrdersForAdmin(authentication.getName(), pageable));
    }

    @PutMapping("/api/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Order> updateStatus(
            Authentication authentication,
            @PathVariable Long id,
            @jakarta.validation.Valid @RequestBody UpdateOrderStatusRequest body) {
        OrderStatus status;
        try {
            status = OrderStatus.valueOf(body.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid order status value: " + body.getStatus());
        }
        return ResponseEntity.ok(orderService.updateOrderStatusForAdmin(authentication.getName(), id, status));
    }
}
