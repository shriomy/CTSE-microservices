import axiosInstance from './axiosConfig';

const ADMIN_COUPON_API_URL = '/cart/api/cart/admin/coupons';

export const adminCouponApi = {
  getAllCoupons: async () => {
    const response = await axiosInstance.get(ADMIN_COUPON_API_URL);
    return response.data;
  },
  createCoupon: async (couponData) => {
    const response = await axiosInstance.post(ADMIN_COUPON_API_URL, couponData);
    return response.data;
  },
  deleteCoupon: async (id) => {
    const response = await axiosInstance.delete(`${ADMIN_COUPON_API_URL}/${id}`);
    return response.data;
  }
};
