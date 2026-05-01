# Order Service - Quick Start Guide

## 🚀 30-Minute Setup

### Step 1: Get Stripe Keys (2 min)
1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
3. Keep it safe - you'll need it soon

### Step 2: Update Order Service Configuration (3 min)

**Option A: Environment Variables (Recommended)**
```bash
# Windows PowerShell
$env:STRIPE_API_KEY="sk_test_YOUR_KEY_HERE"
$env:FRONTEND_URL="http://localhost:5173"
$env:CART_SERVICE_URL="http://localhost:8084"

# Windows CMD
set STRIPE_API_KEY=sk_test_YOUR_KEY_HERE
set FRONTEND_URL=http://localhost:5173
set CART_SERVICE_URL=http://localhost:8084
```

**Option B: application.properties**
Edit `order-service/src/main/resources/application.properties`:
```properties
stripe.api.key=sk_test_YOUR_KEY_HERE
app.frontend.url=http://localhost:5173
cart-service.url=http://localhost:8084
```

### Step 3: Build Order Service (5 min)
```bash
cd order-service
mvn clean install
mvn spring-boot:run
```

Verify running at: http://localhost:8082/swagger-ui/

### Step 4: Frontend - Install Dependencies (3 min)
```bash
cd frontend
npm install
npm run dev
```

Runs at: http://localhost:5173

### Step 5: Test the Flow (15 min)

1. **Go to Frontend**: http://localhost:5173
2. **Login** (use existing account or register)
3. **Add Items** to cart
4. **Go to Cart** (Shopping cart icon in Navbar)
5. **Click "Checkout Now"**
6. **Fill Address Form**:
   - Street: "123 Main St"
   - City: "New York"
   - Zip: "10001"
   - Country: "United States"
7. **Click "Proceed to Payment"**
8. **Use Test Card**: 4242 4242 4242 4242
9. **Expiry**: Any future date
10. **CVC**: Any 3 digits
11. **Click "Pay"**
12. **See Confirmation Modal** ✅

---

## 📋 Verify Everything Works

### ✅ Backend Endpoint Test
```bash
# Test API health
curl http://localhost:8082/swagger-ui/

# Create checkout (replace TOKEN with real JWT)
curl -X POST http://localhost:8082/api/orders/checkout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "productName": "Test", "productPrice": 10.00, "quantity": 1, "subtotal": 10.00}],
    "subtotalAmount": 10.00,
    "taxAmount": 0.80,
    "shippingAmount": 0,
    "totalAmount": 10.80,
    "shippingAddress": "123 Main",
    "shippingCity": "NY",
    "shippingZipCode": "10001",
    "shippingCountry": "US",
    "billingAddress": "123 Main",
    "billingCity": "NY",
    "billingZipCode": "10001",
    "billingCountry": "US"
  }'
```

### ✅ Frontend Routes
- http://localhost:5173/checkout - Checkout form
- http://localhost:5173/payment-success?orderId=1&sessionId=cs_test - Success page  
- http://localhost:5173/payment-cancelled?orderId=1 - Cancelled page
- http://localhost:5173/orders - Order history

### ✅ Database Tables
Check PostgreSQL:
```sql
SELECT * FROM orders;
SELECT * FROM order_items;
SELECT * FROM payments;
```

---

## 🔧 If Something Breaks

### Order Service Won't Start
```bash
# Clear cache and rebuild
mvn clean install -DskipTests

# Check Java version (needs Java 17+)
java -version

# Check port 8082 isn't used
netstat -ano | findstr :8082
```

### Stripe Payment Fails
- ✅ Verify API key is correct
- ✅ Use test card numbers (see below)
- ✅ Check logs in IDE console
- ✅ Verify Stripe account is in TEST mode

### Frontend Can't Connect to Backend
- ✅ Both services running? (check ports 5173 & 8082)
- ✅ Check CORS config in backend
- ✅ Verify CART_SERVICE_URL is reachable

### Order Not Saving
- ✅ Check database connection
- ✅ Verify JWT token is valid
- ✅ Check cart has items

