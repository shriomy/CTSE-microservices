import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, Download } from 'lucide-react';
import './PaymentConfirmationModal.css';

const PaymentConfirmationModal = ({ isOpen, orderData, loading = false, error = null, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const handleDownloadInvoice = () => {
    // Generate a simple invoice
    const invoiceContent = `
INVOICE
===============================================

Order ID: #${orderData?.id}
Order Date: ${new Date(orderData?.createdAt).toLocaleDateString()}
Status: ${orderData?.status}

ITEMS
===============================================
${orderData?.items?.map(item => 
  `${item.productName}
  Qty: ${item.quantity} x $${item.productPrice.toFixed(2)} = $${item.subtotal.toFixed(2)}`
).join('\n\n')}

TOTALS
===============================================
Subtotal:     $${orderData?.subtotalAmount?.toFixed(2)}
Tax (8%):     $${orderData?.taxAmount?.toFixed(2)}
Shipping:     FREE
---
Total:        $${orderData?.totalAmount?.toFixed(2)}

SHIPPING ADDRESS
===============================================
${orderData?.shippingAddress}
${orderData?.shippingCity}, ${orderData?.shippingZipCode}
${orderData?.shippingCountry}

Thank you for your purchase!
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceContent));
    element.setAttribute('download', `invoice-${orderData?.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        {loading ? (
          <div className="modal-loading">
            <Loader size={48} className="animate-spin" />
            <p>Processing your payment...</p>
          </div>
        ) : error ? (
          <div className="modal-content error">
            <AlertCircle size={64} className="modal-icon error-icon" />
            <h2>Payment Failed</h2>
            <p className="error-message">{error}</p>
            <button className="btn-primary" onClick={onClose}>
              Try Again
            </button>
          </div>
        ) : orderData ? (
          <div className="modal-content success">
            <CheckCircle size={64} className="modal-icon success-icon" />
            <h2>Payment Confirmed!</h2>
            <p className="confirmation-text">
              Thank you for your purchase. Your order has been successfully placed.
            </p>

            <div className="order-info-box">
              <div className="info-row">
                <span className="label">Order ID:</span>
                <span className="value">#{orderData.id}</span>
              </div>
              <div className="info-row">
                <span className="label">Amount Paid:</span>
                <span className="value">${orderData.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="info-row">
                <span className="label">Status:</span>
                <span className="value status-badge paid">PAID</span>
              </div>
            </div>

            <button 
              className="toggle-details-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? '- Hide Order Details' : '+ View Order Details'}
            </button>

            {showDetails && (
              <div className="order-details">
                <h3>Order Details</h3>
                
                <div className="details-section">
                  <h4>Items Ordered</h4>
                  <div className="items-list">
                    {orderData.items?.map((item, idx) => (
                      <div key={idx} className="detail-item">
                        <span className="item-name">{item.productName}</span>
                        <span className="item-qty">x{item.quantity}</span>
                        <span className="item-total">${item.subtotal?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="details-section">
                  <h4>Shipping Address</h4>
                  <div className="address">
                    <p>{orderData.shippingAddress}</p>
                    <p>{orderData.shippingCity}, {orderData.shippingZipCode}</p>
                    <p>{orderData.shippingCountry}</p>
                  </div>
                </div>

                <div className="details-section">
                  <h4>Price Summary</h4>
                  <div className="price-summary">
                    <div className="price-line">
                      <span>Subtotal</span>
                      <span>${orderData.subtotalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="price-line">
                      <span>Tax</span>
                      <span>${orderData.taxAmount?.toFixed(2)}</span>
                    </div>
                    <div className="price-line">
                      <span>Shipping</span>
                      <span>FREE</span>
                    </div>
                    <div className="price-line total">
                      <span>Total</span>
                      <span>${orderData.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={handleDownloadInvoice}>
                <Download size={18} /> Download Invoice
              </button>
              <button className="btn-primary" onClick={onClose}>
                Continue Shopping
              </button>
            </div>

            <p className="confirmation-note">
              A confirmation email has been sent to your email address.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentConfirmationModal;
