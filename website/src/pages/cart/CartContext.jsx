import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../../context/AuthContext"; 
import { addToCartApi, getCartApi, removeFromCartApi, clearAllCartApi } from "../../utils/cartApi";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth(); 
  const [cart, setCart] = useState([]);

  // FETCH CART
 const fetchCart = async () => {
    try {
      const response = await getCartApi();
      
      console.log("Cart API Response:", response.data); 

      let cartData = response.data?.data || response.data;

      if (!Array.isArray(cartData)) {
         cartData = cartData?.items || cartData?.cart_items || cartData?.data || []; 
      }

      setCart(Array.isArray(cartData) ? cartData : []);
      
    } catch (error) {
      console.error("Error fetching cart data:", error);
      setCart([]); 
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isLoggedIn]);

  //  ADD TO CART
  const addToCart = async (product) => {
    if (!isLoggedIn) return; 

    try {
      const response = await addToCartApi(product.id || product.product_id, 1);
      
      if (response) {
        await fetchCart(); 
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn) return;

    const item = cart.find((i) => i.product_id === productId || i.id === productId);
    if (!item) return;

    try {
      const cartId = item.cart_id || item.id; 

      await removeFromCartApi(cartId, productId, 1);
      await fetchCart(); 
    } catch (error) {
      console.error("Remove from cart failed:", error);
    }
  };
  const clearItemFromCart = async (productId) => {
    if (!isLoggedIn) return;

    const item = cart.find((i) => i.product_id === productId || i.id === productId);
    if (!item) return;

    try {
      const cartId = item.cart_id || item.id; 
      
     
      await removeFromCartApi(cartId, productId, item.quantity);
      
      await fetchCart(); 
    } catch (error) {
      console.error("Clear item failed:", error);
    }
  };
  //  CLEAR  CART 
  const clearCart = async () => {
    if (!isLoggedIn) return;
    try {
      await clearAllCartApi();
      setCart([]); 
    } catch (error) {
      console.error("Clear cart failed:", error);
    }
  };

  const safeCart = Array.isArray(cart) ? cart : [];

  const getCartCount = () => safeCart.reduce((count, item) => count + Number(item.quantity || 0), 0);

  const subtotal = safeCart.reduce((total, item) => {
    const price = item.offer_price || item.price || item.sale_price || 0;
    return total + Number(price) * Number(item.quantity || 0);
  }, 0);

  const shippingCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + shippingCharge;

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        subtotal, 
        shippingCharge, 
        grandTotal, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        getCartCount,
        fetchCart,
        clearItemFromCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};