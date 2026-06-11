package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Restaurant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
	Optional<Restaurant> findFirstByAdminId(Long adminId);

	default Optional<Restaurant> findByAdminId(Long adminId) {
		return findFirstByAdminId(adminId);
	}

	@Query("select r from Restaurant r "
			+ "where (cast(:name as string) is null or lower(r.name) like lower(concat('%', cast(:name as string), '%'))) "
			+ "and (cast(:cuisine as string) is null or lower(r.cuisine) like lower(concat('%', cast(:cuisine as string), '%'))) "
			+ "and (cast(:address as string) is null or lower(r.address) like lower(concat('%', cast(:address as string), '%'))) "
			+ "and (:active is null or r.active = :active)")
	org.springframework.data.domain.Page<Restaurant> search(@Param("name") String name,
			@Param("cuisine") String cuisine,
			@Param("address") String address,
			@Param("active") Boolean active,
			org.springframework.data.domain.Pageable pageable);
}
