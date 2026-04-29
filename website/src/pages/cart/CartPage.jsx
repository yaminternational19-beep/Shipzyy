import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../pages/cart/CartContext";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import "./cartPage.css";

const CartPage = () => {
  const {
    cart,
    addToCart,
    removeFromCart,
    clearItemFromCart,
    clearCart,
  } = useCart();

  const navigate = useNavigate();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  
  const [tipAmount, setTipAmount] = useState(0);

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const deliveryFee = subtotal > 999 || subtotal === 0 ? 0 : 60;
  const platformFee = subtotal > 0 ? 15 : 0; 
  const gst = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% GST
  
  const grandTotal = subtotal + deliveryFee + platformFee + gst + tipAmount - discount;

  const handleApplyCoupon = () => {
    if (coupon.toUpperCase() === "SAVE10") {
      const discountValue = subtotal * 0.1;
      setDiscount(discountValue);
      setCouponMessage("Coupon Applied 🎉 You saved 10%");
    } else {
      setDiscount(0);
      setCouponMessage("Invalid Coupon Code");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="empty-cart-wrapper">
        <div className="empty-cart-card">
          <div className="empty-icon-big">🛍️</div>
          <h1>Your Cart is Empty</h1>
          <p>Looks like you haven’t added anything yet. Start shopping and fill your bag with amazing products.</p>
          <Link to="/shop" className="empty-btn">Start Shopping</Link>
          <div className="empty-suggestions">
            <span>🔥 Trending Products</span>
            <span>🥬 Fresh Groceries</span>
            <span>⚡ Fast Delivery</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-grid">

        {/* LEFT SIDE */}
        <div className="cart-items">
          <div className="cart-header">
            <h1 className="cart-title">
              Shopping Cart <span>{cart.length}</span>
            </h1>
            <button className="clear-cart-btn" onClick={clearCart}>
              Clear Cart
            </button>
          </div>

          {cart.map((item) => (
            <div className="cart-card" key={item.id}>
              <div className="cart-img-wrapper">
                <img src={`/product/${item.image}`} alt={item.name} />
              </div>

              <div className="cart-item-details">
                <p className="category">{item.category}</p>
                <h3>{item.name}</h3>
              </div>

              <div className="cart-item-price">₹{item.price}</div>

              <div className="qty-control">
                <button onClick={() => removeFromCart(item.id)}>
                  <RemoveIcon fontSize="small" />
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart({ ...item, quantity: 1 })}>
                  <AddIcon fontSize="small" />
                </button>
              </div>

              <div className="cart-item-total">
                ₹{item.price * item.quantity}
              </div>

              <button className="delete-btn" onClick={() => clearItemFromCart(item.id)}>
                <DeleteOutlineIcon />
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <aside className="cart-summary">
          <h2>Order Summary</h2>

          {/* FREE SHIPPING PROGRESS */}
          <div className="shipping-progress">
            <div style={{ width: `${Math.min((subtotal / 1000) * 100, 100)}%` }} />
          </div>
          <p className="shipping-text">
            {subtotal < 1000
              ? `Add ₹${1000 - subtotal} more for FREE delivery 🚚`
              : "You unlocked FREE Delivery 🎉"}
          </p>

          {/* COUPON */}
          <div className="coupon-box">
            <LocalOfferIcon />
            <input
              type="text"
              placeholder="Enter Coupon (SAVE10)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
            <button onClick={handleApplyCoupon}>Apply</button>
          </div>

          {couponMessage && (
            <p className={`coupon-msg ${discount > 0 ? "success" : "error"}`}>
              {couponMessage}
            </p>
          )}

          {/* 🔥 NAYA TIP SECTION 🔥 */}
          <div className="tip-section">
            <h4>Support your delivery partner</h4>
            <div className="tip-options">
              {[10, 20, 30, 50].map((amt) => (
                <button
                  key={amt}
                  className={`tip-btn ${tipAmount === amt ? "active" : ""}`}
                  onClick={() => setTipAmount(tipAmount === amt ? 0 : amt)}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          {/* DETAILED SUMMARY ROWS */}
          <div className="summary-details-box">
            <div className="summary-row">
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="summary-row small">
              <span>Handling & Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>

            <div className="summary-row small">
              <span>Taxes & GST</span>
              <span>₹{gst}</span>
            </div>

            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>

            {tipAmount > 0 && (
              <div className="summary-row tip-row">
                <span>Delivery Partner Tip</span>
                <span>₹{tipAmount}</span>
              </div>
            )}

            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount Applied</span>
                <span>- ₹{discount.toFixed(0)}</span>
              </div>
            )}
          </div>

          <div className="summary-total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(0)}</span>
          </div>

          <button className="checkout-btn" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>

          <div className="trust-badges">
            <span>✔ Secure Payments</span>
            <span>✔ 7-Day Easy Returns</span>
            <span>✔ 100% Fresh Products</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;