# Microservices Architecture Guide

## Overview

This is a distributed microservices architecture for a stationery e-commerce platform. The system uses an API Gateway for routing and authentication, with four independent microservices managing different domains. Inter-service communication happens through both REST calls and event-driven patterns using Apache Kafka.

### Services Summary
| Service | Port | Responsibility |
|---------|------|-----------------|
| **API Gateway** | 8080 | Request routing, JWT validation, correlation tracking |
| **Auth Service** | 8081 | User registration, login, JWT token generation |
| **Product Service** | 8083 | Product catalog management |
| **Cart Service** | 8084 | Shopping cart operations |
| **Order Service** | 8082 | Order processing and payment integration (Stripe) |

---

## Authentication & Authorization Architecture

### JWT Token Flow

```
1. User Registration/Login
   ↓
   Auth Service generates JWT token
   JWT contains: email (subject), role claim
   ↓
   Client stores JWT locally
   
2. Each Request to Private Endpoint
   ↓
   Client sends: Authorization: Bearer <JWT>
   ↓
   API Gateway intercepts request
   ↓
   Gateway validates JWT via Auth Service
   ↓
   If valid: Gateway forwards authenticated headers to microservice
   If invalid: Gateway returns 401 Unauthorized
   
3. Other Services Process Request
   ↓
   Services receive pre-validated headers from Gateway
   ↓
   Extract user info from headers (no additional validation needed)
   ↓
   Services trust Gateway as the authentication authority
```

### Headers Forwarded by API Gateway

After validating JWT, the API Gateway forwards the following headers to backend services:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-User-Email` | user@example.com | User identifier |
| `X-User-Role` | ROLE_USER or ROLE_ADMIN | Authorization role |
| `X-Auth-Validated` | true | Indicates request is authenticated |
| `X-Correlation-Id` | UUID | Distributed trace tracking |

### JWT Token Structure

```json
Header {
  "alg": "HS256",
  "typ": "JWT"
}

