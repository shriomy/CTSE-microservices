package com.stationery.product_service.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product description is required")
    private String description;

    @NotNull(message = "Product price is required")
    @Positive(message = "Price must be greater than 0")
    private Double price;

    @NotBlank(message = "Image URL is required")
    private String imageUrl;

    @NotNull(message = "Availability status is required")
    private Boolean availability;
}
