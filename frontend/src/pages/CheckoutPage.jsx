import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { cartApi } from '../api/cartApi';
import { orderApi } from '../api/orderApi';
import { ArrowLeft, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../pages/CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    shippingAddress: '',
    shippingCity: '',
    shippingZipCode: '',
    shippingCountry: 'United States',
    billingAddress: '',
    billingCity: '',
    billingZipCode: '',
    billingCountry: 'United States',
    sameAsBilling: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCartItems();
  }, [user, navigate]);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      const cartData = await cartApi.getCart();
      setCartItems(cartData.items || []);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 0; // Free shipping
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!formData.shippingAddress || !formData.shippingCity || !formData.shippingZipCode) {
        setError('Please fill in all required shipping fields');
        setSubmitting(false);
        return;
      }

      const { subtotal, tax, shipping, total } = calculateTotals();

      const checkoutData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImageUrl: item.productImageUrl,
          quantity: item.quantity,
          subtotal: item.subtotal
        })),
        subtotalAmount: subtotal,
        taxAmount: tax,
        shippingAmount: shipping,
        totalAmount: total,
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingZipCode: formData.shippingZipCode,
        shippingCountry: formData.shippingCountry,
        billingAddress: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        billingCity: formData.sameAsBilling ? formData.shippingCity : formData.billingCity,
        billingZipCode: formData.sameAsBilling ? formData.shippingZipCode : formData.billingZipCode,
        billingCountry: formData.sameAsBilling ? formData.shippingCountry : formData.billingCountry,
      };

      const sessionResponse = await orderApi.createCheckout(checkoutData);

      if (sessionResponse.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = sessionResponse.checkoutUrl;
      } else {
        setError('Failed to initiate checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setSubmitting(false);
    }
  };

  const { subtotal, tax, shipping, total } = calculateTotals();

  if (loading) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-loading">
          <Loader size={48} className="animate-spin" />
          <p>Loading checkout...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />
      
      <main className="checkout-container">
        <button className="back-btn" onClick={() => navigate('/cart')}>
          <ArrowLeft size={20} /> Back to Cart
        </button>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Left Column - Order Summary */}
          <div className="checkout-summary-section">
            <h2 className="section-title">Order Summary</h2>
            
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item-card">
                  <div className="item-image">
                    <img 
                      src={item.productImageUrl || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%3E%3Crect%20fill%3D%22%23f3f4f6%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3C%2Fsvg%3E'}
                      alt={item.productName}
                    />
                  </div>
                  <div className="item-details">
                    <h4>{item.productName}</h4>
                    <p className="item-qty">Qty: {item.quantity}</p>
                    <p className="item-price">${item.productPrice.toFixed(2)} each</p>
                  </div>
                  <div className="item-subtotal">
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span className="free">FREE</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping Form */}
          <div className="checkout-form-section">
            <form onSubmit={handleCheckout} className="checkout-form">
              {error && <div className="error-message">{error}</div>}

              <h2 className="section-title">Shipping Address</h2>

              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="shippingCity"
                    value={formData.shippingCity}
                    onChange={handleInputChange}
                    placeholder="New York"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Zip Code *</label>
                  <input
                    type="text"
                    name="shippingZipCode"
                    value={formData.shippingZipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="shippingCountry"
                  value={formData.shippingCountry}
                  onChange={handleInputChange}
                  disabled
                />
              </div>

              <h2 className="section-title" style={{ marginTop: '32px' }}>Billing Address</h2>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="sameAsBilling"
                  checked={formData.sameAsBilling}
                  onChange={handleInputChange}
                />
                Same as shipping address
              </label>

              {!formData.sameAsBilling && (
                <>
                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="billingAddress"
                      value={formData.billingAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        placeholder="New York"
                      />
                    </div>
                    <div className="form-group">
                      <label>Zip Code</label>
                      <input
                        type="text"
                        name="billingZipCode"
                        value={formData.billingZipCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="billingCountry"
                      value={formData.billingCountry}
                      onChange={handleInputChange}
                      disabled
                    />
                  </div>
                </>
              )}

              <button 
                type="submit" 
                className="btn-pay-now"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader size={20} className="inline-spin" /> Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>

              <p className="secure-note">
                🔒 Your payment information is secure and encrypted
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
