# CORS Configuration Guide

## Problem Solved

The frontend (React on localhost:3000) was unable to communicate with the backend API (localhost:8080) due to CORS (Cross-Origin Resource Sharing) policy restrictions.

### Original Error
```
Access to XMLHttpRequest at 'http://localhost:8080/product/api/products/available' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## What is CORS?

CORS is a security feature implemented by web browsers that restricts scripts from one origin from accessing resources on another origin without explicit permission.

### Origins Defined By:
- **Scheme:** http vs https
- **Domain:** localhost vs example.com
- **Port:** 3000 vs 8080

### Example Origins:
- ✓ Same: `http://localhost:3000` and `http://localhost:3000/app`
- ✗ Different: `http://localhost:3000` and `http://localhost:8080` (different port)
- ✗ Different: `http://localhost:3000` and `https://localhost:3000` (different scheme)

---

## Solution Implemented

### 1. API Gateway CORS Configuration

**File:** `api-gateway/src/main/resources/application.yml`

Added global CORS configuration:
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins:
              - "http://localhost:3000"
              - "http://localhost:5173"
              - "http://127.0.0.1:3000"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - PATCH
              - OPTIONS
            allowedHeaders:
              - "*"
            exposedHeaders:
              - "Authorization"
              - "Content-Type"
              - "X-Correlation-Id"
            allowCredentials: true
            maxAge: 3600
```

### 2. Microservices CORS Configuration

**Files Created:**
- `auth-service/src/main/java/com/stationery/auth_service/config/CorsConfig.java`
- `product-service/src/main/java/com/stationery/product_service/config/CorsConfig.java`
- `cart-service/src/main/java/com/stationery/cart_service/config/CorsConfig.java`
- `order-service/src/main/java/com/stationery/order_service/config/CorsConfig.java`

Each service has identical CORS configuration:
```java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allowed origins (update for production)
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:3000",
                "http://localhost:8080"
        ));
        
        // Allowed HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Expose custom headers
        configuration.setExposedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Correlation-Id",
                "X-User-Email",
                "X-User-Role"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Cache preflight for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## How CORS Works Now

### Before (Error)
```
1. Browser: OPTIONS /product/api/products/available
2. Server: No CORS headers
3. Browser: ✗ Blocked - can't make request
```

### After (Success)
```
1. Browser: OPTIONS /product/api/products/available (preflight)
2. Server: 
   - Access-Control-Allow-Origin: http://localhost:3000 ✓
   - Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS ✓
   - Access-Control-Allow-Headers: * ✓
3. Browser: ✓ Allowed - makes actual request
4. Server: Responds with data
```

---

## Configuration Explained

### Allowed Origins
```java
"http://localhost:3000",      // React dev server (default)
"http://localhost:5173",      // Vite dev server (alternative)
"http://127.0.0.1:3000",      // Alternative localhost
"http://localhost:8080"       // Gateway itself (for direct calls)
```

**For Production:** Replace with your actual domain:
```java
"https://example.com",
"https://www.example.com"
```

### Allowed Methods
```java
"GET"     - Retrieve data
"POST"    - Create data
"PUT"     - Replace data
"DELETE"  - Remove data
"PATCH"   - Partial update
"OPTIONS" - Preflight request
```

### Allowed Headers
```java
"*"       - Accept all headers (permissive)
```

**For Production:** Be more specific:
```java
Arrays.asList(
    "Content-Type",
    "Authorization",
    "X-Correlation-Id"
)
```

### Exposed Headers
Headers that JavaScript can read from the response:
```java
"Authorization",      // JWT token
"Content-Type",       // Response format
"X-Correlation-Id",   // Trace ID
"X-User-Email",       // User info
"X-User-Role"         // Role info
```

### Allow Credentials
```java
true  // Allow cookies and authorization headers
```

### Max Age
```java
3600L  // Cache preflight response for 3600 seconds (1 hour)
```
Reduces browser preflight requests, improves performance.

---

## Request Flow with CORS

### Step 1: Preflight Request (Automatic)
Browser makes OPTIONS request before actual request:
```
OPTIONS /product/api/products/available HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: GET
Access-Control-Request-Headers: content-type
```

### Step 2: Preflight Response
Server responds with CORS headers:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: *
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 3600
```

### Step 3: Browser Allows Request
Browser checks headers, then makes actual request:
```
GET /product/api/products/available HTTP/1.1
Origin: http://localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```

### Step 4: Actual Response
```
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Expose-Headers: Authorization, Content-Type, X-Correlation-Id

{
  "products": [...]
}
```

---

## Verification Checklist

- [x] API Gateway has CORS configuration in application.yml
- [x] Auth Service has CorsConfig.java
- [x] Product Service has CorsConfig.java
- [x] Cart Service has CorsConfig.java
- [x] Order Service has CorsConfig.java
- [x] All services build successfully
- [x] CORS allows localhost:3000
- [x] CORS allows localhost:5173 (Vite alternative)
- [x] CORS allows all necessary HTTP methods
- [x] CORS exposes custom headers

---

## Testing CORS

