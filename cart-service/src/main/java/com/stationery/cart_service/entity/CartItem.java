package com.stationery.cart_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @ToString.Exclude
    private Cart cart;

    @Column(nullable = false)
    private Long productId;

    private String productName;
    private Double productPrice;
    private String productImageUrl;

    @Column(nullable = false)
    private Integer quantity;

    private Double subtotal;
}
