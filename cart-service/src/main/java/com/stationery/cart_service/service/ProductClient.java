package com.stationery.cart_service.service;

import com.stationery.cart_service.dto.ProductClientResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductClient {

    private final RestTemplate restTemplate;

    @Value("${product-service.url}")
    private String productServiceUrl;

    public ProductClientResponse getProductById(Long productId) {
        String url = productServiceUrl + "/api/products/" + productId;
        try {
            return restTemplate.getForObject(url, ProductClientResponse.class);
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Product not found with id: {}", productId);
            throw new RuntimeException("Product not found with id: " + productId);
        } catch (Exception e) {
            log.error("Error communicating with product-service", e);
            throw new RuntimeException("Could not fetch product details for id: " + productId);
        }
    }
}
