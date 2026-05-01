# Swagger UI - API Documentation Setup Guide

## Overview
Swagger UI is now integrated into all microservices for easy API endpoint visualization and testing. Each service has interactive API documentation with the ability to test endpoints directly from the browser.

## 🚀 Quick Access

After starting each service, access Swagger UI at:

### Product Service (Port 8083)
- **Swagger UI**: http://localhost:8083/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8083/v3/api-docs

### Auth Service (Port 8081)
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8081/v3/api-docs

### Order Service (Port 8082)
- **Swagger UI**: http://localhost:8082/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8082/v3/api-docs

### Via API Gateway (Port 8080)
- **Product**: http://localhost:8080/product/swagger-ui.html
- **Auth**: http://localhost:8080/auth/swagger-ui.html
- **Order**: http://localhost:8080/order/swagger-ui.html

---

## 📝 Building & Running

### Build All Services with Swagger
```bash
# Build Product Service
cd product-service
mvnw.cmd clean package

# Build Auth Service
cd ../auth-service
mvnw.cmd clean package

# Build Order Service
cd ../order-service
mvnw.cmd clean package
```

### Run Services Individually
```bash
# Terminal 1: Auth Service
cd auth-service
java -jar target/auth-service-0.0.1-SNAPSHOT.jar

# Terminal 2: Product Service
cd product-service
java -jar target/product-service-0.0.1-SNAPSHOT.jar

# Terminal 3: Order Service
cd order-service
java -jar target/order-service-0.0.1-SNAPSHOT.jar

# Terminal 4: API Gateway (optional)
cd api-gateway
java -jar target/api-gateway-0.0.1-SNAPSHOT.jar
```

### Run with Docker Compose
```bash
# From project root
docker-compose up -d

# Access Swagger UI
# - http://localhost:8081/swagger-ui.html (Auth)
# - http://localhost:8083/swagger-ui.html (Product)
# - http://localhost:8082/swagger-ui.html (Order)
```

---

## 🌐 What's Available in Swagger UI

### Product Service - Main Features

#### Public Endpoints (No Auth)
```
GET /api/products              │ List all products
GET /api/products/{id}         │ Get product by ID
GET /api/products/available    │ Get available products
GET /api/products/search/{name}│ Search by name
```

#### Admin Endpoints (JWT Required + ROLE_ADMIN)
```
POST   /api/products           │ Create product
PUT    /api/products/{id}      │ Update product
DELETE /api/products/{id}      │ Delete product
```

---

### Auth Service - Main Features

#### Public Endpoints
```
POST /api/auth/register  │ Register new user
POST /api/auth/login     │ Login and get JWT
```

#### Protected Endpoints
```
GET /api/auth/me         │ Get current user info
GET /api/admin/users     │ List all users (admin only)
```

---

### Order Service - Main Features

