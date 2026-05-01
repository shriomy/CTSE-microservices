# Quick Reference Guide

## System Overview

**Architecture:** Distributed microservices with API Gateway, 4 microservices, PostgreSQL, and Kafka

**Services:**
- **API Gateway** (8080) - Handles authentication & routing
- **Auth Service** (8081) - JWT generation & validation
- **Order Service** (8082) - Payment processing
- **Product Service** (8083) - Inventory management
- **Cart Service** (8084) - Shopping cart

---

## Build Status

```
✅ api-gateway          - Java 17
✅ auth-service        - Java 17
✅ product-service     - Java 17
✅ cart-service        - Java 17
✅ order-service       - Java 17
```

All services compile and package successfully.

---

## Authentication Flow (One Diagram)

```
User Login
    ↓
JWT Generated (email + role)
    ↓
API Gateway validates JWT
    ↓
Forwards headers:
  - X-User-Email
  - X-User-Role
  - X-Auth-Validated: true
  - X-Correlation-Id: UUID
    ↓
Microservice trusts headers
    ↓
Request executed with auth context
```

---

## Key Configuration

### Kafka (All Services)
```properties
spring.kafka.bootstrap-servers=kafka:29092
spring.kafka.consumer.group-id=<service>-group
```

### JWT (Auth Service)
```
Algorithm: HS256
Secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
Expiration: 10 hours
Claims: email (sub), role
```

### Database (All Services)
```
Type: PostgreSQL (Neon)
ORM: Spring Data JPA + Hibernate
DDL: auto-update
```

---

## Important Files

| File | Purpose |
|------|---------|
| `api-gateway/src/main/java/.../filter/GatewayAuthFilter.java` | JWT validation & header injection |
| `auth-service/src/main/java/.../service/JwtService.java` | JWT generation & validation |
| `auth-service/src/main/java/.../controller/AuthController.java` | Register, login, validate endpoints |
| `*/src/main/java/.../filter/JwtAuthFilter.java` | Trust forwarded headers from gateway |
| `order-service/src/main/java/.../kafka/OrderEventProducer.java` | Publish order events |
| `*/src/main/java/.../kafka/OrderEventsListener.java` | Listen to order events |

---

## Kafka Topics

| Topic | Producer | Consumers |
|-------|----------|-----------|
| `order-created-events` | Order Service | - |
| `order-paid-events` | Order Service | Product, Cart |
| `order-shipped-events` | Order Service | - |
| `user-events` | Auth Service | - |

---

## Critical Headers

| Header | Set By | Read By | Value |
|--------|--------|---------|-------|
| `Authorization` | Client | API Gateway | `Bearer <JWT>` |
| `X-Correlation-Id` | API Gateway | All services | UUID |
| `X-User-Email` | API Gateway | Microservices | user@example.com |
| `X-User-Role` | API Gateway | Microservices | ROLE_USER\|ROLE_ADMIN |
| `X-Auth-Validated` | API Gateway | Microservices | true |

---

## Running Locally

```bash
# Build all
mvn clean package -DskipTests

# Or build individually
cd api-gateway && mvn clean package -DskipTests
cd ../auth-service && mvn clean package -DskipTests
# ... repeat for other services

# Run with Docker Compose
docker-compose up --build

# Access
API Gateway: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html
```

---

## Common Curl Commands

### Register
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123","name":"Test"}'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123"}'
```

### Access Protected Endpoint
```bash
TOKEN="eyJhbGciOiJIUzI1NiI..."
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/cart/api/carts
```

---

## Problem Solving

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails with "release version" error | Java version mismatch | Use Java 17: `java -version` |
| 401 Unauthorized | Gateway not validating | Check Auth Service is running: `curl http://localhost:8081/status` |
| Kafka connection refused | Kafka not running | Check Docker: `docker ps \| grep kafka` |
| Correlation ID missing in logs | Not implemented | Services already forward it; add to logback pattern |
| Cart not clearing after order | Kafka not working | Verify `order-paid-events` topic consumers |

---

## Security Notes

🔒 **Current Implementation:**
- JWT validation at API Gateway
- Services trust gateway headers
- HS256 encryption with shared secret
- 10-hour token expiration

⚠️ **For Production, Add:**
- JWT secret in environment variable
- Token refresh mechanism
- Rate limiting
- mTLS for service-to-service
- HTTPS everywhere
- Comprehensive audit logging

---

## Documentation Files

1. **ARCHITECTURE_GUIDE.md** - Complete architecture documentation
2. **IMPLEMENTATION_CHANGES.md** - Changes made and verification steps
3. **QUICK_START.md** (if exists) - Quick start instructions
4. **docker-compose.yml** - Complete setup for all services

---

## Team Contacts

For issues related to:
- **API Gateway & Routing:** Check `GatewayAuthFilter.java`
- **JWT & Authentication:** Check `JwtService.java` and `AuthController.java`
- **Service Trust:** Check `JwtAuthFilter.java` in each service
- **Kafka Events:** Check `OrderEventProducer.java` and `OrderEventsListener.java`
- **Database:** Check respective `application.properties` files

---

## Success Criteria ✅

- [x] All services build without errors
- [x] API Gateway validates JWT and forwards headers
- [x] Microservices trust API Gateway
- [x] Correlation ID is generated and forwarded
- [x] Kafka is configured in all services
- [x] Event listeners are properly subscribed
- [x] Database connections are configured
- [x] Authentication flow is documented

**Status: READY FOR DEPLOYMENT** 🚀
