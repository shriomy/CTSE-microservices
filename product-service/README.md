# Product Service

A comprehensive microservice for managing products in the stationery store application. This service provides full CRUD operations for products with role-based access control where only admins can create, update, and delete products, while all users can view products.

## Features

- ✅ **Product Management**: Create, Read, Update, Delete products
- ✅ **Admin Authorization**: Only admin users can manage (add/update/delete) products
- ✅ **Public Viewing**: All users can view available products
- ✅ **JWT Authentication**: Secure endpoints using JWT tokens from Auth Service
- ✅ **Product Attributes**: Name, Description, Price, Image URL, Availability Status
- ✅ **Database**: PostgreSQL with Hibernatesupport
- ✅ **Docker Support**: Full Docker containerization included

## Product Attributes

Each product contains:
- **ID**: Unique identifier
- **Name**: Product name (required)
- **Description**: Detailed product description (required)
- **Price**: Product price (required, must be > 0)
- **Image URL**: URL to product image (required)
- **Availability**: Boolean flag indicating if product is available (required)
- **Created At**: Timestamp of product creation
- **Updated At**: Timestamp of last update

## Technology Stack

- Spring Boot 4.0.3
- Spring Data JPA
- Spring Security with JWT
- PostgreSQL 15+
- Docker & Docker Compose

## Installation & Setup

### Prerequisites

- Java 17+
- Maven 3.9+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL Neon account (or local PostgreSQL instance)

### Build the Service

```bash
# Using Maven wrapper on Windows
mvnw.cmd clean install

# Using Maven wrapper on Linux/Mac
./mvnw clean install

# Using Maven directly
mvn clean install
```

### Configuration

Update `src/main/resources/application.properties` with your PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/your-db?sslmode=require&channel_binding=require
spring.datasource.username=your-username
spring.datasource.password=your-password
```

### Run Locally

```bash
# Using Maven
mvn spring-boot:run

# Using Java directly (after building)
java -jar target/product-service-0.0.1-SNAPSHOT.jar

# Service will be available at http://localhost:8083
```

## Docker Deployment

### Build Docker Image

```bash
docker build -t product-service:latest .
```

### Run with Docker Compose

The service is included in the main docker-compose.yml file:

```bash
docker-compose up -d product-service
```

Or build and run the entire stack:

```bash
docker-compose up -d
```

## API Endpoints

### Public Endpoints (No Admin Required)

#### Get All Products
```
GET /api/products
```
**Description**: Retrieve all products in the system
**Authentication**: Optional (any user can access)
**Response**: Array of ProductResponse objects

#### Get Product by ID
```
GET /api/products/{id}
```
**Description**: Retrieve a specific product by its ID
**Parameters**: 
- `id` (path): Product ID
**Response**: ProductResponse object

#### Get Available Products
```
GET /api/products/available
```
**Description**: Retrieve only available products
**Response**: Array of ProductResponse objects

#### Search Product by Name
```
GET /api/products/search/{name}
```
**Description**: Search for a product by name
**Parameters**:
- `name` (path): Product name
**Response**: ProductResponse object

### Admin-Only Endpoints (ROLE_ADMIN Required)

#### Create Product
```
POST /api/products
```
**Headers**: Authorization: Bearer {JWT_TOKEN}
**Description**: Create a new product (Admin only)
**Body**:
```json
{
  "name": "Notebook A4",
  "description": "Premium quality spiral notebook",
  "price": 299.99,
  "imageUrl": "https://example.com/notebook.jpg",
  "availability": true
}
```
**Response**: ProductResponse object with HTTP 201 Created

#### Update Product
```
PUT /api/products/{id}
```
**Headers**: Authorization: Bearer {JWT_TOKEN}
**Description**: Update an existing product (Admin only)
**Parameters**:
- `id` (path): Product ID
**Body**:
```json
{
  "name": "Premium Notebook A4",
  "price": 349.99,
  "availability": true
}
```
**Response**: Updated ProductResponse object

#### Delete Product
```
DELETE /api/products/{id}
```
**Headers**: Authorization: Bearer {JWT_TOKEN}
**Description**: Delete a product (Admin only)
**Parameters**:
- `id` (path): Product ID
**Response**: HTTP 204 No Content

### Alternative Admin Routes

Alternative routes are also provided with explicit `/admin/` prefix:

```
POST   /api/products/admin/create          # Create product
PUT    /api/products/admin/update/{id}     # Update product
DELETE /api/products/admin/delete/{id}     # Delete product
```

## Request/Response Examples

### Create Product Request
```bash
curl -X POST http://localhost:8083/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ballpoint Pen Blue",
    "description": "Smooth writing ballpoint pen",
    "price": 29.99,
    "imageUrl": "https://example.com/pen.jpg",
    "availability": true
  }'
