import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './layouts/header';
import Footer from './layouts/footer';
import Navbar from './layouts/navbar';
import ScrollToTop from './components/common/ScrollToTop';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/home'));
const Register = lazy(() => import('./pages/auth/register'));
const Products = lazy(() => import('./components/products/productsidebar'));
const ProductDetails = lazy(() => import('./components/products/ProductDetails'));
const ProductList = lazy(() => import('./pages/products/ProductList'));
const CartPage = lazy(() => import('./components/products/CartPage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/orders/OrderDetailsPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const OrderPendingPage = lazy(() => import('./pages/orders/OrderPendingPage'));
const PendingOrderPage = lazy(() => import('./pages/orders/PendingOrderPage'));
const ReviewsPage = lazy(() => import('./pages/reviews/ReviewsPage'));
const ReviewForm = lazy(() => import('./pages/reviews/ReviewForm'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const EMIPage = lazy(() => import('./pages/emi/EMIPage'));

// Auth Components
const Login = lazy(() => import('./components/auth/login'));
const ForgotPassword = lazy(() => import('./components/auth/forgotPassword'));
const VerifyOtp = lazy(() => import('./components/auth/verifyOtp'));
const ResetPassword = lazy(() => import('./components/auth/resetPassword'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));

// Admin Panel Components
const AdminRoutes = lazy(() => import('./components/admin-panel/AdminRoutes'));
const OrderReviewPage = lazy(() => import('./pages/admin/OrderReviewPage'));

// Dashboard Components
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const MyOrders = lazy(() => import('./pages/dashboard/MyOrders'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const OrderDetails = lazy(() => import('./pages/dashboard/OrderDetails'));

// Admin Auth Context
import { AdminAuthProvider } from './context/AdminAuthContext';
import CheckoutPage from './components/products/CheckoutPage';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AdminAuthProvider>
        <div className="flex flex-col min-h-screen">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminLogin />
              </Suspense>
            } />
            <Route path="/admin/orders/review/:id" element={
              <Suspense fallback={<LoadingSpinner />}>
                <OrderReviewPage />
              </Suspense>
            } />
            <Route path="/admin/*" element={
              <Suspense fallback={<LoadingSpinner />}>
                <AdminRoutes />
              </Suspense>
            } />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={
              <>
                <Suspense fallback={<LoadingSpinner />}>
                  <DashboardLayout />
                </Suspense>
              </>
            }>
              <Route index element={
                <Suspense fallback={<LoadingSpinner />}>
                  <DashboardHome />
                </Suspense>
              } />
              <Route path="my-orders" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <MyOrders />
                </Suspense>
              } />
              <Route path="orders/:id" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OrderDetails />
                </Suspense>
              } />
              <Route path="profile" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Profile />
                </Suspense>
              } />
              <Route path="settings" element={
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              } />
            </Route>
            
            {/* Public Routes */}
            <Route path="*" element={
              <>
                <Header />
                <Navbar/>
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Home />
                      </Suspense>
                    } />
                    
                    {/* Auth Routes */}
                    <Route path="/auth/register" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Register />
                      </Suspense>
                    } />
                    <Route path="/auth/login" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Login />
                      </Suspense>
                    } />
                    <Route path="/auth/forgot-password" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ForgotPassword />
                      </Suspense>
                    } />
                    <Route path="/auth/verify-otp" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <VerifyOtp />
                      </Suspense>
                    } />
                    <Route path="/auth/verify-otp/:token" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <VerifyOtp />
                      </Suspense>
                    } />
                    <Route path="/auth/reset-password" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ResetPassword />
                      </Suspense>
                    } />
                    
                    {/* Category Routes - Dynamic */}
                    <Route path="/:category" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Products />
                      </Suspense>
                    } />
                    <Route path="/:category/:subcategory" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Products />
                      </Suspense>
                    } />
                    
                    {/* Generic product category route */}
                    <Route path="/category/:category" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Products />
                      </Suspense>
                    } />
                    <Route path="/category/:category/:subcategory" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <Products />
                      </Suspense>
                    } />
                    
                    {/* New product category routes */}
                    <Route path="/products/category/:category" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProductList />
                      </Suspense>
                    } />
                    <Route path="/products/category/:category/:subcategory" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProductList />
                      </Suspense>
                    } />
                    
                    {/* Product Details Route */}
                    <Route path="/product/:id" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProductDetails />
                      </Suspense>
                    } />
                    
                    {/* Cart Route */}
                    <Route path="/cart" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CartPage />
                      </Suspense>
                    } />
                    
                    {/* Checkout Route */}
                    <Route path="/checkout" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <CheckoutPage />
                      </Suspense>
                    } />
                    
                    {/* Order Routes */}
                    <Route path="/orders" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrdersPage />
                      </Suspense>
                    } />
                    <Route path="/orders/:id" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrderDetailsPage />
                      </Suspense>
                    } />
                    <Route path="/order-confirmation/:orderId/:token" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrderConfirmationPage />
                      </Suspense>
                    } />
                    <Route path="/order-pending/:orderId" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <OrderPendingPage />
                      </Suspense>
                    } />
                    <Route path="/pending-order/:orderId" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PendingOrderPage />
                      </Suspense>
                    } />
                    
                    {/* Review Routes */}
                    <Route path="/reviews" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ReviewsPage />
                      </Suspense>
                    } />
                    <Route path="/reviews/edit/:id" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ReviewForm />
                      </Suspense>
                    } />
                    <Route path="/reviews/new/:productId" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ReviewForm />
                      </Suspense>
                    } />
                    
                    {/* Notification Routes */}
                    <Route path="/notifications" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <NotificationsPage />
                      </Suspense>
                    } />
                    
                    {/* EMI Routes */}
                    <Route path="/emi" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <EMIPage />
                      </Suspense>
                    } />
                    
                    {/* All Products Page */}
                    <Route path="/products" element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ProductList />
                      </Suspense>
                    } />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </AdminAuthProvider>
    </Router>
  );
}

export default App;
