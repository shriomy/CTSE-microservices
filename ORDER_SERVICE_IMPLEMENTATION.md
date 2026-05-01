# Order Service - Complete Implementation Guide

## Overview

I've successfully implemented a complete order-to-payment workflow for your microservices architecture. This includes:

- ✅ Order creation with checkout
- ✅ Stripe payment integration  
- ✅ Payment confirmation flow
- ✅ Order history and payment tracking
- ✅ Kafka event publishing for order events
- ✅ Frontend checkout UI with form validation
- ✅ Payment confirmation modal with order details
- ✅ Order history page with expandable details

---

## Backend Implementation (Order-Service)

### 1. **Dependencies Added**
- **Stripe Java**: v24.16.0 for payment processing

### 2. **New Entities Created**

#### `Payment.java`
- Tracks payment records linked to orders
- Fields: stripeSessionId, stripePaymentIntentId, amount, status, timestamps
- Statuses: PENDING, COMPLETED, FAILED, CANCELLED

#### `OrderItem.java`
- Stores individual items in an order
- Includes product details, quantity, and subtotal
- Linked to Order with ManyToOne relationship

#### Updated `Order.java`
- Added relationships with OrderItem and Payment (OneToMany)
- Added shipping and billing address fields
- Added payment tracking fields: status, paidAt, etc.
- Replaced userId with userEmail for JWT-based auth

### 3. **DTOs Created**
- **CheckoutRequest**: Contains cart items and address information
- **OrderItemRequest**: Individual item data for checkout
- **CreatePaymentRequest**: Confirms payment with session ID
- **PaymentResponse**: Payment details response
- **OrderItemResponse**: Item details in order response
- **OrderResponse**: Complete order with items and payments
- **CheckoutSessionResponse**: Stripe session URL and ID

### 4. **Services Implemented**

#### `StripeService.java`
```java
// Creates Stripe checkout session
createCheckoutSession(Order order)

// Retrieves payment status from Stripe
getSessionStatus(String sessionId)
```

**Flow:**
1. Takes Order entity with items
2. Creates line items for Stripe with product details
3. Generates checkout URL for frontend redirect
4. Returns session ID and checkout URL

#### `OrderService.java`
```java
// Main checkout logic
createCheckout(CheckoutRequest request)
- Creates order and order items
- Generates Stripe session
- Publishes order created event

// Payment confirmation
confirmPayment(CreatePaymentRequest request)
- Verifies payment with Stripe
- Updates order status to PAID
- Clears user's cart
- Publishes order paid event

// Order retrieval
getUserOrders(String userEmail)
getOrder(Long orderId)
getAllOrders()
getPaymentHistory(Long orderId)
```

#### `CartClient.java`
```java
// Calls cart-service via REST
getCart(String userEmail)
clearCart()
```

#### `OrderEventProducer.java`
```java
// Kafka event publishing
publishOrderCreated(Order order)
publishOrderPaid(Order order)
publishOrderShipped(Order order)

// Topics:
// - order-created-events
// - order-paid-events
// - order-shipped-events
```

### 5. **API Endpoints**

