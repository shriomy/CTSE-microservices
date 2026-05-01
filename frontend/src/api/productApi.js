import apiClient from './axiosConfig';

export const productApi = {
  // Get all products
  getAllProducts: async () => {
    const response = await apiClient.get('/product/api/products');
    return response.data;
  },

  // Get available products
  getAvailableProducts: async () => {
    const response = await apiClient.get('/product/api/products/available');
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await apiClient.get(`/product/api/products/${id}`);
    return response.data;
  },

  // Create new product (Admin)
  createProduct: async (productData) => {
    const response = await apiClient.post('/product/api/products', productData);
    return response.data;
  },

  // Update product (Admin)
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/product/api/products/${id}`, productData);
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/product/api/products/${id}`);
    return response.data;
  }
};