```

### Create Product Response (201 Created)
```json
{
  "id": 1,
  "name": "Ballpoint Pen Blue",
  "description": "Smooth writing ballpoint pen",
  "price": 29.99,
  "imageUrl": "https://example.com/pen.jpg",
  "availability": true,
  "createdAt": 1711190400000,
  "updatedAt": 1711190400000
}
```

### Get All Products Response
```json
[
  {
    "id": 1,
    "name": "Ballpoint Pen Blue",
    "description": "Smooth writing ballpoint pen",
    "price": 29.99,
    "imageUrl": "https://example.com/pen.jpg",
    "availability": true,
    "createdAt": 1711190400000,
    "updatedAt": 1711190400000
  },
  {
    "id": 2,
    "name": "Notebook A4",
    "description": "Premium quality spiral notebook",
    "price": 299.99,
    "imageUrl": "https://example.com/notebook.jpg",
    "availability": true,
    "createdAt": 1711190500000,
    "updatedAt": 1711190500000
  }
]
```

## Authentication Flow

1. **Register/Login**: Use Auth Service to register or login
   ```bash
   # Login
   curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "password123"
     }'
   ```

2. **Get JWT Token**: Auth Service returns JWT token with role embedded
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "role": "ROLE_ADMIN"
   }
   ```

3. **Use Token in Product Service**: Include token in Authorization header
   ```bash
   Authorization: Bearer <JWT_TOKEN>
   ```

## Admin Authorization

Only users with `ROLE_ADMIN` role can:
- Create new products
- Update existing products
- Delete products

The role is validated from the JWT token's embedded role claim. The Product Service trusts the Auth Service's JWT token validation.

## Database Schema

### Products Table
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  availability BOOLEAN NOT NULL DEFAULT true,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);
```

## Error Handling

The service provides appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | OK - Request successful |
| 201 | Created - Product successfully created |
| 204 | No Content - Product successfully deleted |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid JWT token |
| 403 | Forbidden - User lacks admin role |
| 404 | Not Found - Product not found |
| 500 | Internal Server Error - Server error |

### Error Response Example
```json
{
  "timestamp": "2024-03-22T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Product not found with id: 999",
  "path": "/api/products/999"
}
```

## Integration with API Gateway

The Product Service is integrated with the API Gateway on route:
```
/product/** → http://product-service:8083
```

Access products through gateway:
```bash
# Through API Gateway (port 8080)
curl http://localhost:8080/product/api/products

# Direct access (port 8083)
curl http://localhost:8083/api/products
```

## Environment Variables

For Docker deployment, configure these environment variables:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/dbname?sslmode=require
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
```

## Development

### Project Structure
```
product-service/
├── src/
│   ├── main/
│   │   ├── java/com/stationery/product_service/
│   │   │   ├── entity/       # JPA entities
│   │   │   ├── dto/          # Data transfer objects
│   │   │   ├── controller/   # REST controllers
│   │   │   ├── service/      # Business logic
│   │   │   ├── repository/   # Data access layer
│   │   │   ├── config/       # Security configuration
│   │   │   ├── filter/       # JWT filter
│   │   │   └── ProductServiceApplication.java
│   │   └── resources/
│   │       └── application.properties
│   └── test/
├── pom.xml
├── Dockerfile
├── mvnw & mvnw.cmd
└── README.md
```

### Running Tests
```bash
mvn test
```

## Troubleshooting

### Connection Issues
- Verify PostgreSQL credentials in application.properties
- Check database URL format and SSL/TLS settings
- Ensure network connectivity to database server

### JWT Token Issues
- Verify Authorization header format: `Authorization: Bearer <token>`
- Ensure token is not expired
- Check that role is embedded in JWT claims

### Docker Issues
```bash
# Check logs
docker logs product-service

# Rebuild image
docker build --no-cache -t product-service:latest .

# Remove and recreate container
docker rm product-service
docker-compose up -d product-service
```

## Security Considerations

- JWT tokens are signed and validated on each request
- Admin role verification is performed per request
- SQL injection protection via JPA/Hibernate
- CSRF protection disabled for stateless REST API
- HTTPS recommended in production (use nginx reverse proxy)

## Support & Documentation

For issues or questions:
1. Check existing Docker logs: `docker logs product-service`
2. Review Spring Boot health endpoint: `GET /actuator/health`
3. Check API Gateway routing: Verify product service is registered
4. Verify auth service JWT token generation

## License

Part of the Stationery Store Microservices Architecture
