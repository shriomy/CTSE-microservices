package com.stationery.api_gateway.filter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class GatewayAuthFilter implements GlobalFilter, Ordered {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    private static final String USER_EMAIL_HEADER = "X-User-Email";
    private static final String USER_ROLE_HEADER = "X-User-Role";
    private static final String USER_ROLES_HEADER = "X-User-Roles";
    private static final String AUTH_VALIDATED_HEADER = "X-Auth-Validated";

    private final WebClient.Builder webClientBuilder;

    @Value("${AUTH_SERVICE_URL}")
    private String authServiceUrl;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        String correlationId = resolveCorrelationId(request);

        if (isPublicRequest(request)) {
            return chain.filter(withCorrelationId(exchange, correlationId));
        }

        String authorizationHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return unauthorized(exchange, correlationId, "Missing or invalid Authorization header");
        }

        return validateToken(authorizationHeader)
                .flatMap(validation -> {
                    if (!validation.valid()) {
                        return unauthorized(exchange, correlationId, "Token validation failed");
                    }

                    ServerHttpRequest mutatedRequest = request.mutate()
                            .headers(headers -> {
                                headers.remove(HttpHeaders.AUTHORIZATION);
                                headers.set(CORRELATION_ID_HEADER, correlationId);
                                headers.set(USER_EMAIL_HEADER, validation.userEmail());
                                headers.set(USER_ROLE_HEADER, validation.role());
                                headers.set(USER_ROLES_HEADER, validation.role());
                                headers.set(AUTH_VALIDATED_HEADER, "true");
                            })
                            .build();

                    return chain.filter(exchange.mutate().request(mutatedRequest).build());
                })
                .onErrorResume(error -> {
                    log.warn("Gateway auth failed for {}: {}", path, error.getMessage());
                    return unauthorized(exchange, correlationId, "Authentication service unavailable");
                });
    }

    private Mono<AuthValidationResponse> validateToken(String authorizationHeader) {
        return webClientBuilder
                .baseUrl(authServiceUrl)
                .build()
                .post()
                .uri("/api/auth/validate-token")
                .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(AuthValidationResponse.class);
    }

    private boolean isPublicRequest(ServerHttpRequest request) {
        String path = request.getPath().value();
        HttpMethod method = request.getMethod();

        if (method == HttpMethod.OPTIONS) {
            return true;
        }

        if (path.startsWith("/auth/")) {
            return true;
        }

        if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.startsWith("/webjars/")) {
            return true;
        }

        if (request.getMethod() == HttpMethod.GET && path.startsWith("/product/")) {
            return true;
        }

        return path.equals("/order/api/orders/payment/confirm");
    }

    private ServerWebExchange withCorrelationId(ServerWebExchange exchange, String correlationId) {
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .headers(headers -> headers.set(CORRELATION_ID_HEADER, correlationId))
                .build();
        return exchange.mutate().request(mutatedRequest).build();
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String correlationId, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        exchange.getResponse().getHeaders().set(CORRELATION_ID_HEADER, correlationId);
        byte[] body = ("{\"valid\":false,\"message\":\"" + message + "\"}").getBytes();
        return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }

    private String resolveCorrelationId(ServerHttpRequest request) {
        String existingCorrelationId = request.getHeaders().getFirst(CORRELATION_ID_HEADER);
        return existingCorrelationId != null && !existingCorrelationId.isBlank()
                ? existingCorrelationId
                : UUID.randomUUID().toString();
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AuthValidationResponse(boolean valid, String userEmail, String role, String message) {
    }
}
