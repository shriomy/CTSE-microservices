package com.stationery.product_service.service;

import com.stationery.product_service.dto.CreateProductRequest;
import com.stationery.product_service.dto.UpdateProductRequest;
import com.stationery.product_service.dto.ProductResponse;
import com.stationery.product_service.entity.Product;
import com.stationery.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    // Admin only - Create a new product
    public ProductResponse createProduct(CreateProductRequest request) {
        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setAvailability(request.getAvailability());

        Product savedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(savedProduct);
    }

    // Admin only - Update a product
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getAvailability() != null) {
            product.setAvailability(request.getAvailability());
        }

        product.setUpdatedAt(System.currentTimeMillis());
        Product updatedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(updatedProduct);
    }

    // Admin only - Delete a product
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    // Public - Get all products
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Public - Get product by id
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ProductResponse.fromEntity(product);
    }

    // Public - Get available products
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findByAvailability(true)
                .stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    // Public - Search product by name
    public ProductResponse getProductByName(String name) {
        Product product = productRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Product not found with name: " + name));
        return ProductResponse.fromEntity(product);
    }

    // Decrement stock for a product. If stock would go negative, set availability to false and set stock to 0.
    public void decrementStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        Integer current = product.getStock() == null ? 0 : product.getStock();
        int updated = current - quantity;
        if (updated <= 0) {
            product.setStock(0);
            product.setAvailability(false);
        } else {
            product.setStock(updated);
        }

        product.setUpdatedAt(System.currentTimeMillis());
        productRepository.save(product);
    }
}
