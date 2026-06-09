package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderItem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);

    @org.springframework.data.jpa.repository.Query(
        "SELECT oi.menuItemName, SUM(oi.quantity) as totalQty " +
        "FROM OrderItem oi WHERE oi.order.restaurantId = :restaurantId " +
        "GROUP BY oi.menuItemName ORDER BY totalQty DESC")
    java.util.List<Object[]> findTopItemsByRestaurant(
        @org.springframework.data.repository.query.Param("restaurantId") Long restaurantId);
}
