package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.repository.OrderItemRepository;
import com.foodorderapplication.backend.repository.OrderRepository;
import com.foodorderapplication.backend.repository.RestaurantRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public AnalyticsService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
            UserRepository userRepository, RestaurantRepository restaurantRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public Map<String, Object> getSuperAdminOverview() {
        long totalOrders = orderRepository.count();
        long cancelledOrders = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);
        long deliveredOrders = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long totalUsers = userRepository.count();

        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", Instant.now().toString());
        data.put("totalRevenue", totalRevenue);
        data.put("totalOrders", totalOrders);
        data.put("totalUsers", totalUsers);
        data.put("activeUsers", totalUsers); // Active = all registered users for now
        data.put("cancelledOrders", cancelledOrders);
        data.put("deliveredOrders", deliveredOrders);
        return data;
    }

    public Map<String, Object> getSuperAdminRevenue() {
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Map<String, Object> data = new HashMap<>();
        data.put("currency", "INR");
        data.put("period", "all_time");
        data.put("total", totalRevenue);
        // Daily breakdown requires a time-series query; provide summary for now
        data.put("daily", List.of());
        return data;
    }

    public Map<String, Object> getSuperAdminUsers() {
        long total = userRepository.count();
        Map<String, Object> data = new HashMap<>();
        data.put("total", total);
        data.put("topRegions", List.of()); // Region data not tracked yet
        return data;
    }

    public Map<String, Object> getSuperAdminOrders() {
        long totalOrders = orderRepository.count();
        long delivered = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long pending = orderRepository.countByOrderStatus(OrderStatus.PENDING);
        long cancelled = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);
        long pendingPayment = orderRepository.countByOrderStatus(OrderStatus.PENDING_PAYMENT);

        Map<String, Object> data = new HashMap<>();
        data.put("totalOrders", totalOrders);
        data.put("completed", delivered);
        data.put("pending", pending + pendingPayment);
        data.put("cancelled", cancelled);
        return data;
    }

    /**
     * Revenue analytics scoped to the authenticated admin's own restaurant.
     */
    public Map<String, Object> getAdminRevenue(String adminEmail) {
        Long restaurantId = resolveRestaurantId(adminEmail);
        BigDecimal revenue = orderRepository.sumTotalAmountByRestaurantIdAndStatus(restaurantId, OrderStatus.DELIVERED);
        if (revenue == null) revenue = BigDecimal.ZERO;

        long totalOrders = orderRepository.countByRestaurantIdAndOrderStatus(restaurantId, OrderStatus.DELIVERED)
                + orderRepository.countByRestaurantIdAndOrderStatus(restaurantId, OrderStatus.PENDING);

        Map<String, Object> data = new HashMap<>();
        data.put("currency", "INR");
        data.put("period", "all_time");
        data.put("total", revenue);
        data.put("totalOrders", totalOrders);
        return data;
    }

    /**
     * Top menu items by quantity ordered, scoped to the admin's restaurant.
     */
    public Map<String, Object> getAdminTopItems(String adminEmail) {
        Long restaurantId = resolveRestaurantId(adminEmail);
        List<Object[]> rows = orderItemRepository.findTopItemsByRestaurant(restaurantId);

        List<Map<String, Object>> items = new ArrayList<>();
        for (int i = 0; i < Math.min(rows.size(), 10); i++) {
            Object[] row = rows.get(i);
            Map<String, Object> item = new HashMap<>();
            item.put("name", row[0] != null ? row[0].toString() : "Unknown");
            item.put("orders", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            items.add(item);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        return data;
    }

    private Long resolveRestaurantId(String adminEmail) {
        if (adminEmail == null || adminEmail.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        com.foodorderapplication.backend.model.User admin = userRepository.findByEmail(adminEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));
        return restaurantRepository.findByAdminId(admin.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"))
                .getRestaurantId();
    }
}