---

## 💳 Test Cards

| Scenario | Card Number | Expiry | CVC |
|----------|-------------|--------|-----|
| Success | 4242 4242 4242 4242 | Any future | Any 3 |
| Decline | 4000 0000 0000 0002 | Any future | Any 3 |
| 3D Secure | 4000 2500 0000 3010 | Any future | Any 3 |
| Expired | 4000 0000 0000 0069 | Past date | Any 3 |

---

## 📚 Key Files Modified

### Backend
- **pom.xml** - Added Stripe dependency
- **Order.java** - Enhanced with payment fields
- **OrderService.java** - Complete rewrite with checkout logic
- **OrderController.java** - New endpoints for checkout/payment
- **StripeService.java** - NEW - Stripe integration
- **CartClient.java** - NEW - Inter-service call
- **OrderEventProducer.java** - NEW - Kafka events
- **SecurityConfig.java** - NEW - JWT setup
- **JwtAuthFilter.java** - NEW - JWT validation
- **JwtService.java** - NEW - JWT utilities
- **application.properties** - Added config

### Frontend  
- **CheckoutPage.jsx** - NEW - Checkout form
- **CheckoutPage.css** - NEW - Checkout styling
- **PaymentSuccessPage.jsx** - NEW - Success handler
- **PaymentCancelledPage.jsx** - NEW - Cancelled handler
- **OrderHistoryPage.jsx** - NEW - Order history
- **PaymentConfirmationModal.jsx** - NEW - Success modal
- **orderApi.js** - NEW - API client
- **CartPage.jsx** - Updated with checkout button
- **Navbar.jsx** - Added orders link
- **App.jsx** - Added new routes

---

## 🎯 What Happens in Each Step

### 1️⃣ Checkout Page
```
User fills form → Sends to /api/orders/checkout
Backend: Creates Order + OrderItems + Payment record
Returns: Stripe checkout URL
Frontend: Redirects to Stripe
```

### 2️⃣ Stripe Checkout
```
User enters card → Stripe processes
Success: Redirects to /payment-success?orderId=X&sessionId=Y
```

### 3️⃣ Confirmation
```
Frontend calls /api/orders/payment/confirm
Backend: Verifies with Stripe → Updates order status → Clears cart
Shows: Modal with order details
```

### 4️⃣ Order History
```
User goes to /orders
Frontend calls /api/orders/user
Shows: All orders with expandable details
```

---

## 🚨 Troubleshooting Checklist

- [ ] Order Service running on port 8082?
- [ ] Frontend running on port 5173?
- [ ] Stripe API key set in environment?
- [ ] Database tables created (check PostgreSQL)?
- [ ] JWT token valid when testing checkout?
- [ ] Cart Service running on port 8084?
- [ ] Kafka running (if testing events)?

---

## 📞 Need Help?

### Check Logs
**Order Service**: Console in IDE shows detailed error messages
**Frontend**: Browser F12 → Console tab for JavaScript errors

### Common Issues

**"Order not found"**
- Order was created but payment didn't confirm
- Check database: `SELECT * FROM orders WHERE id = ?`

**"Stripe API key invalid"**
- Copy exact key from https://dashboard.stripe.com/apikeys
- Make sure it starts with `sk_test_` (not pk_test)
- Restart service after changing key

**"JWT token expired"**
- Get new login token (service auto-refreshes)
- Token lasts 10 hours from auth-service

**"Cart not clearing"**
- Non-critical - order is still created
- Restart cart-service: `mvn spring-boot:run` from cart-service dir

---

## 🎉 Success Indicators

✅ See Stripe checkout page after "Proceed to Payment"
✅ Successful payment shows confirmation modal
✅ Order appears in /orders page
✅ Payment status shows "PAID"
✅ Database has order record

---

## Next Steps

After everything works:
1. Add more test cards to edge cases
2. Test order history filter/sorting
3. Integrate with inventory service (Kafka listener)
4. Add email notifications
5. Deploy to production with real Stripe keys

Enjoy! 🚀
