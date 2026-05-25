package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.repository.CartItemRepository;
import com.foodorderapplication.backend.repository.CartRepository;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartService {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
            UserRepository userRepository, MenuItemRepository menuItemRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .map(User::getUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Transactional
    public Cart getCart(String userEmail) {
        Long userId = resolveUserId(userEmail);
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUserId(userId);
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public Cart addItem(String userEmail, Long menuItemId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
        }
        menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        Cart cart = getCart(userEmail);
        Optional<CartItem> existing = cartItemRepository.findByCartAndMenuItemId(cart, menuItemId);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem(menuItemId, quantity);
            item.setCart(cart);
            cartItemRepository.save(item);
            cart.getItems().add(item);
        }
        return cart;
    }

    @Transactional
    public Cart updateItem(String userEmail, Long menuItemId, int quantity) {
        if (quantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot be negative");
        }
        Cart cart = getCart(userEmail);
        CartItem item = cartItemRepository.findByCartAndMenuItemId(cart, menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        if (quantity == 0) {
            cartItemRepository.delete(item);
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return cart;
    }

    @Transactional
    public Cart removeItem(String userEmail, Long menuItemId) {
        Cart cart = getCart(userEmail);
        cartItemRepository.deleteByCartAndMenuItemId(cart, menuItemId);
        cart.getItems().removeIf(i -> i.getMenuItemId().equals(menuItemId));
        return cart;
    }

    @Transactional
    public void clearCart(String userEmail) {
        Cart cart = getCart(userEmail);
        cartItemRepository.deleteByCart(cart);
    }
}
