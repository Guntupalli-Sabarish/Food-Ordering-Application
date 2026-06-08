package com.foodorderapplication.backend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsService {

    public Map<String, Object> getSuperAdminOverview() {
        Map<String, Object> data = new HashMap<>();
        data.put("timestamp", Instant.now().toString());
        data.put("totalRevenue", 125430.75);
        data.put("totalOrders", 4821);
        data.put("totalUsers", 1934);
        data.put("activeUsers", 862);
        data.put("cancelledOrders", 124);
        data.put("dataSource", "mock");
        return data;
    }

public Map<String, Object> getSuperAdminRevenue() {
    Map<String, Object> data = new HashMap<>();

    data.put("currency", "USD");
    data.put("period", "last_14_days");
    data.put("total", 45210.25);

    data.put("daily", List.of(
            Map.of("date", "2026-05-12", "amount", 1245.80),
            Map.of("date", "2026-05-13", "amount", 1380.20),
            Map.of("date", "2026-05-14", "amount", 1422.50),
            Map.of("date", "2026-05-15", "amount", 1508.90),
            Map.of("date", "2026-05-16", "amount", 1575.40),
            Map.of("date", "2026-05-17", "amount", 1460.75),
            Map.of("date", "2026-05-18", "amount", 1652.30),
            Map.of("date", "2026-05-19", "amount", 1715.85),
            Map.of("date", "2026-05-20", "amount", 1398.60),
            Map.of("date", "2026-05-21", "amount", 1480.50),
            Map.of("date", "2026-05-22", "amount", 1625.75),
            Map.of("date", "2026-05-23", "amount", 1710.00),
            Map.of("date", "2026-05-24", "amount", 1832.10),
            Map.of("date", "2026-05-25", "amount", 1905.40)
    ));

    data.put("dataSource", "mock");

    return data;
}

    public Map<String, Object> getSuperAdminUsers() {
        Map<String, Object> data = new HashMap<>();
        data.put("newUsers", 124);
        data.put("returningUsers", 532);
        data.put("topRegions", List.of(
                Map.of("region", "North", "users", 210),
                Map.of("region", "West", "users", 180),
                Map.of("region", "South", "users", 142)
        ));
        data.put("dataSource", "mock");
        return data;
    }

    public Map<String, Object> getSuperAdminOrders() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalOrders", 4821);
        data.put("completed", 4512);
        data.put("pending", 185);
        data.put("cancelled", 124);
        data.put("dataSource", "mock");
        return data;
    }

    public Map<String, Object> getAdminRevenue() {
        Map<String, Object> data = new HashMap<>();
        data.put("currency", "USD");
        data.put("period", "last_7_days");
        data.put("total", 9812.40);
        data.put("dataSource", "mock");
        return data;
    }

    public Map<String, Object> getAdminTopItems() {
        Map<String, Object> data = new HashMap<>();
        data.put("items", List.of(
                Map.of("name", "Margherita Pizza", "orders", 120),
                Map.of("name", "Chicken Biryani", "orders", 98),
                Map.of("name", "Veggie Burger", "orders", 76)
        ));
        data.put("dataSource", "mock");
        return data;
    }
}
