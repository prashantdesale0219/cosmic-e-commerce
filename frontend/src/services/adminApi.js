import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL || "https://cosmic-hzcn.onrender.com/api",
});

// Add token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Add custom header to identify admin requests
    config.headers['X-Admin-Request'] = 'true';
  }
  return config;
});

// Add response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token
      localStorage.removeItem('token');
      // Redirect to login page if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  getDashboardStats: () => API.get('/admin/dashboard/stats'),
};

// Coupon Management API
export const couponManagementApi = {
  getAllCoupons: (page = 1, limit = 20, filters = {}) => {
    const { status, search, sortBy, sortOrder } = filters;
    return API.get('/coupons', { 
      params: { page, limit, status, search, sortBy, sortOrder } 
    });
  },
  getCouponById: (id) => API.get(`/coupons/${id}`),
  createCoupon: (couponData) => API.post('/coupons', couponData),
  updateCoupon: (id, couponData) => API.put(`/coupons/${id}`, couponData),
  deleteCoupon: (id) => API.delete(`/coupons/${id}`),
  generateAndSendCoupon: (couponId, userIds) => API.post('/coupons/generate-for-users', { couponId, userIds }),
  getCouponStats: () => API.get('/coupons/stats'),
};

// Offer Management API
export const offerManagementApi = {
  getAllOffers: (page = 1, limit = 20, filters = {}) => {
    const { status, search, sortBy, sortOrder } = filters;
    return API.get('/admin/offers', { 
      params: { page, limit, status, search, sortBy, sortOrder } 
    });
  },
  getOfferById: (id) => API.get(`/admin/offers/${id}`),
  createOffer: (offerData) => API.post('/admin/offers', offerData),
  updateOffer: (id, offerData) => API.put(`/admin/offers/${id}`, offerData),
  deleteOffer: (id) => API.delete(`/admin/offers/${id}`),
  getOfferStats: () => API.get('/admin/offers/stats'),
};

// User Management API
export const userManagementApi = {
  getAllUsers: (page = 1, limit = 10, filters = {}) => {
    const { status, search, sortBy, sortOrder } = filters;
    return API.get('/admin/users', { 
      params: { page, limit, status, search, sortBy, sortOrder } 
    });
  },
  getUserById: (id) => API.get(`/admin/users/${id}`),
  createUser: (userData) => API.post('/admin/users/create', userData),
  verifyUserOtp: (verificationData) => API.post('/admin/users/verify-otp', verificationData),
  completeUserProfile: (profileData) => API.post(`/admin/users/complete-profile`, profileData),
  updateUser: (id, userData) => API.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  toggleUserStatus: (id, status) => API.put(`/admin/users/${id}/status`, { status }),
  getUserStats: () => API.get('/admin/users/stats'),
};

