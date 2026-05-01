package com.stationery.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String stripePaymentIntentId;
    private String stripeSessionId;
    private Double amount;
    private String status;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
