package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.RestaurantDTO;
import com.foodorderapplication.backend.service.RestaurantService;
import java.util.List;
import org.springframework.http.ResponseEntity;
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
	public ResponseEntity<RestaurantDTO> createRestaurant(@RequestBody RestaurantDTO request) {
		return ResponseEntity.ok(restaurantService.createRestaurant(request));
	}

	@GetMapping("/api/superadmin/restaurants")
	public ResponseEntity<List<RestaurantDTO>> listRestaurants(@RequestParam(required = false) String name,
			@RequestParam(required = false) String cuisine,
			@RequestParam(required = false) String address,
			@RequestParam(required = false) Boolean active) {
		return ResponseEntity.ok(restaurantService.listRestaurants(name, cuisine, address, active));
	}

	@PutMapping("/api/superadmin/restaurants/{id}")
	public ResponseEntity<RestaurantDTO> updateRestaurant(@PathVariable Long id,
			@RequestBody RestaurantDTO request) {
		return ResponseEntity.ok(restaurantService.updateRestaurant(id, request));
	}

	@DeleteMapping("/api/superadmin/restaurants/{id}")
	public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
		restaurantService.deleteRestaurant(id);
		return ResponseEntity.noContent().build();
	}

	@PutMapping("/api/superadmin/restaurants/{id}/status")
	public ResponseEntity<RestaurantDTO> updateRestaurantStatus(@PathVariable Long id,
			@RequestParam boolean active) {
		return ResponseEntity.ok(restaurantService.updateRestaurantStatus(id, active));
	}

	@GetMapping("/api/admin/restaurant")
	public ResponseEntity<RestaurantDTO> getRestaurantForAdmin(@RequestParam Long adminId) {
		return ResponseEntity.ok(restaurantService.getRestaurantForAdmin(adminId));
	}

	@PutMapping("/api/admin/restaurant")
	public ResponseEntity<RestaurantDTO> updateRestaurantForAdmin(@RequestParam Long adminId,
			@RequestBody RestaurantDTO request) {
		return ResponseEntity.ok(restaurantService.updateRestaurantForAdmin(adminId, request));
	}

	@GetMapping("/api/customer/restaurants")
	public ResponseEntity<List<RestaurantDTO>> listRestaurantsForCustomer(@RequestParam(required = false) String name,
			@RequestParam(required = false) String cuisine,
			@RequestParam(required = false) String address) {
		return ResponseEntity.ok(restaurantService.listRestaurantsForCustomer(name, cuisine, address));
	}

	@GetMapping("/api/customer/restaurants/{id}")
	public ResponseEntity<RestaurantDTO> getRestaurantForCustomer(@PathVariable Long id) {
		return ResponseEntity.ok(restaurantService.getRestaurantForCustomer(id));
	}
}
