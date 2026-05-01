package com.stationery.product_service.dto;

import lombok.*;
import com.stationery.product_service.entity.Product;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Boolean availability;
    private Long createdAt;
    private Long updatedAt;

    public static ProductResponse fromEntity(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.getImageUrl(),
            product.getAvailability(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}
