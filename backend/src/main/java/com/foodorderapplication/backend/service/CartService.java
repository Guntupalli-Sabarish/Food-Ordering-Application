package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.dto.CartDTO;
import com.foodorderapplication.backend.dto.CartItemDTO;
import com.foodorderapplication.backend.dto.MenuItemDTO;
import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.model.User;
import com.foodorderapplication.backend.repository.CartItemRepository;
import com.foodorderapplication.backend.repository.CartRepository;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.UserRepository;
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
    public CartDTO getCart(String userEmail) {
        Long userId = resolveUserId(userEmail);
        return cartRepository.findByUserId(userId)
                .map(this::toDto)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUserId(userId);
                    return toDto(cartRepository.save(cart));
                });
    }

    @Transactional
    public CartDTO addItem(String userEmail, Long menuItemId, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
        }
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        if (!menuItem.isAvailability()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Menu item is currently unavailable");
        }
        if (!menuItem.getRestaurant().isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Restaurant is currently inactive");
        }
        Cart cart = getCartEntity(userEmail);
        // Cross-restaurant guard: all cart items must belong to the same restaurant
        java.util.List<CartItem> existingItems = cartItemRepository.findByCart(cart);
        if (!existingItems.isEmpty()) {
            Long existingRestaurantId = menuItemRepository.findById(existingItems.get(0).getMenuItemId())
                    .map(m -> m.getRestaurant().getRestaurantId())
                    .orElse(null);
            if (existingRestaurantId != null &&
                    !existingRestaurantId.equals(menuItem.getRestaurant().getRestaurantId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Cart contains items from another restaurant. Clear cart to add items from this restaurant.");
            }
        }
        java.util.Optional<CartItem> existing = cartItemRepository.findByCartAndMenuItemId(cart, menuItemId);
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
        return toDto(cartRepository.findById(cart.getCartId()).orElse(cart));
    }

    @Transactional
    public CartDTO updateItem(String userEmail, Long menuItemId, int quantity) {
        if (quantity < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity cannot be negative");
        }
        Cart cart = getCartEntity(userEmail);
        CartItem item = cartItemRepository.findByCartAndMenuItemId(cart, menuItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        if (quantity == 0) {
            cartItemRepository.delete(item);
            cart.getItems().remove(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return toDto(cartRepository.findById(cart.getCartId()).orElse(cart));
    }

    @Transactional
    public CartDTO removeItem(String userEmail, Long menuItemId) {
        Cart cart = getCartEntity(userEmail);
        cartItemRepository.deleteByCartAndMenuItemId(cart, menuItemId);
        cart.getItems().removeIf(i -> i.getMenuItemId().equals(menuItemId));
        return toDto(cartRepository.findById(cart.getCartId()).orElse(cart));
    }

    @Transactional
    public CartDTO clearCart(String userEmail) {
        Cart cart = getCartEntity(userEmail);
        cartItemRepository.deleteByCart(cart);
        cart.getItems().clear();
        return toDto(cartRepository.findById(cart.getCartId()).orElse(cart));
    }

    private Cart getCartEntity(String userEmail) {
        Long userId = resolveUserId(userEmail);
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUserId(userId);
                    return cartRepository.save(cart);
                });
    }

    private CartDTO toDto(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setCartId(cart.getCartId());
        dto.setUserId(cart.getUserId());
        dto.setItems(cartItemRepository.findByCart(cart).stream().map(this::toCartItemDto).toList());
        return dto;
    }

    private CartItemDTO toCartItemDto(CartItem item) {
        MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
        CartItemDTO dto = new CartItemDTO();
        dto.setMenuItem(toMenuItemDto(menuItem));
        dto.setQuantity(item.getQuantity());
        return dto;
    }

    private MenuItemDTO toMenuItemDto(MenuItem menuItem) {
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
