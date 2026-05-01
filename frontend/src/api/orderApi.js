import axiosInstance from './axiosConfig';

const ORDER_API_URL = '/order/api/orders';

export const orderApi = {
  // Create checkout session
  createCheckout: async (checkoutData) => {
    const response = await axiosInstance.post(`${ORDER_API_URL}/checkout`, checkoutData);
    return response.data;
  },

  // Confirm payment after Stripe checkout
  confirmPayment: async (orderId, sessionId) => {
    const response = await axiosInstance.post(`${ORDER_API_URL}/payment/confirm`, {
      orderId,
      sessionId
    });
    return response.data;
  },

  // Get user's order history
  getUserOrders: async () => {
    const response = await axiosInstance.get(`${ORDER_API_URL}/user`);
    return response.data;
  },

  // Get specific order details
  getOrder: async (orderId) => {
    const response = await axiosInstance.get(`${ORDER_API_URL}/${orderId}`);
    return response.data;
  },

  // Get all orders (admin)
  getAllOrders: async () => {
    const response = await axiosInstance.get(ORDER_API_URL);
    return response.data;
  },

  // Get payment history for an order
  getPaymentHistory: async (orderId) => {
    const response = await axiosInstance.get(`${ORDER_API_URL}/${orderId}/payments`);
    return response.data;
  }
};
