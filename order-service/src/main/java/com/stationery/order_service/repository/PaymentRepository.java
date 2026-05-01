package com.stationery.order_service.repository;

import com.stationery.order_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripeSessionId(String sessionId);
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findByStripePaymentIntentId(String intentId);
}
