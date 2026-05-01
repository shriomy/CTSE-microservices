package com.stationery.cart_service.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stationery.cart_service.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderEventsListener {

    private final ObjectMapper mapper = new ObjectMapper();
    private final CartService cartService;

    @KafkaListener(topics = "order-paid-events", groupId = "cart-group")
    public void handleOrderPaid(String message) {
        try {
            JsonNode order = mapper.readTree(message);
            String orderId = order.has("id") ? order.get("id").asText() : "<unknown>";
            String userEmail = order.has("userEmail") ? order.get("userEmail").asText() : "<unknown>";

            log.info("[Kafka Consumer] Cart-service received order-paid event: orderId={}, userEmail={}", orderId, userEmail);

            // Clear cart asynchronously
            if (userEmail != null && !userEmail.isEmpty()) {
                try {
                    cartService.clearCart(userEmail);
                    log.info("[Kafka Consumer] Cleared cart for user {} after order {}", userEmail, orderId);
                } catch (Exception ex) {
                    log.error("Failed to clear cart for user {}", userEmail, ex);
                }
            }

        } catch (Exception e) {
            log.error("Failed to process order-paid event in cart-service", e);
        }
    }
}