Payload {
  "sub": "user@example.com",
  "role": "ROLE_USER",
  "iat": 1234567890,
  "exp": 1234607890
}
```

---

## API Gateway Implementation

### File: `api-gateway/src/main/java/com/stationery/api_gateway/filter/GatewayAuthFilter.java`

**Responsibilities:**
- Intercept all requests
- Identify public vs. private endpoints
- Validate JWT tokens via Auth Service
- Inject correlation ID (if missing)
- Forward validated user information as headers
- Remove sensitive Authorization header from upstream requests

**Key Features:**

1. **Correlation ID Management**
   ```java
   // If client provides X-Correlation-Id, reuse it
   // Otherwise, generate new UUID for distributed tracing
   private String resolveCorrelationId(ServerHttpRequest request)
   ```

2. **Public Endpoints** (bypass JWT validation)
   - `/auth/**` - All auth endpoints
   - `/product/` (GET only) - Public product listing
   - `/swagger-ui/**`, `/v3/api-docs/**` - Documentation
   - `/order/api/orders/payment/confirm` - Stripe webhook

3. **Token Validation**
   ```java
   // Calls Auth Service internal endpoint
   POST /api/auth/validate-token
   Header: Authorization: Bearer <JWT>
   Response: { valid: boolean, userEmail: string, role: string }
   ```

4. **Request Mutation**
   ```java
   // Remove Authorization, add service headers
   headers.remove(HttpHeaders.AUTHORIZATION);
   headers.set("X-Correlation-Id", correlationId);
   headers.set("X-User-Email", userEmail);
   headers.set("X-User-Role", role);
   headers.set("X-Auth-Validated", "true");
   ```

---

## Auth Service Implementation

### File: `auth-service/src/main/java/com/stationery/auth_service/service/JwtService.java`

**JWT Configuration:**
- Algorithm: HS256 (HMAC SHA-256)
- Secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970 (Base64 encoded)
- Expiration: 10 hours
- Claims: email (subject), role

**Public Endpoints:**
```
POST /register          - Create new user
POST /login             - Authenticate and get JWT
```

**Internal Endpoints:**
```
POST /api/auth/validate-token  - Validate JWT (called by API Gateway)
```

**Protected Endpoints:**
```
GET  /me               - Get current user email
GET  /profile          - Get full user profile
GET  /api/admin/users  - List all users (ROLE_ADMIN only)
```

### Token Generation Example
```java
// Login request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_USER"
}
```

---

## Microservice Trust Model

All other microservices (Product, Cart, Order) implement the same trust model:

### File: `*-service/src/main/java/com/stationery/.../filter/JwtAuthFilter.java`

**How it works:**
1. Check if `X-Auth-Validated: true` header is present
2. If present, extract `X-User-Email` and `X-User-Role` headers
3. Create Spring Security `Authentication` object with user info
4. Set authentication in `SecurityContextHolder`
5. Trust that API Gateway has already validated the user

**Important:** Services do NOT validate JWT themselves. They completely trust the API Gateway.

**Code Example:**
```java
@Override
protected void doFilterInternal(HttpServletRequest request, ...) {
    if ("true".equalsIgnoreCase(request.getHeader("X-Auth-Validated"))) {
        String email = request.getHeader("X-User-Email");
        String role = request.getHeader("X-User-Role");
        
        // Create authentication based on forwarded headers
        Authentication auth = new UsernamePasswordAuthenticationToken(
            email, null, 
            Collections.singletonList(new SimpleGrantedAuthority(role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    filterChain.doFilter(request, response);
}
```

---

## Inter-Service Communication

### REST Communication (Synchronous)

Services call each other directly via REST:

**Product Service Client** (in Cart Service):
```java
@FeignClient(name = "productService", url = "${product-service.url}")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductClientResponse getProduct(@PathVariable Long id);
}
```

**Cart Client** (in Order Service):
```java
RestTemplate restTemplate = new RestTemplate();
String cartApiUrl = "http://cart-service:8084/api/carts/checkout/" + email;
CartResponse cart = restTemplate.getForObject(cartApiUrl, CartResponse.class);
```

### Kafka Event Communication (Asynchronous)

Events are published when business processes complete. This allows services to react without tight coupling.

**Event Flow:**

```
Order Service publishes event
         ↓
    Topic: order-paid-events
         ↓
Product Service & Cart Service subscribe
         ↓
Each service updates its data independently
```

**Topics:**
| Topic | Producer | Consumers | Purpose |
|-------|----------|-----------|---------|
| `user-events` | Auth Service | - | User registration events |
| `order-created-events` | Order Service | - | Order creation tracking |
| `order-paid-events` | Order Service | Product, Cart | Update inventory & clear cart |
| `order-shipped-events` | Order Service | - | Shipping notifications |

**Kafka Configuration:**
```properties
spring.kafka.bootstrap-servers=kafka:29092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.consumer.group-id=<service>-group
spring.kafka.consumer.auto-offset-reset=earliest
```

**Publishing Events** (Order Service):
```java
@Service
public class OrderEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    
    public void publishOrderPaid(Order order) {
        String orderJson = objectMapper.writeValueAsString(order);
        kafkaTemplate.send("order-paid-events", order.getUserEmail(), orderJson);
    }
}
```

**Consuming Events** (Product & Cart Services):
```java
@Service
public class OrderEventsListener {
    
    @KafkaListener(topics = "order-paid-events", groupId = "product-group")
    public void handleOrderPaid(String message) {
        JsonNode order = mapper.readTree(message);
        // Update product inventory/clear cart
    }
}
```

---

## Correlation ID for Distributed Tracing

The `X-Correlation-Id` header enables tracing requests across all microservices in a single transaction.

### Usage in Logging

Add correlation ID to MDC (Mapped Diagnostic Context) for automatic inclusion in logs:

```java
@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        String correlationId = request.getHeader("X-Correlation-Id");
        MDC.put("correlationId", correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove("correlationId");
        }
    }
}
```

### Logback Configuration

```xml
<appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
        <pattern>%d{ISO8601} [%X{correlationId}] %logger{36} - %msg%n</pattern>
    </encoder>
</appender>
```

### Example Log Output
```
2026-05-01 14:30:45.123 [a1b2c3d4-e5f6-7890-abcd-ef1234567890] com.stationery.order_service.OrderController - Creating order for user@example.com
2026-05-01 14:30:45.456 [a1b2c3d4-e5f6-7890-abcd-ef1234567890] com.stationery.order_service.OrderService - Validating cart
2026-05-01 14:30:45.789 [a1b2c3d4-e5f6-7890-abcd-ef1234567890] com.stationery.cart_service.CartService - Cart retrieved for user@example.com
```

---

## Security Considerations

### 1. JWT Secret Management
- **Current Implementation:** Static secret in JwtService
- **Production Recommendation:** Use environment variable or secure vault (Vault, AWS Secrets Manager)
- **Implementation:**
  ```java
  @Value("${jwt.secret:default-secret}")
  private String SECRET;
  ```

### 2. Token Expiration
- Current: 10 hours
- Recommendation: Shorter expiration (15-30 minutes) with refresh token mechanism

### 3. Authorization Rules

**API Gateway - Public Routes:**
- All `/auth/**` endpoints
- Product GET requests (read-only)
- Swagger documentation
- Stripe webhook callback

**API Gateway - Protected Routes:**
- All POST/PUT/DELETE on products (admin only)
- All cart operations
- All order operations
- User profile endpoints

### 4. Service-to-Service Security
- Currently: Services validate via headers only
- Consider: mTLS, service mesh, or shared API keys for service-to-service calls

---

## Database & Persistence

### Databases
- **Type:** PostgreSQL (Neon cloud)
- **Connection Pooling:** HikariCP
- **ORM:** Spring Data JPA with Hibernate

**Services & Schemas:**
| Service | Database | Tables |
|---------|----------|--------|
| Auth Service | `neondb` | users, roles |
| Product Service | `neondb` | products |
| Cart Service | `neondb` | carts, cart_items, coupons |
| Order Service | `neondb` | orders, order_items, payments |

**Hibernate Settings:**
```properties
spring.jpa.hibernate.ddl-auto=update  # Auto schema updates
spring.jpa.show-sql=true               # Log SQL queries
spring.jpa.properties.hibernate.format_sql=true
```

---

## Deployment Architecture

### Docker Composition

Services are containerized and orchestrated via Docker Compose (see `docker-compose.yml`):

```yaml
services:
  api-gateway:
    build: ./api-gateway
    ports:
      - "8080:8080"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:8081
      - ORDER_SERVICE_URL=http://order-service:8082
      - PRODUCT_SERVICE_URL=http://product-service:8083
      - CART_SERVICE_URL=http://cart-service:8084
    depends_on:
      - auth-service
      - product-service
      - cart-service
      - order-service
      - kafka
      - postgres
```

### Environment Variables Required

```bash
# Auth Service
AUTH_SERVICE_URL=http://auth-service:8081

# Order Service  
ORDER_SERVICE_URL=http://order-service:8082
PRODUCT_SERVICE_URL=http://product-service:8083
CART_SERVICE_URL=http://cart-service:8084
STRIPE_SECRET_KEY=sk_test_...

# Kafka
SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:29092

# Database (if not using Neon cloud)
DB_URL=jdbc:postgresql://postgres:5432/stationery
DB_USER=postgres
DB_PASSWORD=postgres
```

---

## Request Flow Example

### Example: User Places an Order

```
1. CLIENT
   POST /order/api/orders/checkout
   Header: Authorization: Bearer eyJhbGciOiJIUzI1NiI...
   Body: { items: [...] }

2. API GATEWAY (GatewayAuthFilter)
   ✓ Extract JWT from Authorization header
   ✓ Call Auth Service to validate
   ✓ Generate X-Correlation-Id: 12345-abcde-67890
   ✓ Forward to Order Service with:
     - X-User-Email: user@example.com
     - X-User-Role: ROLE_USER
     - X-Auth-Validated: true
     - X-Correlation-Id: 12345-abcde-67890

3. ORDER SERVICE (JwtAuthFilter)
   ✓ Check X-Auth-Validated: true
   ✓ Create Security Context with user@example.com
   ✓ OrderController.checkout() executes

4. ORDER SERVICE (OrderService)
   → Call Cart Service (REST) to get cart items
   → Validate inventory via Product Service (REST)
   → Create order in database
   → Call Stripe API for payment
   → Publish "order-paid-events" to Kafka

5. KAFKA CONSUMERS
   Product Service listening on "order-paid-events"
   → Reduce inventory for ordered items
   
   Cart Service listening on "order-paid-events"
   → Clear user's cart

6. CLIENT
   Receive: { orderId: 123, status: PAID }
```

---

## Build and Run

### Prerequisites
- Java 17+
- Maven 3.6+
- Docker & Docker Compose
- PostgreSQL (or use Neon)
- Kafka

### Build All Services
```bash
cd api-gateway && mvn clean package -DskipTests
cd ../auth-service && mvn clean package -DskipTests
cd ../product-service && mvn clean package -DskipTests
cd ../cart-service && mvn clean package -DskipTests
cd ../order-service && mvn clean package -DskipTests
```

### Run with Docker Compose
```bash
docker-compose up --build
```

### Access Services
- API Gateway & Swagger UI: http://localhost:8080/swagger-ui.html
- Auth Service: http://localhost:8081
- Product Service: http://localhost:8083
- Cart Service: http://localhost:8084
- Order Service: http://localhost:8082

---

## Testing the Architecture

### 1. Register & Login
```bash
# Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123", "name": "Test User"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123"}'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_USER"
}
```

### 2. Access Protected Endpoint with Token
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -H "Authorization: Bearer $TOKEN" \
     -H "X-Correlation-Id: debug-123" \
     http://localhost:8080/cart/api/carts
```

### 3. Observe Correlation ID in Logs
All services should log with the correlation ID for tracing.

---

## Troubleshooting

### 1. "Token validation failed"
- Verify JWT secret matches between Auth Service and Gateway
- Check token expiration (10 hours from generation)
- Ensure Authorization header format: `Bearer <token>`

### 2. "Missing or invalid Authentication"
- Verify API Gateway is running and connected to Auth Service
- Check network connectivity: `curl http://auth-service:8081/status`
- Verify token hasn't expired

### 3. Kafka Connection Errors
- Verify Kafka is running: `docker ps | grep kafka`
- Check bootstrap servers configuration
- Review Kafka logs: `docker logs <container>`

### 4. 401 Unauthorized on Protected Endpoints
- Verify X-Auth-Validated header is set (means gateway validated successfully)
- Check if endpoint is in public routes list
- Verify user role matches endpoint requirements

---

## Future Enhancements

1. **API Rate Limiting** - Implement rate limiting in API Gateway
2. **Refresh Tokens** - Add refresh token mechanism for better security
3. **Service Mesh** - Use Istio/Linkerd for advanced networking
4. **Circuit Breaker** - Already implemented with Resilience4j, enhance metrics
5. **Distributed Tracing** - Add Jaeger/Zipkin integration
6. **API Versioning** - Implement API versioning strategy
7. **GraphQL** - Consider GraphQL for complex queries
8. **Caching** - Add Redis caching layer for performance
