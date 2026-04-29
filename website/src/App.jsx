import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/Mainlayout";
import AuthLayout from "./layout/Authlayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorFallback from "./components/common/ErrorFallback";
import Help from "./pages/Help/Help";
import Home from "./pages/Home/Home";
import LoginRegister from "./pages/auth/Login-Register/Login-Register";
import Verify from "./pages/auth/OTP/OTP-Verify";
import VendorRegister from "./pages/auth/vendor/VendorRegister";

import ProductDetails from "./components/Product/ProductDetails/ProductDetails";
import CategoryPage from "./pages/CategoryPage/CategoryPage";
import Notfound from "./pages/Not-found/Not-found";

import WishlistPage from "./pages/wishlist/WishlistPage";
import CartPage from "./pages/cart/CartPage";
import CheckoutPage from "./pages/cart/CheckoutPage";
import OrderHistory from "./pages/cart/OrderHistory";
import Profile from "./pages/Profile/Profile";
import { useState,useEffect } from "react";
import { CartProvider } from "./pages/cart/CartContext";
import { WishlistProvider } from "./pages/wishlist/WishlistContext";
import { OrdersProvider } from "./pages/cart/OrdersContext";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/common/ScrollToTop";
import OrderSuccess from "./pages/cart/OrderSuccess";

function App() {
 const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [serverError, setServerError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false); 

  useEffect(() => {
    const goOnline = () => {
      setIsOffline(false);
      setServerError(false);
    };
    const goOffline = () => setIsOffline(true);
    const handleServerError = () => setServerError(true);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("server-error", handleServerError);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("server-error", handleServerError);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);

    setTimeout(() => {
      if (navigator.onLine) {
        setIsOffline(false);
        setServerError(false);
        setIsRetrying(false);
        window.location.href = "/"; 
      } else {
        setIsRetrying(false);
        console.log("Still no internet...");
      }
    }, 1500);
  };

  if (isOffline) {
    return (
      <ErrorFallback 
        type="offline" 
        isRetrying={isRetrying} 
        retryAction={handleRetry} 
      />
    );
  }

  if (serverError) {
    return (
      <ErrorFallback 
        type="server" 
        isRetrying={isRetrying} 
        retryAction={handleRetry} 
      />
    );
  }
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={2000} />

        <OrdersProvider>
          <WishlistProvider>
            <CartProvider>
              <Routes>

                {/* AUTH ROUTES */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginRegister />} />
                  <Route path="/register" element={<LoginRegister />} />
                  <Route path="/verify-otp" element={<Verify />} />
                </Route>

                {/* MAIN ROUTES */}
                <Route element={<MainLayout />}>

                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/shop" element={<CategoryPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/help" element={<Help />} />

                  {/* 🔥 Vendor moved here */}
                  <Route path="/vendor-register" element={<VendorRegister />} />

                </Route>

                <Route path="*" element={<Notfound />} />
                <Route path="/order-success" element={
                  <OrderSuccess/>
                }/>
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </OrdersProvider>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;