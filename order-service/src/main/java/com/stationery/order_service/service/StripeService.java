package com.stationery.order_service.service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.stationery.order_service.dto.CheckoutSessionResponse;
import com.stationery.order_service.entity.Order;
import com.stationery.order_service.dto.OrderItemRequest;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public CheckoutSessionResponse createCheckoutSession(Order order) {
        try {
            Stripe.apiKey = stripeApiKey;

            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();
            
            // Add each order item to Stripe session
            for (var item : order.getItems()) {
                lineItems.add(
                    SessionCreateParams.LineItem.builder()
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount((long) (item.getProductPrice() * 100)) // Convert to cents
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.getProductName())
                                                            .setDescription("Product ID: " + item.getProductId())
                                                            .addImage(item.getProductImageUrl())
                                                            .build()
                                            )
                                            .build()
                            )
                            .setQuantity((long) item.getQuantity())
                            .build()
                );
            }

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/payment-success?orderId=" + order.getId() + "&sessionId={CHECKOUT_SESSION_ID}")
                    .setCancelUrl(frontendUrl + "/payment-cancelled?orderId=" + order.getId())
                    .addAllLineItem(lineItems)
                    .setCustomerEmail(order.getUserEmail())
                    .putMetadata("orderId", order.getId().toString())
                    .putMetadata("userEmail", order.getUserEmail())
                    .build();

            Session session = Session.create(params);

            return CheckoutSessionResponse.builder()
                    .orderId(order.getId())
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .build();

        } catch (Exception e) {
            log.error("Error creating Stripe checkout session: ", e);
            throw new RuntimeException("Failed to create checkout session: " + e.getMessage());
        }
    }

    public String getSessionStatus(String sessionId) {
        try {
            Stripe.apiKey = stripeApiKey;
            Session session = Session.retrieve(sessionId);
            return session.getPaymentStatus();
        } catch (Exception e) {
            log.error("Error retrieving Stripe session: ", e);
            throw new RuntimeException("Failed to retrieve session status: " + e.getMessage());
        }
    }
}
