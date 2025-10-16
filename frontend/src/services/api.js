import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Newsletter API
export const newsletterApi = {
  subscribe: (data) => API.post('/newsletter/subscribe', data),
  unsubscribe: (data) => API.post('/newsletter/unsubscribe', data),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (params) => API.get('/notifications/user', { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/mark-all-read'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
};

// Auth API
export const authApi = {
  register: (userData) => API.post('/auth/register', userData),
  verifyOtp: (data) => API.post('/auth/verify-otp', data),
  resendOtp: (data) => API.post('/auth/resend-otp', data),
  login: (credentials) => API.post('/auth/login', credentials),
  getCurrentUser: () => API.get('/auth/me'),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  getProfile: (id) => API.get(`/auth/customers/${id}`),
  updateProfile: (id, userData) => API.put(`/auth/customers/${id}`, userData),
  deleteAccount: (id) => API.delete(`/auth/customers/${id}`),
  getUserStats: () => API.get('/auth/user-stats'),
};

// Products API
export const productsApi = {
  getAllProducts: (page = 1, limit = 10, filters = {}) => {
    const { category, search, sortBy, sortOrder, minPrice, maxPrice } = filters;
    return API.get('/products', { 
      params: { page, limit, category, search, sortBy, sortOrder, minPrice, maxPrice } 
    });
  },
  getProductById: (id) => API.get(`/products/${id}`),
  getProductDetails: (id) => API.get(`/products/${id}`),


  getProductReviews: (id) => API.get(`/reviews/product/${id}`),
  getRelatedProducts: (id) => API.get(`/products/${id}/related`),
  getRatingSummary: (id) => API.get(`/products/${id}/rating-summary`),
  getProductsByTag: (tag) => API.get(`/products/tags/${tag}`),
  getProductApplications: () => API.get('/products/applications'),
  getTopRatedProducts: () => API.get('/products/top-rated'),
  getNewArrivals: () => API.get('/products/new-arrivals'),
  addReview: (productId, reviewData) => {
    const formData = new FormData();
    
    // Add text fields
    Object.keys(reviewData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, reviewData[key]);
      }
    });
    
    // Add images if any
    if (reviewData.images && reviewData.images.length) {
      for (let i = 0; i < reviewData.images.length; i++) {
        formData.append('images', reviewData.images[i]);
      }
    }
    
    return API.post(`/reviews`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Shipping API
export const shippingApi = {
  submitShippingAddress: (data) => API.post('/shipping/submit', data),
  confirmOrder: (orderId) => API.put(`/shipping/confirm/${orderId}`),
  cancelOrder: (orderId, data) => API.put(`/shipping/cancel/${orderId}`, data),
};

// Admin Shipping API
export const adminShippingApi = {
  addShippingCharges: (orderId, data) => API.put(`/shipping/charges/${orderId}`, data),
  getPendingReviewOrders: () => API.get('/shipping/pending-review'),
  getWaitingConfirmationOrders: () => API.get('/shipping/waiting-confirmation'),
};

// Cart API
export const cartApi = {
  getCart: () => API.get('/cart'),
  addToCart: (productData) => API.post('/cart', productData),
  updateCartItem: (itemId, quantity) => API.put(`/cart/${itemId}`, { quantity }),
  removeCartItem: (itemId) => API.delete(`/cart/${itemId}`),
  clearCart: () => API.delete('/cart'),
};

// Review API
export const reviewApi = {
  getUserReviews: () => API.get('/reviews/user'),
  getReviewById: (id) => API.get(`/reviews/${id}`),
  createReview: (data) => API.post('/reviews', data),
  updateReview: (id, data) => API.put(`/reviews/${id}`, data),
  deleteReview: (id) => API.delete(`/reviews/${id}`),
  getProductReviews: (productId) => API.get(`/reviews/${productId}`),
};

// Notification API
export const notificationApi = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
};

// EMI API
export const emiApi = {
  getUserEmiPlans: () => API.get('/emi/user-plans'),
  getEmiPlanById: (id) => API.get(`/emi/plans/${id}`),
  makeEmiPayment: (installmentId, data) => API.post(`/emi/payment/${installmentId}`, data),
  getEmiOptions: (productId) => API.get(`/emi/options/${productId}`),
};

// Coupon API
export const couponApi = {
  validateCoupon: (code, cartTotal) => API.post('/coupons/validate', { code, cartTotal }),
  applyCoupon: (code) => API.post('/coupons/apply', { code }),
};

// Orders API
export const ordersApi = {
  placeOrder: (orderData) => API.post('/orders', orderData),
  verifyEmailAndPlaceOrder: (orderData) => API.post('/orders/guest', orderData),
  sendOrderForReview: (orderData) => API.post('/order-review/review', orderData),
  confirmOrder: (orderId, confirmationData) => API.post(`/order-review/${orderId}/confirm`, confirmationData),
  cancelOrderRequest: (orderId) => API.post(`/order-review/${orderId}/cancel-request`),
  getMyOrders: (params = {}) => {
    const { page = 1, limit = 5, status = '', search = '' } = params;
    return API.get('/orders', { 
      params: { page, limit, status, search } 
    });
  },
  getOrderById: (id) => API.get(`/orders/${id}`),
  cancelOrder: (id) => API.put(`/orders/${id}/cancel`),
  trackOrder: (id) => API.get(`/orders/${id}/track`),
  confirmOrderByToken: (orderId, token) => axios.post(`/api/order-review/customer-confirm/${orderId}/${token}`),
  cancelOrderByToken: (orderId, token, reason) => axios.post(`/api/order-review/customer-cancel/${orderId}/${token}`, { cancelReason: reason }),
};

// Wishlist API
export const wishlistApi = {
  getWishlist: () => API.get('/wishlist'),
  addToWishlist: (productId) => API.post('/wishlist', { productId }),
  removeFromWishlist: (productId) => API.delete(`/wishlist/${productId}`),
};

// Category API
export const categoryApi = {
  getAllCategories: () => API.get('/categories'),
  getCategoryById: (id) => API.get(`/categories/${id}`),
  getCategoriesBySlug: (slug) => API.get(`/categories/slug/${slug}`),
  createCategory: (categoryData) => API.post('/admin/categories', categoryData),
  updateCategory: (id, categoryData) => API.put(`/admin/categories/${id}`, categoryData),
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),
};



export default {
  auth: authApi,
  shipping: shippingApi,
  adminShipping: adminShippingApi,
  products: productsApi,
  cart: cartApi,
  orders: ordersApi,
  wishlist: wishlistApi,
  category: categoryApi,
  review: reviewApi,
  coupon: couponApi,
  newsletter: newsletterApi,
};