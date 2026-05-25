package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndMenuItemId(Cart cart, Long menuItemId);

    List<CartItem> findByCart(Cart cart);

    void deleteByCart(Cart cart);

    void deleteByCartAndMenuItemId(Cart cart, Long menuItemId);
}
