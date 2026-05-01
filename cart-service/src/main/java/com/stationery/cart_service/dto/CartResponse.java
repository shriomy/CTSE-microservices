package com.stationery.cart_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponse {
    private Long id;
    private String userEmail;
    private List<CartItemResponse> items;
    private Double totalAmount;
    private String appliedCouponCode;
    private Double discountAmount;
    private Double finalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
