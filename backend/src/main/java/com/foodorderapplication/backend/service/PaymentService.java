package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.enums.OrderStatus;
import com.foodorderapplication.backend.model.Payment;
import com.foodorderapplication.backend.repository.OrderRepository;
import com.foodorderapplication.backend.repository.PaymentRepository;
import com.foodorderapplication.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public PaymentService(PaymentRepository paymentRepository, OrderRepository orderRepository,
            UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Payment initiatePayment(String userEmail, Long orderId,
            com.foodorderapplication.backend.model.enums.PaymentMethod method) {
        Long userId = resolveUserId(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for this order");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot pay for a cancelled order");
        }
        Payment p = new Payment();
        p.setOrderId(orderId);
        p.setPaymentMethod(method);
        p.setPaymentStatus(com.foodorderapplication.backend.model.enums.PaymentStatus.PENDING);
        p.setAmount(order.getTotalAmount());
        p.setCreatedAt(LocalDateTime.now());
        return paymentRepository.save(p);
    }

    @Transactional
    public Payment verifyPayment(String userEmail, Long paymentId, boolean success) {
        Long userId = resolveUserId(userEmail);
        Payment p = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        Order order = orderRepository.findById(p.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for this payment");
        }
        if (success) {
            p.setPaymentStatus(com.foodorderapplication.backend.model.enums.PaymentStatus.PAID);
            // move order forward to ACCEPTED
            order.setOrderStatus(OrderStatus.ACCEPTED);
            orderRepository.save(order);
        } else {
            p.setPaymentStatus(com.foodorderapplication.backend.model.enums.PaymentStatus.FAILED);
        }
        return paymentRepository.save(p);
    }

    public List<Payment> getPaymentsForOrder(String userEmail, Long orderId) {
        Long userId = resolveUserId(userEmail);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed for this order");
        }
        return paymentRepository.findByOrderId(orderId);
    }

    private Long resolveUserId(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"))
                .getUserId();
    }
}
