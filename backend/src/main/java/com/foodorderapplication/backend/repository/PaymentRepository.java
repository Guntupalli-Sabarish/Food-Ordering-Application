package com.foodorderapplication.backend.repository;

import com.foodorderapplication.backend.model.Payment;
import com.foodorderapplication.backend.model.enums.PaymentStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);

    boolean existsByOrderIdAndPaymentStatusIn(Long orderId, Collection<PaymentStatus> statuses);
}