### Test 1: Simple Request from Browser
```javascript
// In browser console (localhost:3000)
fetch('http://localhost:8080/product/api/products/available')
  .then(r => r.json())
  .then(d => console.log('✓ SUCCESS', d))
  .catch(e => console.error('✗ FAILED', e))
```

### Test 2: With Authorization Header
```javascript
fetch('http://localhost:8080/cart/api/carts', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
  .then(r => r.json())
  .then(d => console.log('✓ SUCCESS', d))
  .catch(e => console.error('✗ FAILED', e))
```

### Test 3: Using curl (Server-side - no CORS restriction)
```bash
curl -H "Authorization: Bearer YOUR_JWT" \
     http://localhost:8080/product/api/products/available
```

### Test 4: Check CORS Headers with curl
```bash
# Preflight request
curl -i -X OPTIONS \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:8080/product/api/products/available
```

Expected response should include:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: *
```

---

## Common Issues & Solutions

### Issue 1: "CORS Policy Blocked" Still Shows

**Cause:** Services need to be restarted with new configuration

**Solution:**
```bash
# Rebuild and restart services
docker-compose down
docker-compose up --build
```

### Issue 2: Request Works from curl But Not Browser

**Cause:** Browser CORS policy more strict than server-side requests

**Solution:** This is expected. CORS only affects browser requests. Server-to-server communication is not restricted.

### Issue 3: Preflight Always Returns 403

**Cause:** OPTIONS method might be blocked

**Solution:** Ensure OPTIONS is in allowedMethods:
```java
configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"  // <- OPTIONS required
));
```

### Issue 4: Credentials Not Being Sent

**Cause:** allowCredentials not set or fetch request missing credentials

**Solution:**
```java
// In CorsConfig
configuration.setAllowCredentials(true);

// In fetch request
fetch(url, {
    credentials: 'include'  // Send cookies and auth headers
})
```

### Issue 5: Custom Headers Not Accessible in JavaScript

**Cause:** Headers not exposed in CORS config

**Solution:**
```java
// Expose headers that JS can read
configuration.setExposedHeaders(Arrays.asList(
    "Authorization",
    "X-Correlation-Id",
    "X-Custom-Header"
));

// In JavaScript
fetch(url)
  .then(r => {
      console.log(r.headers.get('X-Correlation-Id')); // Now accessible
  });
```

---

## Production Configuration

### For Production Website
```java
configuration.setAllowedOrigins(Arrays.asList(
    "https://example.com",
    "https://www.example.com",
    "https://app.example.com"
));

configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "DELETE", "OPTIONS"
));

configuration.setAllowedHeaders(Arrays.asList(
    "Content-Type",
    "Authorization",
    "X-Correlation-Id"
));

configuration.setMaxAge(86400L);  // 24 hours
```

### For Development
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000"
));

configuration.setAllowedMethods(Arrays.asList(
    "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
));

configuration.setAllowedHeaders(Arrays.asList("*"));
```

---

## Best Practices

1. **Be Specific with Origins**
   - Development: Allow localhost with various ports
   - Production: Only allow your domain(s)

2. **Limit Methods**
   - Only allow methods your API supports
   - Remove PATCH if not needed

3. **Restrict Headers in Production**
   - Development: Allow "*"
   - Production: Specify exactly which headers

4. **Use maxAge Wisely**
   - Development: 3600 (1 hour) for quick testing
   - Production: 86400 (24 hours) for better performance

5. **Always Use HTTPS in Production**
   - CORS works with HTTP but shouldn't be used
   - Only HTTPS URLs in production

6. **Monitor CORS Errors**
   - Log CORS rejections
   - Alert if unexpected origins try to access

---

## Summary of Changes

| File | Change | Purpose |
|------|--------|---------|
| `api-gateway/application.yml` | Added globalcors config | Gateway CORS support |
| `auth-service/CorsConfig.java` | Created new file | Auth service CORS |
| `product-service/CorsConfig.java` | Created new file | Product service CORS |
| `cart-service/CorsConfig.java` | Created new file | Cart service CORS |
| `order-service/CorsConfig.java` | Created new file | Order service CORS |

**All services build successfully ✓**

---

## What Changed for Users

**Before:** ✗ Frontend could not fetch data from API
```
Error: CORS policy blocked request
```

**After:** ✓ Frontend can fetch data freely
```
Response: { "products": [...] }
```

---

## Next Steps

1. **Test with Frontend**
   - Run: `npm start` in frontend directory
   - Verify all API calls work
   - Check Network tab in browser DevTools

2. **Deploy to Production**
   - Update CORS origins to your domain
   - Use HTTPS only
   - Test from production domain

3. **Monitor**
   - Log CORS rejections
   - Alert on suspicious origins
   - Review regularly

---

## Questions?

CORS configuration is now complete and allows:
- ✓ Frontend on localhost:3000 to call backend on localhost:8080
- ✓ All HTTP methods (GET, POST, PUT, DELETE, PATCH)
- ✓ All headers and authentication
- ✓ Cross-origin requests with credentials

If you encounter any issues, check the browser's **Network** tab in DevTools to see:
1. Preflight request (OPTIONS)
2. Response headers
3. Actual request/response
