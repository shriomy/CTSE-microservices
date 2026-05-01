# Quick Start Guide - Product Service

## Overview
The Product Service is a microservice for managing stationery store products with admin authorization, JWT authentication, and full CRUD operations.

## Quick Setup (5 minutes)

### 1. Prerequisites
- Java 17+ installed
- Maven installed (or use embedded mvnw)
- Docker Desktop (for Docker deployment)

### 2. Build the Project

**On Windows:**
```bash
cd product-service
mvnw.cmd clean package
```

**On Linux/Mac:**
```bash
cd product-service
./mvnw clean package
```

### 3. Configure Database

Edit `src/main/resources/application.properties`:

```properties
# Update with your Neon PostgreSQL credentials
spring.datasource.url=jdbc:postgresql://neondb_owner:npg_rlfTgxVIa4j6@ep-floral-moon-a8tr26xb-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_rlfTgxVIa4j6
```

### 4. Run Locally

**Option A: Using Maven**
```bash
mvn spring-boot:run
# Service starts on http://localhost:8083
```

**Option B: Using Java JAR**
```bash
java -jar target/product-service-0.0.1-SNAPSHOT.jar
# Service starts on http://localhost:8083
```

### 5. Run with Docker

**Build Docker Image:**
```bash
docker build -t product-service:latest .
```

**Run with docker-compose:**
```bash
docker-compose up -d product-service
# Or run the entire stack
docker-compose up -d
```

## Testing the API

### Get Authentication Token

First, get a JWT token from the Auth Service:

```bash
# Login as Admin
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Response includes JWT token:
# {"token":"eyJhbGc...", "role":"ROLE_ADMIN"}
```

### Test Endpoints

**1. View Products (Public - No Auth Required)**
```bash
curl http://localhost:8083/api/products
```

**2. Create Product (Admin Only)**
```bash
curl -X POST http://localhost:8083/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ballpoint Pen",
    "description": "Blue ballpoint pen",
    "price": 29.99,
    "imageUrl": "https://example.com/pen.jpg",
    "availability": true
  }'
```

**3. Update Product (Admin Only)**
```bash
curl -X PUT http://localhost:8083/api/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 39.99}'
```

**4. Delete Product (Admin Only)**
```bash
curl -X DELETE http://localhost:8083/api/products/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Using Postman

1. Import `POSTMAN_COLLECTION.json` into Postman
2. In Postman, set the variable `admin_token` with your JWT token
3. Run the requests from the imported collection

## API Endpoints Summary

### Public (No Auth)
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/available` - Get available products
- `GET /api/products/search/{name}` - Search by name

### Admin Only
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

## Verification Checklist

✅ Service Running
```bash
curl http://localhost:8083/api/products
# Should return [] or list of products
```

✅ Database Connected
- Check logs for any connection errors
- Verify credentials in application.properties

✅ Authentication Working
- Get JWT token from Auth Service
- Use token in Authorization header

✅ Admin Authorization
- Try creating product with user token (should fail with 403)
- Try creating product with admin token (should succeed with 201)

## Troubleshooting

### Service Won't Start
```bash
# Check Java version (need 17+)
java -version

# Check port 8083 is available
netstat -ano | findstr :8083  # Windows
lsof -i :8083                  # Linux/Mac
```

### Database Connection Error
```bash
# Verify credentials in application.properties
# Test connection manually:
psql 'postgresql://neondb_owner:npg_rlfTgxVIa4j6@ep-floral-moon-a8tr26xb-pooler.eastus2.azure.neon.tech/neondb'
```

### JWT Authentication Fails
- Ensure you copied the token correctly from Auth Service response
- Check token is not expired (valid for 10 hours)
- Use format: `Authorization: Bearer <token>`

### 403 Forbidden on Admin Endpoints
- Verify user has ROLE_ADMIN role
- Check JWT token contains role claim
- Register user with role=ROLE_ADMIN in Auth Service

## Next Steps

1. **Database Population**: Add sample products using POST endpoint
2. **Integration**: Access through API Gateway at `http://localhost:8080/product/**`
3. **Frontend Integration**: Connect React frontend to product endpoints
4. **Production Deployment**: Deploy to cloud using Docker images

## Documentation

For detailed information, see:
- [README.md](./README.md) - Complete documentation
- [POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json) - API testing collection
- [test-api.sh](./test-api.sh) - Automated API testing script

## Key Features

✨ **JWT Authentication**: Secure endpoints with JWT tokens from Auth Service
🔐 **Admin Authorization**: Only admins can create/update/delete products
👥 **Public Viewing**: All users can view products
💾 **Persistent Storage**: PostgreSQL database
🐳 **Docker Ready**: Full Docker and docker-compose support
📚 **RESTful API**: Standard REST endpoints
🔄 **Full CRUD**: Create, Read, Update, Delete operations

## Architecture

```
Client Request
    ↓
API Gateway (port 8080)
    ↓
Product Service (port 8083)
    ↓
JWT Auth Filter
    ↓
Spring Security (Authorization)
    ↓
Business Logic (ProductService)
    ↓
Database Layer (ProductRepository)
    ↓
PostgreSQL Database
```

## Support

For issues:
1. Check service logs: `docker logs product-service`
2. Verify database connection
3. Test endpoints with provided curl commands
4. Review README.md for detailed documentation

Happy testing! 🚀
