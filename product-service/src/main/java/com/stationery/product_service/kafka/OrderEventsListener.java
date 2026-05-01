package com.stationery.product_service.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stationery.product_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderEventsListener {

    private final ObjectMapper mapper = new ObjectMapper();
    private final ProductService productService;

    @KafkaListener(topics = "order-paid-events", groupId = "product-group")
    public void handleOrderPaid(String message) {
        try {
            JsonNode order = mapper.readTree(message);
            String orderId = order.has("id") ? order.get("id").asText() : "<unknown>";
            String userEmail = order.has("userEmail") ? order.get("userEmail").asText() : "<unknown>";

            log.info("[Kafka Consumer] Received order-paid event: orderId={}, userEmail={}", orderId, userEmail);

            if (order.has("items") && order.get("items").isArray()) {
                for (JsonNode item : order.get("items")) {
                    Long productId = item.has("productId") ? item.get("productId").asLong() : null;
                    int qty = item.has("quantity") ? item.get("quantity").asInt() : 0;
                    log.info("[Kafka Consumer] Item: productId={} qty={}", productId, qty);

                    if (productId != null && qty > 0) {
                        try {
                            productService.decrementStock(productId, qty);
                            log.info("[Kafka Consumer] Decremented stock for productId={} by {}", productId, qty);
                        } catch (Exception ex) {
                            log.error("Failed to decrement stock for productId={}", productId, ex);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to process order-paid event", e);
        }
    }
}
