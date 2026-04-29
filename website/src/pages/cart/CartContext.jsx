import React, { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "../../context/AuthContext"; 

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth(); 

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    if (!isLoggedIn) {
      setCart([]);
      localStorage.removeItem("cart");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const qtyToAdd = product.quantity ? Number(product.quantity) : 1; 

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: qtyToAdd }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.id === productId);
      if (item && item.quantity > 1) {
        return prevCart.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter((i) => i.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const getCartCount = () => cart.reduce((count, item) => count + item.quantity, 0);

  const subtotal = cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
  const shippingCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const grandTotal = subtotal + shippingCharge;

  return (
    <CartContext.Provider
      value={{ cart, subtotal, shippingCharge, grandTotal, addToCart, removeFromCart, clearCart, getCartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};