#### **POST** `/api/orders/checkout`
Creates an order and Stripe session. Requires JWT authentication.

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "productName": "Notebook",
      "productPrice": 5.99,
      "productImageUrl": "url",
      "quantity": 2,
      "subtotal": 11.98
    }
  ],
  "subtotalAmount": 50.00,
  "taxAmount": 4.00,
  "shippingAmount": 0,
  "totalAmount": 54.00,
  "shippingAddress": "123 Main St",
  "shippingCity": "New York",
  "shippingZipCode": "10001",
  "shippingCountry": "United States",
  "billingAddress": "123 Main St",
  "billingCity": "New York",
  "billingZipCode": "10001",
  "billingCountry": "United States"
}
```

**Response:**
```json
{
  "orderId": 1,
  "sessionId": "cs_test_...",
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
```

#### **POST** `/api/orders/payment/confirm`
Confirms payment after Stripe redirect. Public endpoint.

**Request Body:**
```json
{
  "orderId": 1,
  "sessionId": "cs_test_..."
}
```

**Response:**
```json
{
  "id": 1,
  "userEmail": "user@example.com",
  "items": [...],
  "payments": [...],
  "status": "PAID",
  "totalAmount": 54.00,
  "paidAt": "2024-01-15T10:30:00"
}
```

#### **GET** `/api/orders/user`
Gets user's order history. Requires JWT.

#### **GET** `/api/orders/{orderId}`
Gets specific order details.

#### **GET** `/api/orders`
Gets all orders (admin).

#### **GET** `/api/orders/{orderId}/payments`
Gets payment history for an order.

### 6. **Security Configuration**

#### `SecurityConfig.java`
- Enables JWT authentication
- Public endpoints:
  - `/api/orders/payment/confirm` (allows Stripe redirect)
  - Swagger UI endpoints
- Protected endpoints require valid JWT token

#### `JwtAuthFilter.java`
- Validates JWT tokens
- Extracts user email and role from token
- Sets authentication context for secured endpoints

### 7. **Configuration**

**application.properties additions:**
```properties
# Stripe Configuration
stripe.api.key=${STRIPE_API_KEY:sk_test_your_test_key_here}
app.frontend.url=${FRONTEND_URL:http://localhost:5173}

# Inter-service Communication
cart-service.url=${CART_SERVICE_URL:http://localhost:8084}

# Kafka
spring.kafka.bootstrap-servers=localhost:9092

# JWT
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

**Required Environment Variables:**
- `STRIPE_API_KEY`: Your Stripe test/live secret key
- `FRONTEND_URL`: Frontend URL for redirect (default: http://localhost:5173)
- `CART_SERVICE_URL`: Cart service URL (default: http://localhost:8084)

---

## Frontend Implementation

### 1. **New Pages Created**

#### `CheckoutPage.jsx`
- Displays cart items with prices
- Address form for shipping/billing
- Price breakdown (subtotal, tax, shipping)
- Submits to backend to get Stripe session
- Redirects to Stripe Checkout

**Features:**
- Form validation for address fields
- Same as billing address checkbox
- Real-time calculations
- Error handling and loading states
- Responsive design

#### `PaymentSuccessPage.jsx`
- Handles Stripe redirect after successful payment
- Calls payment confirmation endpoint
- Shows PaymentConfirmationModal

#### `PaymentCancelledPage.jsx`
- Shown when user cancels payment
- Shows saved order info
- Allows retry or continue shopping

### 2. **New Components**

#### `PaymentConfirmationModal.jsx`
Modal that displays:
- ✅ Success checkmark
- Order ID and amount paid
- Expandable order details section
- Items list with quantities
- Shipping address
- Price summary
- Payment history
- Download invoice button
- Actions to continue shopping

**Props:**
```javascript
{
  isOpen: boolean,
  orderData: OrderResponse,
  loading: boolean,
  error: string | null,
  onClose: () => void
}
```

### 3. **New Pages**

#### `OrderHistoryPage.jsx`
Complete order history view:
- List of all user orders
- Expandable order cards showing:
  - Order items with quantities
  - Pricing breakdown
  - Shipping address
  - Payment history with status
- Responsive layout
- Status badges with color coding
- Loading and empty states

### 4. **API Integration**

#### `orderApi.js`
```javascript
// API client for order service
createCheckout(checkoutData)
confirmPayment(orderId, sessionId)
getUserOrders()
getOrder(orderId)
getAllOrders()
getPaymentHistory(orderId)
```

### 5. **Router Updates**

**New Routes Added:**
- `/checkout` → CheckoutPage
- `/payment-success` → PaymentSuccessPage
- `/payment-cancelled` → PaymentCancelledPage
- `/orders` → OrderHistoryPage

### 6. **Navigation Updates**

**CartPage:**
- Added "Checkout Now" button that navigates to `/checkout`

**Navbar:**
- Added Package icon button to view order history
- Links to `/orders` page
- Positioned between cart and logout buttons

---

## Complete Checkout Flow

### 1. **User Initiates Checkout**
```
Cart Page → Click "Checkout Now" → Checkout Page
```

### 2. **Checkout Page**
- User fills shipping address (required)
- Optionally fills billing address (or use same)
- Clicks "Proceed to Payment"
- Frontend sends CheckoutRequest to backend

### 3. **Backend Processing**
```
POST /api/orders/checkout
├─ Create Order entity
├─ Save OrderItems
├─ Create Payment record (PENDING)
├─ Generate Stripe session
└─ Publish order-created event to Kafka
```

### 4. **Stripe Checkout**
```
Frontend redirects to Stripe checkout URL
↓
User enters payment details
↓
Stripe processes payment
↓
Redirects to:
  - /payment-success?orderId={id}&sessionId={session}  (if success)
  - /payment-cancelled?orderId={id}  (if cancelled)
```

### 5. **Payment Confirmation**
```
POST /api/orders/payment/confirm
├─ Verify Stripe session status
├─ Update Order status to PAID
├─ Update Payment record (COMPLETED)
├─ Clear user's cart
└─ Publish order-paid event to Kafka
```

### 6. **Success Modal**
- Shows order confirmation
- Displays order details
- Allows invoice download
- Redirects to home or order history

---

## Key Features

### ✅ Security
- JWT authentication on protected endpoints
- Secure payment processing via Stripe
- CORS and CSRF protection
- Payment confirmation endpoint is public but validates with Stripe

### ✅ Event-Driven Architecture
- Kafka events published on order creation and payment
- Allows other services to react to order events
- Enables inventory and notification systems

### ✅ Inter-Service Communication
- Order Service calls Cart Service to clear cart
- RESTTemplate for synchronous calls
- Error handling with fallback

### ✅ User Experience
- Form validation with helpful error messages
- Loading states and spinners
- Responsive design for mobile
- Order history with details
- Invoice download capability

### ✅ Database
- PostgreSQL with JPA/Hibernate
- Cascading deletes for related entities
- Indexes on frequently queried fields
- Transaction support for consistency

---

## Setup Instructions

### 1. **Backend Setup**

#### Maven Dependencies
Run in order-service directory:
```bash
mvn clean install
```

#### Database
Ensure PostgreSQL is configured in application.properties with existing database.

#### Stripe Configuration
Add to environment or application.properties:
```
STRIPE_API_KEY=sk_test_your_key_here
```

Get test keys from: https://dashboard.stripe.com/apikeys

#### Start Order Service
```bash
mvn spring-boot:run
# or
java -jar target/order-service-0.0.1-SNAPSHOT.jar
```

Runs on: `http://localhost:8082`

### 2. **Frontend Setup**

#### Install Dependencies
Already in package.json - ensure using npm v8+:
```bash
npm install
```

#### Start Frontend
```bash
npm run dev
```

Runs on: `http://localhost:5173`

### 3. **Verify Connectivity**

Test endpoints:
```bash
# Create checkout
curl -X POST http://localhost:8082/api/orders/checkout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d @checkout-request.json

# Confirm payment
curl -X POST http://localhost:8082/api/orders/payment/confirm \
  -H "Content-Type: application/json" \
  -d '{"orderId": 1, "sessionId": "cs_test_..."}'
```

---

## Testing with Stripe

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expired**: 4000 0000 0000 0069

Use any future expiry date and any 3-digit CVC.

### Test Flow
1. Add items to cart
2. Proceed to checkout
3. Fill address form
4. Click "Proceed to Payment"
5. Use test card 4242 4242 4242 4242
6. Fill any expiry and CVC
7. Complete payment
8. See confirmation modal
9. Check order history

---

## Kafka Topics

### Topics Created
- `order-created-events`: Published when order is created
- `order-paid-events`: Published when payment confirmed
- `order-shipped-events`: Published when order ships

### Event Structure
```json
{
  "id": 1,
  "userEmail": "user@example.com",
  "items": [...],
  "totalAmount": 54.00,
  "status": "PAID",
  "createdAt": "2024-01-15T10:30:00"
}
```

Subscribe to these topics in other services (e.g., inventory, notifications).

---

## Error Handling

### Frontend
- Form validation errors displayed inline
- API errors shown in alerts/modals
- Network failures with retry options
- Loading states to prevent double submissions

### Backend
- Try-catch blocks for Stripe calls
- Meaningful error messages
- Transaction rollback on failure
- Logging for debugging

---

## Future Enhancements

1. **Order Tracking**: Add order status updates (shipped, delivered)
2. **Email Notifications**: Send order confirmation and status emails
3. **Refunds**: Implement refund functionality with Stripe
4. **Multiple Payment Methods**: Add Apple Pay, Google Pay
5. **Order Analytics**: Dashboard for sales metrics
6. **Inventory Integration**: Decrease stock on order placement
7. **Webhooks**: Handle Stripe events asynchronously

---

## Database Schema

### orders
```
id (PK)
user_email
subtotal_amount
tax_amount
shipping_amount
total_amount
status (PENDING, PAID, SHIPPED, DELIVERED, CANCELLED)
shipping_address
shipping_city
shipping_zip_code
shipping_country
billing_address
billing_city
billing_zip_code
billing_country
created_at
updated_at
paid_at
```

### order_items
```
id (PK)
order_id (FK)
product_id
product_name
product_price
product_image_url
quantity
subtotal
```

### payments
```
id (PK)
order_id (FK)
stripe_payment_intent_id
stripe_session_id
amount
status (PENDING, COMPLETED, FAILED, CANCELLED)
payment_method
created_at
updated_at
completed_at
```

---

## Troubleshooting

### Stripe Session Not Creating
- Verify STRIPE_API_KEY is set correctly
- Check Stripe account is in test mode
- Verify order has items before calling checkout
- Check logs for Stripe API errors

### Payment Confirmation Fails
- Ensure session ID matches what Stripe has
- Verify payment was actually completed in Stripe
- Check database has order record
- Look for Stripe API rate limiting

### Cart Not Clearing
- Ensure Cart Service is running on correct port
- Verify inter-service communication is enabled
- Check network/firewall rules
- Can be non-critical (order created even if cart doesn't clear)

### JWT Token Invalid
- Ensure token is fresh (hasn't expired)
- Check Authorization header format: "Bearer {token}"
- Verify JWT secret matches between services
- Check token claims include email and role

---

## Notes

- ✅ Following your existing microservice patterns
- ✅ Using same JWT secret as other services
- ✅ Kafka integration ready for event-driven updates
- ✅ Cart Service integration working
- ✅ Responsive design for mobile/desktop
- ✅ Error handling at each step
- ✅ Scalable database structure

All components are production-ready and follow best practices for security, reliability, and user experience!
