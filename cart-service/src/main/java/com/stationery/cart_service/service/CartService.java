package com.stationery.cart_service.service;

import com.stationery.cart_service.dto.*;
import com.stationery.cart_service.entity.Cart;
import com.stationery.cart_service.entity.CartItem;
import com.stationery.cart_service.entity.Coupon;
import com.stationery.cart_service.repository.CartItemRepository;
import com.stationery.cart_service.repository.CartRepository;
import com.stationery.cart_service.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final ProductClient productClient;

    @Transactional(readOnly = true)
    public CartResponse getCart(String userEmail) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserEmail(userEmail);
            newCart.setItems(new ArrayList<>());
            return newCart;
        });
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(String userEmail, AddToCartRequest request) {
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        // 1. Inventory Validation (Inter-service call)
        ProductClientResponse product = productClient.getProductById(request.getProductId());
        if (product == null) {
            throw new RuntimeException("Product not found");
        }
        if (!Boolean.TRUE.equals(product.getAvailability())) {
            throw new RuntimeException("Sorry, " + product.getName() + " is currently out of stock.");
        }

        Cart cart = cartRepository.findByUserEmail(userEmail).orElseGet(() -> {
            Cart newCart = Cart.builder()
                    .userEmail(userEmail)
                    .items(new ArrayList<>())
                    .build();
            return cartRepository.save(newCart);
        });

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            existingItem.setSubtotal(existingItem.getQuantity() * existingItem.getProductPrice());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productPrice(product.getPrice())
                    .productImageUrl(product.getImageUrl())
                    .quantity(request.getQuantity())
                    .subtotal(product.getPrice() * request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return mapToCartResponse(savedCart);
    }

    @Transactional
    public CartResponse applyCoupon(String userEmail, String couponCode) {
        Cart cart = cartRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isActive() || (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now()))) {
            throw new RuntimeException("Coupon has expired or is inactive");
        }

        cart.setAppliedCoupon(coupon);
        Cart savedCart = cartRepository.save(cart);
        return mapToCartResponse(savedCart);
    }

    @Transactional
    public CartResponse removeCoupon(String userEmail) {
        Cart cart = cartRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        cart.setAppliedCoupon(null);
        Cart savedCart = cartRepository.save(cart);
        return mapToCartResponse(savedCart);
    }

    // Admin methods for coupon management
    @Transactional(readOnly = true)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Transactional
    public Coupon saveCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    @Transactional
    public CartResponse updateItemQuantity(String userEmail, Long itemId, UpdateCartItemRequest request) {
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        Cart cart = cartRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        CartItem itemToUpdate = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in cart"));

        itemToUpdate.setQuantity(request.getQuantity());
        itemToUpdate.setSubtotal(itemToUpdate.getQuantity() * itemToUpdate.getProductPrice());

        Cart savedCart = cartRepository.save(cart);
        return mapToCartResponse(savedCart);
    }

    @Transactional
    public CartResponse removeItemFromCart(String userEmail, Long itemId) {
        Cart cart = cartRepository.findByUserEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        
        Cart savedCart = cartRepository.save(cart);
        return mapToCartResponse(savedCart);
    }

    @Transactional
    public void clearCart(String userEmail) {
        Cart cart = cartRepository.findByUserEmail(userEmail).orElse(null);
        if (cart != null) {
            cart.getItems().clear();
            cart.setAppliedCoupon(null);
            cartRepository.save(cart);
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream().map(item ->
                CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productPrice(item.getProductPrice())
                        .productImageUrl(item.getProductImageUrl())
                        .quantity(item.getQuantity())
                        .subtotal(item.getSubtotal())
                        .build()
        ).collect(Collectors.toList());

        Double totalAmount = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        Double discountAmount = 0.0;
        String couponCode = null;
        if (cart.getAppliedCoupon() != null) {
            couponCode = cart.getAppliedCoupon().getCode();
            discountAmount = totalAmount * (cart.getAppliedCoupon().getDiscountPercentage() / 100.0);
        }

        return CartResponse.builder()
                .id(cart.getId())
                .userEmail(cart.getUserEmail())
                .items(itemResponses)
                .totalAmount(totalAmount)
                .appliedCouponCode(couponCode)
                .discountAmount(discountAmount)
                .finalAmount(totalAmount - discountAmount)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    public ProductClientResponse testProductFetch(Long id) {
        return productClient.getProductById(id);
    }
}
