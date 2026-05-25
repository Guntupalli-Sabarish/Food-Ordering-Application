package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.MenuItemDTO;
import com.foodorderapplication.backend.service.MenuService;
import java.math.BigDecimal;
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
public class MenuController {
	private final MenuService menuService;

	public MenuController(MenuService menuService) {
		this.menuService = menuService;
	}

	@PostMapping("/api/admin/menu")
	public ResponseEntity<MenuItemDTO> createMenuItem(@RequestParam Long adminId,
			@RequestBody MenuItemDTO request) {
		return ResponseEntity.ok(menuService.createMenuItem(adminId, request));
	}

	@GetMapping("/api/admin/menu")
	public ResponseEntity<List<MenuItemDTO>> listMenuItemsForAdmin(@RequestParam Long adminId,
			@RequestParam(required = false) Long restaurantId,
			@RequestParam(required = false) String itemName,
			@RequestParam(required = false) Boolean available,
			@RequestParam(required = false) BigDecimal minPrice,
			@RequestParam(required = false) BigDecimal maxPrice) {
		return ResponseEntity.ok(menuService.listMenuItemsForAdmin(adminId, restaurantId, itemName, available,
				minPrice, maxPrice));
	}

	@PutMapping("/api/admin/menu/{id}")
	public ResponseEntity<MenuItemDTO> updateMenuItem(@RequestParam Long adminId,
			@PathVariable Long id,
			@RequestBody MenuItemDTO request) {
		return ResponseEntity.ok(menuService.updateMenuItem(adminId, id, request));
	}

	@DeleteMapping("/api/admin/menu/{id}")
	public ResponseEntity<Void> deleteMenuItem(@RequestParam Long adminId, @PathVariable Long id) {
		menuService.deleteMenuItem(adminId, id);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/api/customer/menu/{restaurantId}")
	public ResponseEntity<List<MenuItemDTO>> listMenuItemsForCustomer(@PathVariable Long restaurantId,
			@RequestParam(required = false) String itemName,
			@RequestParam(required = false) Boolean available,
			@RequestParam(required = false) BigDecimal minPrice,
			@RequestParam(required = false) BigDecimal maxPrice) {
		return ResponseEntity.ok(menuService.listMenuItemsForCustomer(restaurantId, itemName, available, minPrice,
				maxPrice));
	}
}
