package com.stationery.order_service.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.stationery.order_service.entity.Order;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderEventProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishOrderCreated(Order order) {
        try {
            String orderJson = objectMapper.writeValueAsString(order);
            kafkaTemplate.send("order-created-events", order.getUserEmail(), orderJson);
            log.info("Order created event published for order: {}", order.getId());
        } catch (Exception e) {
            log.error("Error publishing order created event: {}", e.getMessage());
        }
    }

    public void publishOrderPaid(Order order) {
        try {
            String orderJson = objectMapper.writeValueAsString(order);
            kafkaTemplate.send("order-paid-events", order.getUserEmail(), orderJson);
            log.info("Order paid event published for order: {}", order.getId());
        } catch (Exception e) {
            log.error("Error publishing order paid event: {}", e.getMessage());
        }
    }

    public void publishOrderShipped(Order order) {
        try {
            String orderJson = objectMapper.writeValueAsString(order);
            kafkaTemplate.send("order-shipped-events", order.getUserEmail(), orderJson);
            log.info("Order shipped event published for order: {}", order.getId());
        } catch (Exception e) {
            log.error("Error publishing order shipped event: {}", e.getMessage());
        }
    }
}