(View in Swagger UI at http://localhost:8082/swagger-ui.html)

---

## 🧪 Testing with Swagger UI

### Step 1: Get Authorization Token
1. Open http://localhost:8081/swagger-ui.html (Auth Service)
2. Find the "POST /api/auth/login" endpoint
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   ```
5. Click "Execute"
6. Copy the jwt `token` from the response

### Step 2: Use Token in Product Service
1. Open http://localhost:8083/swagger-ui.html (Product Service)
2. Click the lock icon (🔒) in top right or find "Authorize" button
3. Paste token with format: `Bearer YOUR_TOKEN`
4. Click the green padlock to authorize
5. Now test admin endpoints:
   - POST /api/products (create)
   - PUT /api/products/{id} (update)
   - DELETE /api/products/{id} (delete)

### Step 3: Test Public Endpoints
1. Any GET endpoint works without authentication
2. Try "GET /api/products" to list all products
3. Try "GET /api/products/available" to filter available items

---

## 📋 Swagger UI Features

### Request/Response Examples
- **Schema**: Shows data structure
- **Example**: Displays sample JSON
- **Description**: Explains each field

### Try It Out Feature
- Execute requests directly from browser
- View raw requests and responses
- Test error scenarios

### Authentication
- Supports Bearer token authentication
- Lock icon indicates endpoints needing auth
- Set global authorization for all requests

---

## 🔍 Common Swagger UI Buttons

| Button | Purpose |
|--------|---------|
| **Try it out** | Switch to request editing mode |
| **Execute** | Send request to API |
| **Cancel** | Exit editing mode |
| **Authorize** | Set authentication token |
| **Clear** | Clear filled data |
| **Expand** | Show full endpoint details |

---

## 📐 OpenAPI/Swagger Configuration

Each service includes customized OpenAPI configuration:

```properties
# Swagger UI Paths
springdoc.api-docs.path=/v3/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.enabled=true

# UI Features
springdoc.swagger-ui.operations-sorter=method      │ Sort by HTTP method
springdoc.swagger-ui.tags-sorter=alpha             │ Sort tags alphabetically
springdoc.swagger-ui.display-request-duration=true │ Show request duration
```

---

## 📚 API Documentation You Can View

### Product Service Endpoints
- **Title**: Product Service API
- **Version**: 1.0.0
- **Description**: Stationery Store - Product Management Microservice
- **Contact**: support@stationery.com

View at: http://localhost:8083/swagger-ui.html

**Endpoints shown include:**
- ✅ Request/response schemas
- ✅ Parameter descriptions
- ✅ Required vs optional fields
- ✅ Example request/response JSON
- ✅ Possible HTTP status codes

### Auth Service Endpoints
- **Title**: Auth Service API
- **Version**: 1.0.0
- **Description**: Stationery Store - Authentication & Authorization Microservice
- **Contact**: support@stationery.com

View at: http://localhost:8081/swagger-ui.html

### Order Service Endpoints
- **Title**: Order Service API
- **Version**: 1.0.0
- **Description**: Stationery Store - Order Management Microservice
- **Contact**: support@stationery.com

View at: http://localhost:8082/swagger-ui.html

---

## ✅ Verification Checklist

### After Building

```bash
# ✅ Check Product Service
curl http://localhost:8083/v3/api-docs
# Should return JSON with API documentation

# ✅ Check Auth Service
curl http://localhost:8081/v3/api-docs
# Should return JSON with API documentation

# ✅ Check Order Service
curl http://localhost:8082/v3/api-docs
# Should return JSON with API documentation
```

### In Browser
```
✅ http://localhost:8083/swagger-ui.html - Product Swagger (works)
✅ http://localhost:8081/swagger-ui.html - Auth Swagger (works)
✅ http://localhost:8082/swagger-ui.html - Order Swagger (works)
```

---

## 🚨 Troubleshooting

### Issue: Swagger UI Shows Empty
**Solution**: 
- Ensure service is fully started (wait 5-10 seconds)
- Check server port is correct
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito window

### Issue: "HTTP ERROR 404"
**Solution**:
- Verify service is running on correct port
- Check URL path is exactly `/swagger-ui.html`
- Ensure application.properties has correct settings

### Issue: Can't Authenticate
**Solution**:
- Get fresh JWT from Auth Service login endpoint
- Use format: `Bearer <token>` (with space)
- Copy entire token including all dots
- Tokens expire after 10 hours

### Issue: Endpoints Not Showing
**Solution**:
- Rebuild service: `mvnw clean package`
- Ensure OpenApiConfig.java is in correct package
- Check pom.xml has springdoc-openapi-starter-webmvc-ui dependency
- Restart service

---

## 🎯 Testing Workflow

### 1. Start All Services
```bash
docker-compose up -d
# or start individually with java -jar
```

### 2. Open Swagger UI
- Product: http://localhost:8083/swagger-ui.html
- Auth: http://localhost:8081/swagger-ui.html

### 3. Get JWT Token
1. Go to Auth Swagger
2. Execute "POST /api/auth/login"
3. Copy response token

### 4. Authorize in Product Service
1. Go to Product Swagger
2. Click "Authorize" button
3. Paste token
4. Click lock to confirm

### 5. Test Endpoints
- GET endpoints: Click "Try it out" > "Execute"
- POST/PUT/DELETE: Need proper authorization

### 6. View Responses
- **Success**: Response shows 200/201/204 status
- **Error**: Shows error details and status code
- **Duration**: Shows how long request took

---

## 📖 Additional Resources

### For Each Service
- OpenAPI JSON spec: `/v3/api-docs`
- Swagger UI: `/swagger-ui.html`
- Health check: `/actuator/health` (if available)

### Docker Container Access
```bash
# View logs while testing
docker logs -f product-service
docker logs -f auth-service
docker logs -f order-service

# Access inside container
docker exec -it product-service bash
```

---

## 🎓 Example: Complete Testing Flow

### Flow Diagram
```
1. Open Auth Swagger
   ↓
2. Login to get JWT token
   ↓
3. Copy JWT token
   ↓
4. Open Product Swagger
   ↓
5. Click Authorize button
   ↓
6. Paste JWT with "Bearer " prefix
   ↓
7. Click POST /api/products
   ↓
8. Fill in product details
   ↓
9. Click "Try it out"
   ↓
10. Click "Execute"
   ↓
11. View response (201 Created)
   ↓
12. Go to GET /api/products
   ↓
13. Click "Execute"
   ↓
14. View created product in list
```

---

## ✨ Success Indicators

✅ Swagger UI loads without errors
✅ Service name shows in page title
✅ All endpoints are listed
✅ Red lock icon shows protected endpoints
✅ Can execute requests successfully
✅ Responses show proper status codes
✅ "Try it out" feature works
✅ Authorize button functions correctly

---

## 🚀 You're All Set!

All microservices now have Swagger UI enabled for easy API documentation and testing!

**Quick Links:**
- 🔵 Product: http://localhost:8083/swagger-ui.html
- 🟡 Auth: http://localhost:8081/swagger-ui.html
- 🟢 Order: http://localhost:8082/swagger-ui.html

**Next Steps:**
1. Start services: `docker-compose up -d`
2. Open Swagger in browser
3. Test endpoints interactively
4. Use for API development documentation

Happy testing! 🎉
