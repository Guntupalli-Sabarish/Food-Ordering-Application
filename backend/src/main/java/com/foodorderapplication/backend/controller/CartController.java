package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.service.CartService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
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
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/api/customer/cart")
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        Cart cart = cartService.getCart(authentication.getName());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/api/customer/cart/add")
    public ResponseEntity<Cart> addItem(Authentication authentication, @RequestBody Map<String, Object> body) {
        Long menuItemId = ((Number) body.get("menuItemId")).longValue();
        int quantity = ((Number) body.getOrDefault("quantity", 1)).intValue();
        Cart cart = cartService.addItem(authentication.getName(), menuItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/api/customer/cart/update/{itemId}")
    public ResponseEntity<Cart> updateItem(Authentication authentication, @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {
        int quantity = ((Number) body.getOrDefault("quantity", 0)).intValue();
        Cart cart = cartService.updateItem(authentication.getName(), itemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/api/customer/cart/remove/{itemId}")
    public ResponseEntity<Cart> removeItem(Authentication authentication, @PathVariable Long itemId) {
        Cart cart = cartService.removeItem(authentication.getName(), itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/api/customer/cart/clear")
    public ResponseEntity<Map<String, String>> clearCart(Authentication authentication) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }
}
