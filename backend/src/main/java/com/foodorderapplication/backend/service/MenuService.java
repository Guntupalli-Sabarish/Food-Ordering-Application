package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.MenuItemDTO;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.model.Restaurant;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.RestaurantRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class MenuService {
	private final MenuItemRepository menuItemRepository;
	private final RestaurantRepository restaurantRepository;
	private final UserRepository userRepository;

	public MenuService(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository,
			UserRepository userRepository) {
		this.menuItemRepository = menuItemRepository;
		this.restaurantRepository = restaurantRepository;
		this.userRepository = userRepository;
	}

	public MenuItemDTO createMenuItem(String adminEmail, MenuItemDTO request) {
		validateMenuRequest(request);
		Long adminId = resolveAdminId(adminEmail);
		Restaurant restaurant = getRestaurantForAdmin(adminId, request.getRestaurantId());
		// Prevent duplicate item names within the same restaurant (case-insensitive)
		if (menuItemRepository.existsByRestaurantRestaurantIdAndItemNameIgnoreCase(
				restaurant.getRestaurantId(), request.getItemName().trim())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"A menu item with this name already exists in the restaurant");
		}
		MenuItem menuItem = new MenuItem();
		menuItem.setRestaurant(restaurant);
		menuItem.setItemName(request.getItemName().trim());
		menuItem.setDescription(request.getDescription().trim());
		menuItem.setCategory(request.getCategory().trim());
		menuItem.setPrice(request.getPrice());
		menuItem.setAvailability(request.getAvailability() != null ? request.getAvailability() : true);
		MenuItem saved = menuItemRepository.save(menuItem);
		return toDto(saved);
	}

	@Transactional(readOnly = true)
	public org.springframework.data.domain.Page<MenuItemDTO> listMenuItemsForAdmin(String adminEmail, Long restaurantId, String itemName,
			Boolean available, BigDecimal minPrice, BigDecimal maxPrice, org.springframework.data.domain.Pageable pageable) {
		Long adminId = resolveAdminId(adminEmail);
		Long resolvedRestaurantId = restaurantId;
		if (resolvedRestaurantId == null) {
			resolvedRestaurantId = restaurantRepository.findByAdminId(adminId)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"))
					.getRestaurantId();
		} else {
			validateId(resolvedRestaurantId, "restaurantId");
			verifyAdminOwnership(adminId, resolvedRestaurantId);
		}
		org.springframework.data.domain.Page<MenuItem> menuItems = menuItemRepository.searchByRestaurant(resolvedRestaurantId, cleanFilter(itemName),
				available, minPrice, maxPrice, pageable);
		return menuItems.map(this::toDto);
	}

	public MenuItemDTO updateMenuItem(String adminEmail, Long menuItemId, MenuItemDTO request) {
		Long adminId = resolveAdminId(adminEmail);
		validateId(menuItemId, "menuItemId");
		validateMenuRequest(request);
		MenuItem menuItem = menuItemRepository.findById(menuItemId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
		verifyAdminOwnership(adminId, menuItem.getRestaurant().getRestaurantId());
		if (!menuItem.getRestaurant().getRestaurantId().equals(request.getRestaurantId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant id cannot be changed");
		}
		// Prevent duplicate item names if name is being changed (case-insensitive)
		if (!menuItem.getItemName().equalsIgnoreCase(request.getItemName().trim()) &&
				menuItemRepository.existsByRestaurantRestaurantIdAndItemNameIgnoreCase(
						menuItem.getRestaurant().getRestaurantId(), request.getItemName().trim())) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"A menu item with this name already exists in the restaurant");
		}
		menuItem.setItemName(request.getItemName().trim());
		menuItem.setDescription(request.getDescription().trim());
		menuItem.setCategory(request.getCategory().trim());
		menuItem.setPrice(request.getPrice());
		menuItem.setAvailability(request.getAvailability() != null ? request.getAvailability() : menuItem.isAvailability());
		return toDto(menuItemRepository.save(menuItem));
	}

	public void deleteMenuItem(String adminEmail, Long menuItemId) {
		Long adminId = resolveAdminId(adminEmail);
		validateId(menuItemId, "menuItemId");
		MenuItem menuItem = menuItemRepository.findById(menuItemId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
		verifyAdminOwnership(adminId, menuItem.getRestaurant().getRestaurantId());
		menuItemRepository.delete(menuItem);
	}

	@Transactional(readOnly = true)
	public org.springframework.data.domain.Page<MenuItemDTO> listMenuItemsForCustomer(Long restaurantId, String itemName, Boolean available,
			BigDecimal minPrice, BigDecimal maxPrice, org.springframework.data.domain.Pageable pageable) {
		validateId(restaurantId, "restaurantId");
		Restaurant restaurant = restaurantRepository.findById(restaurantId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		if (!restaurant.isActive()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
		}
		Boolean searchAvailable = available != null ? available : true;
		org.springframework.data.domain.Page<MenuItem> menuItems = menuItemRepository.searchByRestaurant(restaurantId, cleanFilter(itemName),
				searchAvailable, minPrice, maxPrice, pageable);
		return menuItems.map(this::toDto);
	}

	private Restaurant getRestaurantForAdmin(Long adminId, Long restaurantId) {
		validateId(restaurantId, "restaurantId");
		Restaurant restaurant = restaurantRepository.findById(restaurantId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		verifyAdminOwnership(adminId, restaurantId);
		return restaurant;
	}

	private void verifyAdminOwnership(Long adminId, Long restaurantId) {
		Restaurant restaurant = restaurantRepository.findById(restaurantId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		if (!restaurant.getAdminId().equals(adminId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for this restaurant");
		}
	}

	private void validateMenuRequest(MenuItemDTO request) {
		if (request == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
		}
		if (request.getRestaurantId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant id is required");
		}
		if (isBlank(request.getItemName())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name is required");
		}
		if (request.getItemName().trim().length() > 100) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name must not exceed 100 characters");
		}
		if (isBlank(request.getDescription())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
		}
		if (isBlank(request.getCategory())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
		}
		if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must be greater than zero");
		}
		if (request.getPrice().compareTo(new BigDecimal("99999.99")) > 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price must not exceed 99999.99");
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

	private MenuItemDTO toDto(MenuItem menuItem) {
		MenuItemDTO dto = new MenuItemDTO();
		dto.setMenuItemId(menuItem.getMenuItemId());
		dto.setRestaurantId(menuItem.getRestaurant().getRestaurantId());
		dto.setItemName(menuItem.getItemName());
		dto.setDescription(menuItem.getDescription());
		dto.setCategory(menuItem.getCategory());
		dto.setPrice(menuItem.getPrice());
		dto.setAvailability(menuItem.isAvailability());
		return dto;
	}
}
