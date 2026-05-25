package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderStatus;
import com.foodorderapplication.backend.service.OrderService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/api/customer/orders")
    public ResponseEntity<Order> createOrder(Authentication authentication) {
        Order order = orderService.createOrder(authentication.getName());
        return ResponseEntity.ok(order);
    }

    @GetMapping("/api/customer/orders")
    public ResponseEntity<List<Order>> listOrders(Authentication authentication) {
        return ResponseEntity.ok(orderService.listOrdersForUser(authentication.getName()));
    }

    @GetMapping("/api/customer/orders/{id}")
    public ResponseEntity<Order> getOrder(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrder(authentication.getName(), id));
    }

    @PutMapping("/api/customer/orders/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(authentication.getName(), id));
    }

    @GetMapping("/api/customer/orders/{id}/track")
    public ResponseEntity<Map<String, Object>> trackOrder(Authentication authentication, @PathVariable Long id) {
        Order o = orderService.trackOrder(authentication.getName(), id);
        return ResponseEntity.ok(Map.of("orderId", o.getOrderId(), "status", o.getOrderStatus()));
    }

    // Admin endpoints
    @GetMapping("/api/admin/orders")
    public ResponseEntity<List<Order>> listAllOrders() {
        return ResponseEntity.ok(orderService.listAllOrders());
    }

    @PutMapping("/api/admin/orders/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
