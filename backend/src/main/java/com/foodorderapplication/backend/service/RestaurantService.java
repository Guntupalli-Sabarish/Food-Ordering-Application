package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.RestaurantDTO;
import com.foodorderapplication.backend.model.Restaurant;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.repository.OrderRepository;
import com.foodorderapplication.backend.repository.RestaurantRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class RestaurantService {
	private static final List<OrderStatus> TERMINAL_STATUSES = Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CANCELLED);
	private final RestaurantRepository restaurantRepository;
	private final UserRepository userRepository;
	private final OrderRepository orderRepository;

	public RestaurantService(RestaurantRepository restaurantRepository, UserRepository userRepository,
			OrderRepository orderRepository) {
		this.restaurantRepository = restaurantRepository;
		this.userRepository = userRepository;
		this.orderRepository = orderRepository;
	}

	public RestaurantDTO createRestaurant(RestaurantDTO request) {
		validateRestaurantRequest(request, true);
		validateAdminAssignment(request.getAdminId(), null);
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
		validateAdminAssignment(request.getAdminId(), id);
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

	private void validateAdminAssignment(Long adminId, Long currentRestaurantId) {
		if (adminId == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin user ID is required");
		}
		com.foodorderapplication.backend.model.User user = userRepository.findById(adminId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin user not found"));
		if (user.getRole() != com.foodorderapplication.backend.model.enums.UserRole.ADMIN) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user must have the ADMIN role");
		}
		java.util.Optional<Restaurant> existing = restaurantRepository.findFirstByAdminId(adminId);
		if (existing.isPresent()) {
			Restaurant r = existing.get();
			if (currentRestaurantId == null || !r.getRestaurantId().equals(currentRestaurantId)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "This Admin is already assigned to another restaurant");
			}
		}
	}

	public void deleteRestaurant(Long id) {
		validateId(id, "restaurantId");
		Restaurant restaurant = getRestaurantOrThrow(id);
		// Guard: do not delete if there are non-terminal orders for this restaurant
		if (orderRepository.existsByRestaurantIdAndOrderStatusNotIn(id, TERMINAL_STATUSES)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Cannot delete restaurant with active orders");
		}
		restaurantRepository.delete(restaurant);
	}

	public RestaurantDTO updateRestaurantStatus(Long id, boolean active) {
		validateId(id, "restaurantId");
		Restaurant restaurant = getRestaurantOrThrow(id);
		restaurant.setActive(active);
		return toDto(restaurantRepository.save(restaurant));
	}

	@Transactional(readOnly = true)
	public RestaurantDTO getRestaurantForAdmin(String adminEmail) {
		Long adminId = resolveAdminId(adminEmail);
		Restaurant restaurant = restaurantRepository.findByAdminId(adminId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		return toDto(restaurant);
	}

	public RestaurantDTO updateRestaurantForAdmin(String adminEmail, RestaurantDTO request) {
		Long adminId = resolveAdminId(adminEmail);
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

	private Long resolveAdminId(String adminEmail) {
		if (isBlank(adminEmail)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
		}
		return userRepository.findByEmail(adminEmail.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
				.getUserId();
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
