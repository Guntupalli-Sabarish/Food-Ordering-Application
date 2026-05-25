package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.RestaurantDTO;
import com.foodorderapplication.backend.model.Restaurant;
import com.foodorderapplication.backend.repository.RestaurantRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class RestaurantService {
	private final RestaurantRepository restaurantRepository;

	public RestaurantService(RestaurantRepository restaurantRepository) {
		this.restaurantRepository = restaurantRepository;
	}

	public RestaurantDTO createRestaurant(RestaurantDTO request) {
		validateRestaurantRequest(request, true);
		Restaurant restaurant = new Restaurant();
		restaurant.setName(request.getName().trim());
		restaurant.setAddress(request.getAddress().trim());
		restaurant.setCuisine(request.getCuisine().trim());
		restaurant.setAdminId(request.getAdminId());
		restaurant.setActive(request.getActive() != null ? request.getActive() : true);
		Restaurant saved = restaurantRepository.save(restaurant);
		return toDto(saved);
	}

	@Transactional(readOnly = true)
	public List<RestaurantDTO> listRestaurants(String name, String cuisine, String address, Boolean active) {
		List<Restaurant> restaurants = restaurantRepository.search(cleanFilter(name), cleanFilter(cuisine),
				cleanFilter(address), active);
		return restaurants.stream().map(this::toDto).collect(Collectors.toList());
	}

	public RestaurantDTO updateRestaurant(Long id, RestaurantDTO request) {
		validateId(id, "restaurantId");
		validateRestaurantRequest(request, true);
		Restaurant restaurant = getRestaurantOrThrow(id);
		restaurant.setName(request.getName().trim());
		restaurant.setAddress(request.getAddress().trim());
		restaurant.setCuisine(request.getCuisine().trim());
		restaurant.setAdminId(request.getAdminId());
		if (request.getActive() != null) {
			restaurant.setActive(request.getActive());
		}
		return toDto(restaurantRepository.save(restaurant));
	}

	public void deleteRestaurant(Long id) {
		validateId(id, "restaurantId");
		Restaurant restaurant = getRestaurantOrThrow(id);
		restaurantRepository.delete(restaurant);
	}

	public RestaurantDTO updateRestaurantStatus(Long id, boolean active) {
		validateId(id, "restaurantId");
		Restaurant restaurant = getRestaurantOrThrow(id);
		restaurant.setActive(active);
		return toDto(restaurantRepository.save(restaurant));
	}

	@Transactional(readOnly = true)
	public RestaurantDTO getRestaurantForAdmin(Long adminId) {
		validateId(adminId, "adminId");
		Restaurant restaurant = restaurantRepository.findByAdminId(adminId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		return toDto(restaurant);
	}

	public RestaurantDTO updateRestaurantForAdmin(Long adminId, RestaurantDTO request) {
		validateId(adminId, "adminId");
		validateRestaurantRequest(request, false);
		Restaurant restaurant = restaurantRepository.findByAdminId(adminId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		restaurant.setName(request.getName().trim());
		restaurant.setAddress(request.getAddress().trim());
		restaurant.setCuisine(request.getCuisine().trim());
		return toDto(restaurantRepository.save(restaurant));
	}

	@Transactional(readOnly = true)
	public List<RestaurantDTO> listRestaurantsForCustomer(String name, String cuisine, String address) {
		List<Restaurant> restaurants = restaurantRepository.search(cleanFilter(name), cleanFilter(cuisine),
				cleanFilter(address), true);
		return restaurants.stream().map(this::toDto).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public RestaurantDTO getRestaurantForCustomer(Long id) {
		validateId(id, "restaurantId");
		Restaurant restaurant = getRestaurantOrThrow(id);
		if (!restaurant.isActive()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
		}
		return toDto(restaurant);
	}

	private Restaurant getRestaurantOrThrow(Long id) {
		return restaurantRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
	}

	private void validateRestaurantRequest(RestaurantDTO request, boolean requireAdmin) {
		if (request == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
		}
		if (isBlank(request.getName())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant name is required");
		}
		if (isBlank(request.getAddress())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant address is required");
		}
		if (isBlank(request.getCuisine())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant cuisine is required");
		}
		if (requireAdmin && request.getAdminId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin id is required");
		}
	}

	private void validateId(Long id, String fieldName) {
		if (id == null || id <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is invalid");
		}
	}

	private String cleanFilter(String value) {
		if (isBlank(value)) {
			return null;
		}
		return value.trim();
	}

	private boolean isBlank(String value) {
		return value == null || value.trim().isEmpty();
	}

	private RestaurantDTO toDto(Restaurant restaurant) {
		RestaurantDTO dto = new RestaurantDTO();
		dto.setRestaurantId(restaurant.getRestaurantId());
		dto.setName(restaurant.getName());
		dto.setAddress(restaurant.getAddress());
		dto.setCuisine(restaurant.getCuisine());
		dto.setAdminId(restaurant.getAdminId());
		dto.setActive(restaurant.isActive());
		return dto;
	}
}
