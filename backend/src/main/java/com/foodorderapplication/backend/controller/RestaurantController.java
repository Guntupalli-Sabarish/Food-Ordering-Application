package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.RestaurantDTO;
import com.foodorderapplication.backend.service.RestaurantService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RestaurantController {
	private final RestaurantService restaurantService;

	public RestaurantController(RestaurantService restaurantService) {
		this.restaurantService = restaurantService;
	}

	@PostMapping("/api/superadmin/restaurants")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<RestaurantDTO> createRestaurant(@RequestBody RestaurantDTO request) {
		return ResponseEntity.ok(restaurantService.createRestaurant(request));
	}

	@GetMapping("/api/superadmin/restaurants")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<List<RestaurantDTO>> listRestaurants(@RequestParam(required = false) String name,
			@RequestParam(required = false) String cuisine,
			@RequestParam(required = false) String address,
			@RequestParam(required = false) Boolean active) {
		return ResponseEntity.ok(restaurantService.listRestaurants(name, cuisine, address, active));
	}

	@PutMapping("/api/superadmin/restaurants/{id}")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<RestaurantDTO> updateRestaurant(@PathVariable Long id,
			@RequestBody RestaurantDTO request) {
		return ResponseEntity.ok(restaurantService.updateRestaurant(id, request));
	}

	@DeleteMapping("/api/superadmin/restaurants/{id}")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
		restaurantService.deleteRestaurant(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/api/superadmin/restaurants/{id}/status")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<RestaurantDTO> updateRestaurantStatus(@PathVariable Long id,
			@RequestParam boolean active) {
		return ResponseEntity.ok(restaurantService.updateRestaurantStatus(id, active));
	}

	@GetMapping("/api/admin/restaurant")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<RestaurantDTO> getRestaurantForAdmin(Authentication authentication) {
		return ResponseEntity.ok(restaurantService.getRestaurantForAdmin(authentication.getName()));
	}

	@PutMapping("/api/admin/restaurant")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<RestaurantDTO> updateRestaurantForAdmin(Authentication authentication,
			@RequestBody RestaurantDTO request) {
		return ResponseEntity.ok(restaurantService.updateRestaurantForAdmin(authentication.getName(), request));
	}

	@GetMapping("/api/customer/restaurants")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<List<RestaurantDTO>> listRestaurantsForCustomer(@RequestParam(required = false) String name,
			@RequestParam(required = false) String cuisine,
			@RequestParam(required = false) String address) {
		return ResponseEntity.ok(restaurantService.listRestaurantsForCustomer(name, cuisine, address));
	}

	@GetMapping("/api/customer/restaurants/{id}")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<RestaurantDTO> getRestaurantForCustomer(@PathVariable Long id) {
		return ResponseEntity.ok(restaurantService.getRestaurantForCustomer(id));
	}
}
