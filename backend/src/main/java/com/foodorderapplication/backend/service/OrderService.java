package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderStatus;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
    private final ConcurrentMap<Long, Order> orders = new ConcurrentHashMap<>();
    private final AtomicLong orderIdSeq = new AtomicLong(1);
    private final CartService cartService;
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;

    public OrderService(CartService cartService, UserRepository userRepository, MenuItemRepository menuItemRepository) {
        this.cartService = cartService;
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Transactional
    public Order createOrder(String userEmail) {
        Long userId = resolveUserId(userEmail);
        Cart cart = cartService.getCart(userEmail);
        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        // Ensure all items from same restaurant
        Long restaurantId = null;
        BigDecimal total = BigDecimal.ZERO;
        List<CartItem> itemsCopy = new ArrayList<>();
        for (CartItem ci : cart.getItems()) {
            MenuItem mi = menuItemRepository.findById(ci.getMenuItemId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found"));
            Long rId = mi.getRestaurant().getRestaurantId();
            if (restaurantId == null) {
                restaurantId = rId;
            } else if (!restaurantId.equals(rId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All cart items must be from the same restaurant");
            }
            BigDecimal line = mi.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            total = total.add(line);
            itemsCopy.add(new CartItem(ci.getMenuItemId(), ci.getQuantity()));
        }

        Order order = new Order();
        order.setOrderId(orderIdSeq.getAndIncrement());
        order.setUserId(userId);
        order.setRestaurantId(restaurantId);
        order.setTotalAmount(total);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        order.setItems(itemsCopy);

        orders.put(order.getOrderId(), order);
        cartService.clearCart(userEmail);
        return order;
    }

    public List<Order> listOrdersForUser(String userEmail) {
        Long userId = resolveUserId(userEmail);
        List<Order> result = new ArrayList<>();
        for (Order o : orders.values()) {
            if (o.getUserId().equals(userId)) {
                result.add(o);
            }
        }
        return result;
    }

    public Order getOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orders.get(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    @Transactional
    public Order cancelOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orders.get(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending orders can be cancelled");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        return order;
    }

    public Order trackOrder(String userEmail, Long orderId) {
        return getOrder(userEmail, orderId);
    }

    // Admin operations
    public List<Order> listAllOrders() {
        return new ArrayList<>(orders.values());
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orders.get(orderId);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        // Basic allowed flow check (allow setting any for admin but keep flow sane)
        order.setOrderStatus(status);
        return order;
    }

    public Order getOrderById(Long orderId) {
        Order order = orders.get(orderId);
        if (order == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }
}
