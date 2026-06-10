package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.MenuItem;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
	boolean existsByRestaurantRestaurantIdAndItemNameIgnoreCase(Long restaurantId, String itemName);
	@Query("select m from MenuItem m "
			+ "where m.restaurant.restaurantId = :restaurantId "
			+ "and (:itemName is null or lower(m.itemName) like lower(concat('%', :itemName, '%'))) "
			+ "and (:available is null or m.availability = :available) "
			+ "and (:minPrice is null or m.price >= :minPrice) "
			+ "and (:maxPrice is null or m.price <= :maxPrice)")
	org.springframework.data.domain.Page<MenuItem> searchByRestaurant(@Param("restaurantId") Long restaurantId,
			@Param("itemName") String itemName,
			@Param("available") Boolean available,
			@Param("minPrice") BigDecimal minPrice,
			@Param("maxPrice") BigDecimal maxPrice,
			org.springframework.data.domain.Pageable pageable);
}
