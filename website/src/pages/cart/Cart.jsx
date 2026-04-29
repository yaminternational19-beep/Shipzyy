import React from "react";
import { useCart } from "./CartContext";
import "./cart.css";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <>
      {/* 1. Dark Background Overlay (Clicks outside close the cart) */}
      <div 
        className={`cart-overlay ${isCartOpen ? "open" : ""}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* 2. The Sliding Drawer */}
      <div className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        
        {/* Drawer Header */}
        <div className="cart-header">
          <h2>My Cart <span>({getCartCount()} items)</span></h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>

        {/* Drawer Body (Scrollable items) */}
        <div className="cart-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <span className="empty-icon">🛒</span>
              <h3>Your cart is empty</h3>
              <p>Add some items to get started!</p>
              <button className="start-shopping-btn" onClick={() => setIsCartOpen(false)}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map((item) => (
                <div key={item.id} className="drawer-cart-item">
                  <div className="drawer-item-img">
                    <img 
                      src={`/product/${item.image}`} 
                      alt={item.name} 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=No+Img"; }}
                    />
                  </div>
                  <div className="drawer-item-info">
                    <h4>{item.name}</h4>
                    <p className="drawer-item-price">₹{item.price}</p>
                    <div className="drawer-quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="drawer-item-actions">
                    <p className="drawer-item-total">₹{item.price * item.quantity}</p>
                    <button className="drawer-remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer (Fixed at bottom) */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="footer-row">
              <span>Delivery</span>
              <span className="free-text">{getCartTotal() > 500 ? "FREE" : "₹50"}</span>
            </div>
            <div className="footer-row grand-total">
              <span>Grand Total</span>
              <span>₹{getCartTotal() > 500 ? getCartTotal() : getCartTotal() + 50}</span>
            </div>
            <button className="checkout-btn">
              Proceed to Checkout
            </button>
          </div>
        )}
        
      </div>
    </>
  );
};

export default Cart;