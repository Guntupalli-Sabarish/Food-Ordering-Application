package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Order;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByRestaurantId(Long restaurantId);
}
