package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.Cart;
import com.foodorderapplication.backend.model.CartItem;
import com.foodorderapplication.backend.model.MenuItem;
import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderItem;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.repository.CartItemRepository;
import com.foodorderapplication.backend.repository.CartRepository;
import com.foodorderapplication.backend.repository.MenuItemRepository;
import com.foodorderapplication.backend.repository.OrderItemRepository;
import com.foodorderapplication.backend.repository.OrderRepository;
import com.foodorderapplication.backend.repository.RestaurantRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import com.foodorderapplication.backend.util.EmailRequest;
import com.foodorderapplication.backend.util.EmailType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
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

        public OrderService(UserRepository userRepository, MenuItemRepository menuItemRepository,
            CartRepository cartRepository, CartItemRepository cartItemRepository, OrderRepository orderRepository,
            OrderItemRepository orderItemRepository, RestaurantRepository restaurantRepository,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.menuItemRepository = menuItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.notificationService = notificationService;
    }

    private Long resolveUserId(String email) {
        return userRepository.findByEmail(email)
                .map(u -> u.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Transactional
    public Order createOrder(String userEmail) {
        Long userId = resolveUserId(userEmail);
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        // Ensure all items from same restaurant
        Long restaurantId = null;
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
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

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItemId(ci.getMenuItemId());
            orderItem.setQuantity(ci.getQuantity());
            orderItem.setUnitPrice(mi.getPrice());
            orderItem.setLineTotal(line);
            orderItems.add(orderItem);
        }

        Order order = new Order();
        order.setUserId(userId);
        order.setRestaurantId(restaurantId);
        order.setTotalAmount(total);
        order.setOrderStatus(OrderStatus.PENDING);
        order.setCreatedAt(LocalDateTime.now());
        Order savedOrder = orderRepository.save(order);

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(savedOrder);
        }
        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        sendOrderConfirmationEmail(savedOrder);

        cartItemRepository.deleteByCart(cart);
        return savedOrder;
    }

    public List<Order> listOrdersForUser(String userEmail) {
        Long userId = resolveUserId(userEmail);
        return orderRepository.findByUserId(userId);
    }

    public Order getOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return order;
    }

    @Transactional
    public Order cancelOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending orders can be cancelled");
        }
        order.setOrderStatus(OrderStatus.CANCELLED);
        Order saved = orderRepository.save(order);
        sendOrderStatusEmail(saved);
        return saved;
    }

    public Order trackOrder(String userEmail, Long orderId) {
        return getOrder(userEmail, orderId);
    }

    // Admin operations
    public List<Order> listAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> listOrdersForAdmin(String adminEmail) {
        Long adminId = resolveUserId(adminEmail);
        Long restaurantId = restaurantRepository.findByAdminId(adminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurant not found"))
                .getRestaurantId();
        return orderRepository.findByRestaurantId(restaurantId);
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        order.setOrderStatus(status);
        Order saved = orderRepository.save(order);
        sendOrderStatusEmail(saved);
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
        order.setOrderStatus(status);
        Order saved = orderRepository.save(order);
        sendOrderStatusEmail(saved);
        return saved;
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    private void sendOrderStatusEmail(Order order) {
        if (order == null) {
            return;
        }
        userRepository.findById(order.getUserId()).ifPresent(user -> {
            EmailRequest request = new EmailRequest();
            request.setTo(user.getEmail());
            request.setType(EmailType.ORDER_STATUS_UPDATE);
            request.setContext(java.util.Map.of(
                    "name", user.getName() == null ? "Customer" : user.getName(),
                    "orderId", String.valueOf(order.getOrderId()),
                    "status", order.getOrderStatus().name()));
            notificationService.sendEmail(request);
        });
    }

    private void sendOrderConfirmationEmail(Order order) {
        if (order == null) {
            return;
        }
        userRepository.findById(order.getUserId()).ifPresent(user -> {
            EmailRequest request = new EmailRequest();
            request.setTo(user.getEmail());
            request.setType(EmailType.ORDER_CONFIRMATION);
            request.setContext(java.util.Map.of(
                    "name", user.getName() == null ? "Customer" : user.getName(),
                    "orderId", String.valueOf(order.getOrderId())));
            notificationService.sendEmail(request);
        });
    }
}
