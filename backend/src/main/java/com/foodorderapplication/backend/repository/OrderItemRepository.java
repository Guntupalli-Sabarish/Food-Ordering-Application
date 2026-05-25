package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
}
