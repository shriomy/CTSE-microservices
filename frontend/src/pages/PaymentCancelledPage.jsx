import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './PaymentCancelledPage.css';

const PaymentCancelledPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  return (
    <div className="payment-cancelled-page">
      <Navbar />
      
      <main className="cancelled-container">
        <div className="cancelled-content">
          <AlertCircle size={80} className="cancelled-icon" />
          <h1>Payment Cancelled</h1>
          <p className="cancelled-message">
            Your payment has been cancelled. You can review your cart and try again whenever you're ready.
          </p>
          
          {orderId && (
            <p className="order-id">
              Order ID: #{orderId}
            </p>
          )}

          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate('/cart')}>
              Back to Cart
            </button>
            <button className="btn-secondary" onClick={() => navigate('/')}>
              Continue Shopping
            </button>
          </div>

          <div className="help-section">
            <h3>What went wrong?</h3>
            <ul>
              <li>You cancelled the payment process</li>
              <li>Your payment was declined by your bank</li>
              <li>There was a connection issue</li>
            </ul>
            <p className="help-text">
              Your order has been saved. You can return to checkout anytime to complete your purchase.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCancelledPage;
