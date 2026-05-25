package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import com.foodorderapplication.backend.model.User;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartService {
    private final ConcurrentMap<Long, Cart> carts = new ConcurrentHashMap<>();
    private final AtomicLong cartIdSeq = new AtomicLong(1);
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public CartService(UserRepository userRepository, MenuItemRepository menuItemRepository) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public Cart getCart(String userEmail) {
        Long userId = resolveUserId(userEmail);
        return carts.computeIfAbsent(userId, id -> new Cart(cartIdSeq.getAndIncrement(), id));
    }

    public Cart addItem(String userEmail, Long menuItemId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
        }
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        Cart cart = getCart(userEmail);
        Optional<CartItem> existing = cart.getItems().stream()
                .filter(i -> i.getMenuItemId().equals(menuItemId)).findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantity(existing.get().getQuantity() + quantity);
        } else {
            cart.getItems().add(new CartItem(menuItemId, quantity));
        }
        return cart;
    }

    public Cart updateItem(String userEmail, Long menuItemId, int quantity) {
        if (quantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot be negative");
        }
        Cart cart = getCart(userEmail);
        CartItem item = cart.getItems().stream().filter(i -> i.getMenuItemId().equals(menuItemId))
                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        if (quantity == 0) {
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
        }
        return cart;
    }

    public Cart removeItem(String userEmail, Long menuItemId) {
        Cart cart = getCart(userEmail);
        cart.getItems().removeIf(i -> i.getMenuItemId().equals(menuItemId));
        return cart;
    }

    public void clearCart(String userEmail) {
        Cart cart = getCart(userEmail);
        cart.getItems().clear();
    }
}
