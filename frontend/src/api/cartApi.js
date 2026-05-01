import axiosInstance from './axiosConfig';

const CART_API_URL = '/cart/api/cart';

export const cartApi = {
  // Get the current user's cart
  getCart: async () => {
    const response = await axiosInstance.get(CART_API_URL);
    return response.data;
  },

  // Add an item to the cart
  addToCart: async (productId, quantity = 1) => {
    const response = await axiosInstance.post(`${CART_API_URL}/items`, {
      productId,
      quantity
    });
    return response.data;
  },

  // Update quantity of an item in the cart
  updateCartItem: async (itemId, quantity) => {
    const response = await axiosInstance.put(`${CART_API_URL}/items/${itemId}`, {
      quantity
    });
    return response.data;
  },

  // Remove an item from the cart
  removeCartItem: async (itemId) => {
    const response = await axiosInstance.delete(`${CART_API_URL}/items/${itemId}`);
    return response.data;
  },

  // Clear the entire cart
  clearCart: async () => {
    const response = await axiosInstance.delete(`${CART_API_URL}/clear`);
    return response.data;
  },

  // Apply a coupon
  applyCoupon: async (code) => {
    const response = await axiosInstance.post(`${CART_API_URL}/coupon`, { code });
    return response.data;
  },

  // Remove a coupon
  removeCoupon: async () => {
    const response = await axiosInstance.delete(`${CART_API_URL}/coupon`);
    return response.data;
  }
};
