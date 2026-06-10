package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.MenuItemDTO;
import com.foodorderapplication.backend.service.MenuService;
import java.math.BigDecimal;
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
public class MenuController {
	private final MenuService menuService;

	public MenuController(MenuService menuService) {
		this.menuService = menuService;
	}

	@PostMapping("/api/admin/menu")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<MenuItemDTO> createMenuItem(Authentication authentication,
			@RequestBody MenuItemDTO request) {
		return ResponseEntity.ok(menuService.createMenuItem(authentication.getName(), request));
	}

	@GetMapping("/api/admin/menu")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<org.springframework.data.domain.Page<MenuItemDTO>> listMenuItemsForAdmin(Authentication authentication,
			@RequestParam(required = false) Long restaurantId,
			@RequestParam(required = false) String itemName,
			@RequestParam(required = false) Boolean available,
			@RequestParam(required = false) BigDecimal minPrice,
			@RequestParam(required = false) BigDecimal maxPrice,
			org.springframework.data.domain.Pageable pageable) {
		return ResponseEntity.ok(menuService.listMenuItemsForAdmin(authentication.getName(), restaurantId, itemName,
				available, minPrice, maxPrice, pageable));
	}

	@PutMapping("/api/admin/menu/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<MenuItemDTO> updateMenuItem(Authentication authentication, @PathVariable Long id,
			@RequestBody MenuItemDTO request) {
		return ResponseEntity.ok(menuService.updateMenuItem(authentication.getName(), id, request));
	}

	@DeleteMapping("/api/admin/menu/{id}")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<Void> deleteMenuItem(Authentication authentication, @PathVariable Long id) {
		menuService.deleteMenuItem(authentication.getName(), id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/api/customer/menu/{restaurantId}")
	@PreAuthorize("hasRole('CUSTOMER')")
	public ResponseEntity<org.springframework.data.domain.Page<MenuItemDTO>> listMenuItemsForCustomer(@PathVariable Long restaurantId,
			@RequestParam(required = false) String itemName,
			@RequestParam(required = false) Boolean available,
			@RequestParam(required = false) BigDecimal minPrice,
			@RequestParam(required = false) BigDecimal maxPrice,
			org.springframework.data.domain.Pageable pageable) {
		return ResponseEntity.ok(menuService.listMenuItemsForCustomer(restaurantId, itemName, available, minPrice,
				maxPrice, pageable));
	}
}
