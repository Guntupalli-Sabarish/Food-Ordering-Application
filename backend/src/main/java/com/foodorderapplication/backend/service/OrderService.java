package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.event.OrderNotificationEvent;
import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderItem;
import com.foodorderapplication.backend.model.Restaurant;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.repository.CartItemRepository;
import com.foodorderapplication.backend.repository.CartRepository;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.OrderItemRepository;
import com.foodorderapplication.backend.repository.OrderRepository;
import com.foodorderapplication.backend.repository.RestaurantRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OrderService {
    private final UserRepository userRepository;
    private final MenuItemRepository menuItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

        public OrderService(UserRepository userRepository, MenuItemRepository menuItemRepository,
            CartRepository cartRepository, CartItemRepository cartItemRepository, OrderRepository orderRepository,
            OrderItemRepository orderItemRepository, RestaurantRepository restaurantRepository,
            NotificationService notificationService, ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.notificationService = notificationService;
        this.eventPublisher = eventPublisher;
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public Map<String, Object> calculateQuote(String userEmail) {
        Long userId = resolveUserId(userEmail);
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }
        
        // Batch fetch all MenuItems in a single query to avoid N+1 RTT delays
        List<Long> menuItemIds = cartItems.stream().map(CartItem::getMenuItemId).toList();
        List<MenuItem> menuItems = menuItemRepository.findAllById(menuItemIds);
        Map<Long, MenuItem> menuItemMap = new java.util.HashMap<>();
        for (MenuItem mi : menuItems) {
            menuItemMap.put(mi.getMenuItemId(), mi);
        }

        validateCartItems(cartItems, menuItemMap);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            MenuItem mi = menuItemMap.get(ci.getMenuItemId());
            if (mi == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found");
            }
            BigDecimal line = mi.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(line);
        }

        BigDecimal deliveryFee = subtotal.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal("40.00") : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.08")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(deliveryFee).add(tax);

        java.util.Map<String, Object> quote = new java.util.HashMap<>();
        quote.put("subtotal", subtotal);
        quote.put("deliveryFee", deliveryFee);
        quote.put("tax", tax);
        quote.put("total", total);
        return quote;
    }

    private void validateCartItems(List<CartItem> cartItems, Map<Long, MenuItem> menuItemMap) {
        boolean cartCleaned = false;
        List<CartItem> toRemove = new ArrayList<>();
        for (CartItem ci : cartItems) {
            MenuItem mi = menuItemMap.get(ci.getMenuItemId());
            if (mi == null) {
                toRemove.add(ci);
                cartCleaned = true;
                continue;
            }
            if (!mi.isAvailability() || !mi.getRestaurant().isActive()) {
                toRemove.add(ci);
                cartCleaned = true;
            }
        }
        if (cartCleaned) {
            for (CartItem ci : toRemove) {
                cartItemRepository.delete(ci);
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some items in your cart are no longer available and have been removed.");
        }
    }

    @Transactional
    public Order createOrder(String userEmail) {
        return createOrder(userEmail, "Default Address", "COD", null);
    }

    @Transactional
    public Order createOrder(String userEmail, String deliveryAddress, String paymentMethod) {
        return createOrder(userEmail, deliveryAddress, paymentMethod, null);
    }

    @Transactional
    public Order createOrder(String userEmail, String deliveryAddress, String paymentMethod, String idempotencyKey) {
        // --- Check Idempotency First ---
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Order> existingOpt = orderRepository.findByIdempotencyKey(idempotencyKey.trim());
            if (existingOpt.isPresent()) {
                Order order = existingOpt.get();
                populateNamesIfNull(order);
                return order;
            }
        }

        // --- Validate inputs up front ---
        if (deliveryAddress == null || deliveryAddress.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery address is required");
        }
        // Normalize and validate payment method
        String normalizedMethod = (paymentMethod == null) ? "" : paymentMethod.trim().toUpperCase();
        // COD is the only supported payment method until a real payment provider is integrated.
        // CARD, UPI, and WALLET are explicitly blocked so no order rows or cart clears happen.
        if (!"COD".equals(normalizedMethod)) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Online payments (CARD, UPI, WALLET) are not available yet. Please use Cash on Delivery.");
        }

        Long userId = resolveUserId(userEmail);
        Cart cart = cartRepository.findByUserIdForUpdate(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        // Load all MenuItems in a single query to avoid N+1 RTT delays
        List<Long> menuItemIds = cartItems.stream().map(CartItem::getMenuItemId).toList();
        List<MenuItem> menuItems = menuItemRepository.findAllById(menuItemIds);
        Map<Long, MenuItem> menuItemMap = new java.util.HashMap<>();
        for (MenuItem mi : menuItems) {
            menuItemMap.put(mi.getMenuItemId(), mi);
        }

        validateCartItems(cartItems, menuItemMap);

        // Ensure all items from same restaurant
        Long restaurantId = null;
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            MenuItem mi = menuItemMap.get(ci.getMenuItemId());
            if (mi == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found");
            }
            Long rId = mi.getRestaurant().getRestaurantId();
            if (restaurantId == null) {
                restaurantId = rId;
            } else if (!restaurantId.equals(rId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "All cart items must be from the same restaurant");
            }
            BigDecimal line = mi.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity()));
            subtotal = subtotal.add(line);

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItemId(ci.getMenuItemId());
            orderItem.setQuantity(ci.getQuantity());
            orderItem.setUnitPrice(mi.getPrice());
            orderItem.setLineTotal(line);
            orderItem.setMenuItemName(mi.getItemName());
            orderItems.add(orderItem);
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"));

        BigDecimal deliveryFee = subtotal.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal("40.00") : BigDecimal.ZERO;
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.08")).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(deliveryFee).add(tax);

        Order order = new Order();
        order.setUserId(userId);
        order.setRestaurantId(restaurantId);
        order.setRestaurantName(restaurant.getName());
        order.setSubtotal(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTax(tax);
        order.setTotalAmount(total);
        order.setDeliveryAddress(deliveryAddress);
        order.setPaymentMethod(normalizedMethod);
        order.setIdempotencyKey(idempotencyKey != null && !idempotencyKey.isBlank() ? idempotencyKey.trim() : null);
        
        if ("COD".equals(normalizedMethod)) {
            order.setOrderStatus(OrderStatus.PENDING);
        } else {
            order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        }
        
        order.setCreatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        // Publish after-commit event — fires only when the transaction commits successfully
        eventPublisher.publishEvent(
                new OrderNotificationEvent(this, savedOrder, OrderNotificationEvent.Kind.CONFIRMATION));

        cartItemRepository.deleteByCart(cart);
        cart.getItems().clear();
        return savedOrder;
    }

    private void populateNamesIfNull(Order order) {
        if (order == null) {
            return;
        }
        if (order.getRestaurantName() == null) {
            restaurantRepository.findById(order.getRestaurantId()).ifPresent(r -> {
                order.setRestaurantName(r.getName());
                orderRepository.save(order);
            });
        }
        if (order.getItems() != null) {
            order.getItems().forEach(item -> {
                if (item.getMenuItemName() == null) {
                    menuItemRepository.findById(item.getMenuItemId()).ifPresent(mi -> {
                        item.setMenuItemName(mi.getItemName());
                        orderItemRepository.save(item);
                    });
                }
            });
        }
    }

    public org.springframework.data.domain.Page<Order> listOrdersForUser(String userEmail, org.springframework.data.domain.Pageable pageable) {
        Long userId = resolveUserId(userEmail);
        org.springframework.data.domain.Page<Order> orders = orderRepository.findByUserId(userId, pageable);
        orders.forEach(this::populateNamesIfNull);
        return orders;
    }

    public Order getOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        populateNamesIfNull(order);
        return order;
    }

    @Transactional
    public Order cancelOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending orders can be cancelled");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        eventPublisher.publishEvent(
                new OrderNotificationEvent(this, saved, OrderNotificationEvent.Kind.STATUS_UPDATE));
        populateNamesIfNull(saved);
        return saved;
    }

    public Order trackOrder(String userEmail, Long orderId) {
        return getOrder(userEmail, orderId);
    }

    // Admin operations
    public List<Order> listAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(this::populateNamesIfNull);
        return orders;
    }

    public org.springframework.data.domain.Page<Order> listOrdersForAdmin(String adminEmail, org.springframework.data.domain.Pageable pageable) {
        Long adminId = resolveUserId(adminEmail);
        Long restaurantId = restaurantRepository.findByAdminId(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"))
                .getRestaurantId();
        org.springframework.data.domain.Page<Order> orders = orderRepository.findByRestaurantId(restaurantId, pageable);
        orders.forEach(this::populateNamesIfNull);
        return orders;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!isValidTransition(order.getOrderStatus(), status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status transition from " + order.getOrderStatus() + " to " + status);
        }
        order.setOrderStatus(status);
        Order saved = orderRepository.save(order);
        eventPublisher.publishEvent(
                new OrderNotificationEvent(this, saved, OrderNotificationEvent.Kind.STATUS_UPDATE));
        return saved;
    }

    public Order updateOrderStatusForAdmin(String adminEmail, Long orderId, OrderStatus status) {
        Long adminId = resolveUserId(adminEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Long restaurantId = restaurantRepository.findByAdminId(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"))
                .getRestaurantId();
        if (!order.getRestaurantId().equals(restaurantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for this restaurant");
        }
        if (order.getOrderStatus() == OrderStatus.PENDING_PAYMENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update status of unpaid online orders");
        }
        if (!isValidTransition(order.getOrderStatus(), status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid order status transition from " + order.getOrderStatus() + " to " + status);
        }
        order.setOrderStatus(status);
        Order saved = orderRepository.save(order);
        eventPublisher.publishEvent(
                new OrderNotificationEvent(this, saved, OrderNotificationEvent.Kind.STATUS_UPDATE));
        return saved;
    }

    public Order getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        populateNamesIfNull(order);
        return order;
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return true;
        }
        if (current == OrderStatus.DELIVERED || current == OrderStatus.CANCELLED) {
            return false;
        }
        if (next == OrderStatus.CANCELLED) {
            return true;
        }
        switch (current) {
            case PENDING_PAYMENT:
                return next == OrderStatus.PENDING;
            case PENDING:
                return next == OrderStatus.ACCEPTED;
            case ACCEPTED:
                return next == OrderStatus.PREPARING;
            case PREPARING:
                return next == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY:
                return next == OrderStatus.DELIVERED;
            default:
                return false;
        }
    }

    private boolean isTerminalStatus(OrderStatus status) {
        return status == OrderStatus.DELIVERED || status == OrderStatus.CANCELLED;
    }
}