// Category Management API
export const categoryManagementApi = {
  getAllCategories: (page = 1, limit = 10, filters = {}) => {
    const { status, search, sortBy, sortOrder, mainOnly, parent } = filters;
    return API.get('/admin/categories', { 
      params: { page, limit, status, search, sortBy, sortOrder, mainOnly, parent } 
    });
  },
  getMainCategories: (page = 1, limit = 10, filters = {}) => {
    const { status, search, sortBy, sortOrder } = filters;
    return API.get('/admin/main-categories', { 
      params: { page, limit, status, search, sortBy, sortOrder } 
    });
  },
  getSubcategories: (parentId, page = 1, limit = 10, filters = {}) => {
    const { status, search, sortBy, sortOrder } = filters;
    return API.get(`/admin/subcategories/${parentId}`, { 
      params: { page, limit, status, search, sortBy, sortOrder } 
    });
  },
  getCategoryById: (id) => API.get(`/admin/categories/${id}`),
  createCategory: (categoryData) => {
    // If categoryData is already FormData, use it directly
    if (categoryData instanceof FormData) {
      return API.post('/admin/categories', categoryData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Otherwise create a new FormData
    const formData = new FormData();
    
    // Append text fields
    Object.keys(categoryData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, categoryData[key]);
      }
    });
    
    // Append image if exists
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }
    
    return API.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateCategory: (id, categoryData) => {
    // If categoryData is already FormData, use it directly
    if (categoryData instanceof FormData) {
      return API.put(`/admin/categories/${id}`, categoryData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Otherwise create a new FormData
    const formData = new FormData();
    
    // Append text fields
    Object.keys(categoryData).forEach(key => {
      if (key !== 'image') {
        formData.append(key, categoryData[key]);
      }
    });
    
    // Append image if exists
    if (categoryData.image) {
      formData.append('image', categoryData.image);
    }
    
    return API.put(`/admin/categories/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteCategory: (id) => API.delete(`/admin/categories/${id}`),
  getCategoryStats: () => API.get('/admin/categories/stats')
};

// Product Management API
export const productManagementApi = {
  getAllProducts: (page = 1, limit = 10, filters = {}) => {
    const { category, status, search, sortBy, sortOrder } = filters;
    return API.get('/admin/products', { 
      params: { page, limit, category, status, search, sortBy, sortOrder } 
    });
  },
  getProductById: (id) => API.get(`/admin/products/${id}`),
  getProductDetails: (id) => API.get(`/admin/products/${id}/details`),
  getRelatedProducts: (id) => API.get(`/admin/products/${id}/related`),
  getRatingSummary: (id) => API.get(`/admin/products/${id}/rating-summary`),
  getProductsByTag: (tag) => API.get(`/admin/products/tags/${tag}`),
  getProductApplications: () => API.get('/admin/products/applications'),
  createProduct: (productData) => {
    console.log('Creating product with data:', productData);
    
    // If productData is already FormData, use it directly
    if (productData instanceof FormData) {
      // Log FormData contents for debugging
      for (let pair of productData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      return API.post('/admin/products', productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    const formData = new FormData();
    
    // Append text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images' && key !== 'features' && key !== 'techSpecs' && 
          key !== 'kitComponents' && key !== 'installation' && key !== 'legal') {
        // Make sure we're using categoryId, not category
        if (key === 'category') {
          // If category is an object with id property, use that
          if (typeof productData[key] === 'object' && productData[key].id) {
            formData.append('categoryId', productData[key].id);
          } else {
            formData.append('categoryId', productData[key]);
          }
        } 
        // Convert objects to JSON strings
        else if (typeof productData[key] === 'object' && productData[key] !== null) {
          // Arrays should be handled differently than objects
          if (Array.isArray(productData[key])) {
            formData.append(key, JSON.stringify(productData[key]));
          } else {
            // For objects like customOffers, applications, technical, etc.
            formData.append(key, JSON.stringify(productData[key]));
          }
        } 
        else {
          formData.append(key, productData[key]);
        }
      }
    });
    
    // Append features as JSON
    if (productData.features) {
      formData.append('features', JSON.stringify(productData.features));
    }
    
    // Append images
    if (productData.images && productData.images.length) {
      for (let i = 0; i < productData.images.length; i++) {
        formData.append('images', productData.images[i]);
      }
    }
    
    // Log FormData contents for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    
    return API.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProduct: (id, productData) => {
    // If productData is already FormData, use it directly
    if (productData instanceof FormData) {
      return API.put(`/admin/products/${id}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    const formData = new FormData();
    
    // Append text fields
    Object.keys(productData).forEach(key => {
      if (key !== 'images' && key !== 'features' && key !== '_id' && key !== 'id') {
        formData.append(key, productData[key]);
      }
    });
    
    // Append features as JSON
    if (productData.features) {
      formData.append('features', JSON.stringify(productData.features));
    }
    
    // Append images
    if (productData.images && productData.images.length) {
      for (let i = 0; i < productData.images.length; i++) {
        formData.append('images', productData.images[i]);
      }
    }
    
    return API.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),
  updateStock: (id, stockData) => API.put(`/admin/products/${id}/stock`, stockData),
  toggleFeaturedStatus: (id, featured) => API.put(`/admin/products/${id}/featured`, { featured }),
  toggleActiveStatus: (id, status) => API.put(`/admin/products/${id}/status`, { status }),
  getProductStats: () => API.get('/admin/product-stats'),
  exportProducts: () => API.get('/admin/products-export', { responseType: 'blob' }),
  uploadDocumentation: (id, file, documentType) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post(`/admin/products/${id}/documentation?documentType=${documentType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  downloadDocumentation: (id, documentType) => {
    window.open(`${API.defaults.baseURL}/admin/products/${id}/documentation?documentType=${documentType}`, '_blank');
  },
};

// Order Management API
export const orderManagementApi = {
  getAllOrders: (page = 1, limit = 10, filters = {}) => {
    const { orderStatus, search, sortBy, sortOrder, startDate, endDate } = filters;
    return API.get('/admin/orders', { 
      params: { page, limit, orderStatus, search, sortBy, sortOrder, startDate, endDate } 
    });
  },
  getOrderById: (id) => API.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, orderStatus) => API.put(`/admin/orders/${id}/status`, { orderStatus }),
  getOrderStats: () => API.get('/admin/orders/stats'),
  exportOrders: () => API.get('/admin/orders/export', { responseType: 'blob' }),
  setShippingAndFinalPrice: (id, data) => API.put(`/order-review/${id}/set-shipping`, data),
  deleteOrder: (id) => API.delete(`/admin/orders/${id}`),
};


// Inventory Management API
export const inventoryManagementApi = {
  getAllInventoryLogs: (page = 1, limit = 10, filters = {}) => {
    const { productId, action, sortBy, sortOrder, startDate, endDate } = filters;
    return API.get('/inventory/admin/logs', { 
      params: { page, limit, productId, action, sortBy, sortOrder, startDate, endDate } 
    });
  },
  getInventorySummary: () => API.get('/inventory/admin/summary'),
  getInventoryLog: (id) => API.get(`/inventory/admin/logs/${id}`),
  updateInventory: (productId, quantity, action, notes) => 
    API.post('/inventory/admin/adjust', { productId, quantity, action, notes }),
  exportInventoryReport: () => API.get('/inventory/admin/export', { responseType: 'blob' }),
  getLowStockAlerts: () => API.get('/inventory/admin/low-stock')
};

// Coupon Management API - Removing duplicate definition
// This section is already defined earlier in the file


// Reports API
export const reportsApi = {
  getSalesReport: (filters = {}) => {
    const { startDate, endDate, groupBy } = filters;
    return API.get('/reports/ordersReports', { params: { startDate, endDate, groupBy } });
  },
  getInventoryReport: () => API.get('/reports/inventoryReports'),
  getCustomerReport: (filters = {}) => {
    const { startDate, endDate } = filters;
    return API.get('/reports/customersReports', { params: { startDate, endDate } });
  },
  getProductPerformance: (filters = {}) => {
    const { startDate, endDate, limit } = filters;
    return API.get('/reports/productsReports/performance', { params: { startDate, endDate, limit } });
  },
};

// Newsletter Management API
export const newsletterManagementApi = {
  getAllSubscribers: () => API.get('/newsletter/admin/subscribers'),
  getActiveSubscribers: () => API.get('/newsletter/admin/subscribers/active'),
  deleteSubscriber: (id) => API.delete(`/newsletter/admin/subscribers/${id}`),
  sendNewsletter: (newsletterData) => API.post('/newsletter/admin/send', newsletterData),
};

// Notification Management API
export const notificationManagementApi = {
  getAllNotifications: (page = 1, limit = 10, filters = {}) => {
    const { isRead, type } = filters;
    return API.get('/notifications/user', { 
      params: { page, limit, isRead, type } 
    });
  },
  createNotification: (notificationData) => API.post('/notifications', notificationData),
  sendNewsletterNotification: (notificationData) => API.post('/notifications/newsletter', notificationData),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/mark-all-read'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
  getActivityLogs: (page = 1, limit = 10, filters = {}) => {
    const { action, entityType, startDate, endDate } = filters;
    return API.get('/notifications/activity-logs', { 
      params: { page, limit, action, entityType, startDate, endDate } 
    });
  },
  getErrorLogs: (page = 1, limit = 10, filters = {}) => {
    const { level, statusCode, path, startDate, endDate } = filters;
    return API.get('/notifications/error-logs', { 
      params: { page, limit, level, statusCode, path, startDate, endDate } 
    });
  },
};

// Wishlist Analytics API
export const wishlistAnalyticsApi = {
  getWishlistAnalytics: () => API.get('/wishlist/analytics'),
};

// Review Management API
export const reviewManagementApi = {
  getAllReviews: (page = 1, limit = 10, filters = {}) => {
    const { status, productId } = filters;
    return API.get('/reviews/admin/all', { 
      params: { page, limit, status, productId } 
    });
  },
  getReviewById: (id) => API.get(`/reviews/admin/${id}`),
  approveReview: (id) => API.put(`/reviews/admin/${id}/approve`),
  rejectReview: (id) => API.put(`/reviews/admin/${id}/reject`),
  deleteReview: (id) => API.delete(`/reviews/admin/${id}`),
};

// EMI Management API
export const emiManagementApi = {
  getAllEMIs: () => API.get('/emi'),
  createEMI: (emiData) => API.post('/emi', emiData),
  updateEMI: (id, emiData) => API.put(`/emi/${id}`, emiData),
  deleteEMI: (id) => API.delete(`/emi/${id}`),
  
  // EMI Options API
  getAllEmiOptions: () => API.get('/emi/options'),
  getEmiOption: (id) => API.get(`/emi/options/${id}`),
  createEmiOption: (optionData) => API.post('/emi/options', optionData),
  updateEmiOption: (id, optionData) => API.put(`/emi/options/${id}`, optionData),
  deleteEmiOption: (id) => API.delete(`/emi/options/${id}`),
};

export default {
  userManagementApi,
  productManagementApi,
  orderManagementApi,
  categoryManagementApi,
  inventoryManagementApi,
  couponManagementApi,
  offerManagementApi,
  reportsApi,
  newsletterManagementApi,
  wishlistAnalyticsApi,
  reviewManagementApi,
  emiManagementApi,
  notificationManagementApi,
};