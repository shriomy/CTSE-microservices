package com.stationery.product_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    private String name;

    private String description;

    private Double price;

    private String imageUrl;

    private Boolean availability;
}
