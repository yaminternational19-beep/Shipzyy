import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || "ORD" + Math.floor(Math.random() * 90000);

  return (
    <div className="order-success-page">
      <div className="success-glow-bg"></div>
      <div className="success-card premium-glass-card">
        
        <div className="tick-wrapper">
          <svg className="animated-check" viewBox="0 0 24 24">
            <circle className="check-circle" cx="12" cy="12" r="10" />
            <path className="check-path" d="M8 12.5l3 3 5-6" />
          </svg>
        </div>
        
        <h1 className="success-title text-gradient">Payment Successful!</h1>
        <p className="success-subtitle">Hooray! Your order is confirmed and being prepared.</p>
        
        <div className="order-details-box dark-glass-box">
          <div className="detail-row">
            <span>Order ID</span>
            <strong>#{orderId}</strong>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <span className="status-badge pulse-green">Confirmed</span>
          </div>
        </div>

        <div className="success-actions">
          <Link to="/orders" className="primary-btn">Track My Order</Link>
          <Link to="/shop" className="secondary-btn">← Back to Shopping</Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;