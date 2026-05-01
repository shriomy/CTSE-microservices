package com.stationery.cart_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductClientResponse {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Boolean availability;
    private Long createdAt;
    private Long updatedAt;
}
