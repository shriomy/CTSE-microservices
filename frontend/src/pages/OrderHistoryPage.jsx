import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { orderApi } from '../api/orderApi';
import { ChevronDown, Loader } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const userOrders = await orderApi.getUserOrders();
      setOrders(userOrders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'PAID':
        return '#10b981';
      case 'PENDING':
        return '#f59e0b';
      case 'SHIPPED':
        return '#3b82f6';
      case 'DELIVERED':
        return '#10b981';
      case 'CANCELLED':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="order-history-page">
      <Navbar />
      
      <main className="order-history-container">
        <div className="order-history-header">
          <h1>Order History</h1>
          <p>View all your orders and payment details</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={loadOrders} className="retry-btn">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            <Loader size={48} className="animate-spin" />
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>You haven't placed any orders yet. Start shopping to create your first order!</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div 
                  className="order-header"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="order-info">
                    <div className="order-id-badge">Order #{order.id}</div>
                    <div className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="order-items-count">
                      {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </div>
                    <div className="order-total">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  <div className="order-status" style={{ borderColor: getStatusColor(order.status) }}>
                    <span style={{ color: getStatusColor(order.status) }}>
                      {order.status}
                    </span>
                  </div>

                  <ChevronDown 
                    size={20} 
                    className={`expand-icon ${expandedOrderId === order.id ? 'expanded' : ''}`}
                  />
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-details">
                    <div className="details-grid">
                      <div className="detail-section">
                        <h3>Items</h3>
                        <div className="items-container">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="item-row">
                              <span className="item-name">{item.productName}</span>
                              <span className="item-qty">×{item.quantity}</span>
                              <span className="item-price">${item.subtotal?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h3>Pricing</h3>
                        <div className="pricing-breakdown">
                          <div className="price-row">
                            <span>Subtotal</span>
                            <span>${order.subtotalAmount?.toFixed(2)}</span>
                          </div>
                          <div className="price-row">
                            <span>Tax</span>
                            <span>${order.taxAmount?.toFixed(2)}</span>
                          </div>
                          <div className="price-row">
                            <span>Shipping</span>
                            <span>FREE</span>
                          </div>
                          <div className="price-row total">
                            <span>Total</span>
                            <span>${order.totalAmount?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h3>Shipping Address</h3>
                        <div className="address-info">
                          <p>{order.shippingAddress}</p>
                          <p>{order.shippingCity}, {order.shippingZipCode}</p>
                          <p>{order.shippingCountry}</p>
                        </div>
                      </div>

                      {order.payments && order.payments.length > 0 && (
                        <div className="detail-section">
                          <h3>Payment History</h3>
                          <div className="payments-list">
                            {order.payments.map((payment, idx) => (
                              <div key={idx} className="payment-row">
                                <div className="payment-info">
                                  <div className="payment-method">
                                    {payment.paymentMethod || 'Card Payment'}
                                  </div>
                                  <div className="payment-date">
                                    {payment.completedAt ? new Date(payment.completedAt).toLocaleDateString() : 'Pending'}
                                  </div>
                                </div>
                                <div className="payment-status" style={{ color: getStatusColor(payment.status) }}>
                                  {payment.status}
                                </div>
                                <div className="payment-amount">
                                  ${payment.amount?.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderHistoryPage;
