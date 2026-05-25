package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.MenuItemDTO;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.model.Restaurant;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.RestaurantRepository;
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

	public MenuService(MenuItemRepository menuItemRepository, RestaurantRepository restaurantRepository) {
		this.menuItemRepository = menuItemRepository;
		this.restaurantRepository = restaurantRepository;
	}

	public MenuItemDTO createMenuItem(Long adminId, MenuItemDTO request) {
		validateId(adminId, "adminId");
		validateMenuRequest(request);
		Restaurant restaurant = getRestaurantForAdmin(adminId, request.getRestaurantId());
		MenuItem menuItem = new MenuItem();
		menuItem.setRestaurant(restaurant);
		menuItem.setItemName(request.getItemName().trim());
		menuItem.setDescription(request.getDescription().trim());
		menuItem.setPrice(request.getPrice());
		menuItem.setAvailability(request.getAvailability() != null ? request.getAvailability() : true);
		MenuItem saved = menuItemRepository.save(menuItem);
		return toDto(saved);
	}

	@Transactional(readOnly = true)
	public List<MenuItemDTO> listMenuItemsForAdmin(Long adminId, Long restaurantId, String itemName,
			Boolean available, BigDecimal minPrice, BigDecimal maxPrice) {
		validateId(adminId, "adminId");
		Long resolvedRestaurantId = restaurantId;
		if (resolvedRestaurantId == null) {
			resolvedRestaurantId = restaurantRepository.findByAdminId(adminId)
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"))
					.getRestaurantId();
		} else {
			validateId(resolvedRestaurantId, "restaurantId");
			verifyAdminOwnership(adminId, resolvedRestaurantId);
		}
		List<MenuItem> menuItems = menuItemRepository.searchByRestaurant(resolvedRestaurantId, cleanFilter(itemName),
				available, minPrice, maxPrice);
		return menuItems.stream().map(this::toDto).collect(Collectors.toList());
	}

	public MenuItemDTO updateMenuItem(Long adminId, Long menuItemId, MenuItemDTO request) {
		validateId(adminId, "adminId");
		validateId(menuItemId, "menuItemId");
		validateMenuRequest(request);
		MenuItem menuItem = menuItemRepository.findById(menuItemId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
		verifyAdminOwnership(adminId, menuItem.getRestaurant().getRestaurantId());
		if (!menuItem.getRestaurant().getRestaurantId().equals(request.getRestaurantId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant id cannot be changed");
		}
		menuItem.setItemName(request.getItemName().trim());
		menuItem.setDescription(request.getDescription().trim());
		menuItem.setPrice(request.getPrice());
		menuItem.setAvailability(request.getAvailability() != null ? request.getAvailability() : menuItem.isAvailability());
		return toDto(menuItemRepository.save(menuItem));
	}

	public void deleteMenuItem(Long adminId, Long menuItemId) {
		validateId(adminId, "adminId");
		validateId(menuItemId, "menuItemId");
		MenuItem menuItem = menuItemRepository.findById(menuItemId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
		verifyAdminOwnership(adminId, menuItem.getRestaurant().getRestaurantId());
		menuItemRepository.delete(menuItem);
	}

	@Transactional(readOnly = true)
	public List<MenuItemDTO> listMenuItemsForCustomer(Long restaurantId, String itemName, Boolean available,
			BigDecimal minPrice, BigDecimal maxPrice) {
		validateId(restaurantId, "restaurantId");
		Restaurant restaurant = restaurantRepository.findById(restaurantId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));
		if (!restaurant.isActive()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found");
		}
		List<MenuItem> menuItems = menuItemRepository.searchByRestaurant(restaurantId, cleanFilter(itemName),
				available, minPrice, maxPrice);
		return menuItems.stream().map(this::toDto).collect(Collectors.toList());
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
		if (isBlank(request.getDescription())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
		}
		if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Price is invalid");
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

	private MenuItemDTO toDto(MenuItem menuItem) {
		MenuItemDTO dto = new MenuItemDTO();
		dto.setMenuItemId(menuItem.getMenuItemId());
		dto.setRestaurantId(menuItem.getRestaurant().getRestaurantId());
		dto.setItemName(menuItem.getItemName());
		dto.setDescription(menuItem.getDescription());
		dto.setPrice(menuItem.getPrice());
		dto.setAvailability(menuItem.isAvailability());
		return dto;
	}
}
