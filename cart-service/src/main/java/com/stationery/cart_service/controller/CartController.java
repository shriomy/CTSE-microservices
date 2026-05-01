package com.stationery.cart_service.controller;

import com.stationery.cart_service.dto.AddToCartRequest;
import com.stationery.cart_service.dto.CartResponse;
import com.stationery.cart_service.dto.UpdateCartItemRequest;
import com.stationery.cart_service.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.stationery.cart_service.entity.Coupon;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(cartService.getCart(userEmail));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(cartService.addItemToCart(userEmail, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(cartService.updateItemQuantity(userEmail, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItemFromCart(
            Authentication authentication,
            @PathVariable Long itemId) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(cartService.removeItemFromCart(userEmail, itemId));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        String userEmail = authentication.getName();
        cartService.clearCart(userEmail);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/coupon")
    public ResponseEntity<CartResponse> applyCoupon(
            Authentication authentication,
            @RequestBody java.util.Map<String, String> request) {
        String userEmail = authentication.getName();
        String code = request.get("code");
        return ResponseEntity.ok(cartService.applyCoupon(userEmail, code));
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<CartResponse> removeCoupon(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(cartService.removeCoupon(userEmail));
    }

    // Admin endpoints for coupon management
    @GetMapping("/admin/coupons")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(cartService.getAllCoupons());
    }

    @PostMapping("/admin/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(cartService.saveCoupon(coupon));
    }

    @DeleteMapping("/admin/coupons/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        cartService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/test-product/{id}")
    public ResponseEntity<?> testProduct(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(cartService.testProductFetch(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching product: " + e.getMessage());
        }
    }
}
