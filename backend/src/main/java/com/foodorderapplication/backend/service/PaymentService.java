package com.foodorderapplication.backend.service;

import com.foodorderapplication.backend.model.Order;
import com.foodorderapplication.backend.model.OrderStatus;
import com.foodorderapplication.backend.model.Payment;
import com.foodorderapplication.backend.model.PaymentMethod;
import com.foodorderapplication.backend.model.PaymentStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {
    private final ConcurrentMap<Long, Payment> payments = new ConcurrentHashMap<>();
    private final AtomicLong paymentIdSeq = new AtomicLong(1);
    private final OrderService orderService;

    public PaymentService(OrderService orderService) {
        this.orderService = orderService;
    }

    @Transactional
    public Payment initiatePayment(Long orderId, PaymentMethod method) {
        Order order = orderService.getOrderById(orderId);
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot pay for a cancelled order");
        }
        Payment p = new Payment();
        p.setPaymentId(paymentIdSeq.getAndIncrement());
        p.setOrderId(orderId);
        p.setPaymentMethod(method);
        p.setPaymentStatus(PaymentStatus.PENDING);
        p.setAmount(order.getTotalAmount());
        p.setCreatedAt(LocalDateTime.now());
        payments.put(p.getPaymentId(), p);
        return p;
    }

    @Transactional
    public Payment verifyPayment(Long paymentId, boolean success) {
        Payment p = payments.get(paymentId);
        if (p == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found");
        }
        if (success) {
            p.setPaymentStatus(PaymentStatus.PAID);
            // move order forward to ACCEPTED
            orderService.updateOrderStatus(p.getOrderId(), OrderStatus.ACCEPTED);
        } else {
            p.setPaymentStatus(PaymentStatus.FAILED);
        }
        return p;
    }

    public List<Payment> getPaymentsForOrder(Long orderId) {
        List<Payment> result = new ArrayList<>();
        for (Payment p : payments.values()) {
            if (p.getOrderId().equals(orderId)) {
                result.add(p);
            }
        }
        return result;
    }
}
