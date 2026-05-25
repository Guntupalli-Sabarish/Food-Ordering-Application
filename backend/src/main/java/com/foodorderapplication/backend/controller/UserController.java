package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.UserDTO;
import com.foodorderapplication.backend.service.UserService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/superadmin/users")
public class UserController {
	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<List<UserDTO>> listUsers() {
		return ResponseEntity.ok(userService.listUsers());
	}

	@GetMapping("/{id}")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
		return ResponseEntity.ok(userService.getUser(id));
	}

	@PutMapping("/{id}/role")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<UserDTO> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
		return ResponseEntity.ok(userService.updateRole(id, body.get("role")));
	}

	@DeleteMapping("/{id}")
	@PreAuthorize("hasRole('SUPER_ADMIN')")
	public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
		userService.deleteUser(id);
		return ResponseEntity.noContent().build();
	}
}
