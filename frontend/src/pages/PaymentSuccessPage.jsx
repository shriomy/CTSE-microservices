import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../api/orderApi';
import PaymentConfirmationModal from '../components/PaymentConfirmationModal';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('sessionId');

    if (!orderId || !sessionId) {
      setError('Invalid payment parameters');
      setLoading(false);
      return;
    }

    confirmPayment(orderId, sessionId);
  }, [searchParams]);

  const confirmPayment = async (orderId, sessionId) => {
    try {
      setLoading(true);
      const response = await orderApi.confirmPayment(orderId, sessionId);
      setOrderData(response);
      setLoading(false);
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError(err.response?.data?.message || 'Failed to confirm payment');
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}></div>
      <PaymentConfirmationModal 
        isOpen={showModal}
        orderData={orderData}
        loading={loading}
        error={error}
        onClose={handleModalClose}
      />
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;
