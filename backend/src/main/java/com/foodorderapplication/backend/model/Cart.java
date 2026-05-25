package com.foodorderapplication.backend.model;

import java.util.ArrayList;
import java.util.List;

public class Cart {
    private Long cartId;
    private Long userId;
    private List<CartItem> items = new ArrayList<>();

    public Cart() {}

    public Cart(Long cartId, Long userId) {
        this.cartId = cartId;
        this.userId = userId;
    }

    public Long getCartId() {
        return cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    public void setItems(List<CartItem> items) {
        this.items = items;
    }
}
