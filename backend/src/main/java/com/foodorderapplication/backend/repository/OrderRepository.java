package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
    org.springframework.data.domain.Page<Order> findByUserId(Long userId, org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Order> findByRestaurantId(Long restaurantId, org.springframework.data.domain.Pageable pageable);

    boolean existsByRestaurantIdAndOrderStatusNotIn(Long restaurantId, Collection<OrderStatus> statuses);

    boolean existsByUserIdAndOrderStatusNotIn(Long userId, Collection<OrderStatus> statuses);

    long countByOrderStatus(OrderStatus status);

    long countByRestaurantIdAndOrderStatus(Long restaurantId, OrderStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(SUM(o.totalAmount), 0) FROM FoodOrder o WHERE o.orderStatus = :status")
    java.math.BigDecimal sumTotalAmountByStatus(@org.springframework.data.repository.query.Param("status") OrderStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(SUM(o.totalAmount), 0) FROM FoodOrder o WHERE o.restaurantId = :restaurantId AND o.orderStatus = :status")
    java.math.BigDecimal sumTotalAmountByRestaurantIdAndStatus(
        @org.springframework.data.repository.query.Param("restaurantId") Long restaurantId,
        @org.springframework.data.repository.query.Param("status") OrderStatus status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT o.restaurantId, COUNT(o) FROM FoodOrder o GROUP BY o.restaurantId ORDER BY COUNT(o) DESC")
    java.util.List<Object[]> countOrdersGroupedByRestaurant();

    long count();
}
