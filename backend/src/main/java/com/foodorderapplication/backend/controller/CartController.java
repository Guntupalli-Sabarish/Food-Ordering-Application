package com.foodorderapplication.backend.controller;

import com.foodorderapplication.backend.dto.CartDTO;
import com.foodorderapplication.backend.dto.CartAddItemRequest;
import com.foodorderapplication.backend.dto.CartUpdateItemRequest;
import com.foodorderapplication.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/api/customer/cart")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> getCart(Authentication authentication) {
        CartDTO cart = cartService.getCart(authentication.getName());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/api/customer/cart/add")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> addItem(Authentication authentication, @jakarta.validation.Valid @RequestBody CartAddItemRequest body) {
        CartDTO cart = cartService.addItem(authentication.getName(), body.getMenuItemId(), body.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/api/customer/cart/update/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> updateItem(Authentication authentication, @PathVariable Long itemId,
            @jakarta.validation.Valid @RequestBody CartUpdateItemRequest body) {
        CartDTO cart = cartService.updateItem(authentication.getName(), itemId, body.getQuantity());
        return ResponseEntity.ok(cart);
    }



    @DeleteMapping("/api/customer/cart/remove/{itemId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> removeItem(Authentication authentication, @PathVariable Long itemId) {
        CartDTO cart = cartService.removeItem(authentication.getName(), itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/api/customer/cart/clear")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CartDTO> clearCart(Authentication authentication) {
        CartDTO cart = cartService.clearCart(authentication.getName());
        return ResponseEntity.ok(cart);
    }
}
