package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.UserDTO;
import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.model.enums.UserRole;
import com.foodorderapplication.backend.repository.OrderRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {
	private static final List<OrderStatus> TERMINAL_STATUSES = Arrays.asList(OrderStatus.DELIVERED, OrderStatus.CANCELLED);
	private final UserRepository userRepository;
	private final OrderRepository orderRepository;

	public UserService(UserRepository userRepository, OrderRepository orderRepository) {
		this.userRepository = userRepository;
		this.orderRepository = orderRepository;
	}

	public List<UserDTO> listUsers() {
		return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
	}

	public UserDTO getUser(Long userId) {
		return toDto(findUser(userId));
	}

	public UserDTO updateRole(Long userId, String role) {
		User user = findUser(userId);
		user.setRole(parseRole(role));
		return toDto(userRepository.save(user));
	}

	public void deleteUser(Long userId) {
		User user = findUser(userId);
		// Guard: do not delete if there are non-terminal orders for this user
		if (orderRepository.existsByUserIdAndOrderStatusNotIn(user.getUserId(), TERMINAL_STATUSES)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT,
					"Cannot delete user with active orders");
		}
		userRepository.delete(user);
	}

	private User findUser(Long userId) {
		if (userId == null || userId <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user id");
		}
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
	}

	private UserRole parseRole(String role) {
		if (role == null || role.trim().isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
		}
		try {
			return UserRole.valueOf(role.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
		}
	}

	private UserDTO toDto(User user) {
		UserDTO dto = new UserDTO();
		dto.setUserId(user.getUserId());
		dto.setName(user.getName());
		dto.setEmail(user.getEmail());
		dto.setRole(user.getRole().name());
		dto.setCreatedAt(user.getCreatedAt());
		return dto;
	}
}
