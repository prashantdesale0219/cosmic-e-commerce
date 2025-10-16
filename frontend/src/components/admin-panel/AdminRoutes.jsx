import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import UserManagement from './userManagement';
import OrderManagement from './orderManagement';
import ProductManagement from './ProductManagement';
import NotificationsManagement from './NotificationsManagement';
import ReportsManagement from './ReportsManagement';
import CategoryManagement from './CategoryManagement';
import InventoryManagement from './InventoryManagement';
import OffersManagement from './OffersManagement';
import CouponsMangement from './CouponsMangement';
import NewsletterManagement from './NewsletterManagement';
import ReviewsManagement from './ReviewsManagement';
import WishlistAnalytics from './WishlistAnalytics';
import EmiManagement from './EmiManagement';
import AdminShippingPanel from '../../pages/admin/AdminShippingPanel';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="offers" element={<OffersManagement />} />
        <Route path="coupons" element={<CouponsMangement />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="newsletter" element={<NewsletterManagement />} />
        <Route path="notifications" element={<NotificationsManagement />} />
        <Route path="reviews" element={<ReviewsManagement />} />
        <Route path="wishlist" element={<WishlistAnalytics />} />
        <Route path="emi" element={<EmiManagement />} />
        <Route path="shipping" element={<AdminShippingPanel />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;