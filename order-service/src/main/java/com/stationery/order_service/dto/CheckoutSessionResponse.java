package com.stationery.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutSessionResponse {
    private Long orderId;
    private String sessionId;
    private String checkoutUrl;
}
