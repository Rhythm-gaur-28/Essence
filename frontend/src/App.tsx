import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import Wishlist from '@/pages/Wishlist';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import AdminLayout from '@/pages/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import ManageProducts from '@/pages/admin/ManageProducts';
import ManageOrders from '@/pages/admin/ManageOrders';
import ManageUsers from '@/pages/admin/ManageUsers';
import ManageBrands from '@/pages/admin/ManageBrands';
import ManageCoupons from '@/pages/admin/ManageCoupons';
import ManageBanners from '@/pages/admin/ManageBanners';
import About from "@/pages/About";
import Brands from "@/pages/Brands";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

const App = () => (
  <AuthProvider>
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" toastOptions={{
            style: { fontFamily: 'Poppins, sans-serif', fontSize: '13px', borderRadius: '12px' },
          }} />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/about" element={<About />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                <Route path="/order-success" element={<PrivateRoute><OrderSuccess /></PrivateRoute>} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="brands" element={<ManageBrands />} />
                  <Route path="coupons" element={<ManageCoupons />} />
                  <Route path="banners" element={<ManageBanners />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
