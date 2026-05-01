package com.stationery.product_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private Boolean availability = true;

    @Column(nullable = false, updatable = false)
    private Long createdAt = System.currentTimeMillis();

    @Column(nullable = false)
    private Long updatedAt = System.currentTimeMillis();

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer stock = 0;
}
