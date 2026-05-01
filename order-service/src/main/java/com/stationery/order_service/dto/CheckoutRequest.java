package com.stationery.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {
    private String userEmail;
    private List<OrderItemRequest> items;
    private Double subtotalAmount;
    private Double taxAmount;
    private Double shippingAmount;
    private Double totalAmount;
    private String shippingAddress;
    private String shippingCity;
    private String shippingZipCode;
    private String shippingCountry;
    private String billingAddress;
    private String billingCity;
    private String billingZipCode;
    private String billingCountry;
}
