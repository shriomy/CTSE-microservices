package com.stationery.order_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartClient {

    private final RestTemplate restTemplate;

    @Value("${cart-service.url:http://localhost:8084}")
    private String cartServiceUrl;

    public LinkedHashMap<String, Object> getCart(String userEmail) {
        try {
            String url = cartServiceUrl + "/api/cart";
            return restTemplate.getForObject(url, LinkedHashMap.class);
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Cart not found for user: {}", userEmail);
            throw new RuntimeException("Cart not found");
        } catch (Exception e) {
            log.error("Error communicating with cart-service: {}", e.getMessage());
            throw new RuntimeException("Could not fetch cart details: " + e.getMessage());
        }
    }

    public LinkedHashMap<String, Object> clearCart() {
        try {
            String url = cartServiceUrl + "/api/cart/clear";
            restTemplate.delete(url);
            return new LinkedHashMap<>();
        } catch (Exception e) {
            log.error("Error clearing cart: {}", e.getMessage());
            throw new RuntimeException("Could not clear cart: " + e.getMessage());
        }
    }
}
