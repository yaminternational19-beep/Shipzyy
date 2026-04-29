import React, { useEffect } from "react";
import { useOrders } from "../../pages/cart/OrdersContext"; // Update path if needed
import "./myOrders.css";

const MyOrdersPage = () => {
  const { orders, updateOrders } = useOrders();

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = orders.map((order) => {
        const diff = (new Date() - new Date(order.createdAt)) / 1000;
        if (diff > 120 && order.status === "Placed") return { ...order, status: "Shipped" };
        if (diff > 240 && order.status === "Shipped") return { ...order, status: "Delivered" };
        return order;
      });
      updateOrders(updated);
    }, 5000);
    return () => clearInterval(interval);
  }, [orders, updateOrders]);

  const activeOrders = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  const historyOrders = orders.filter((o) => o.status === "Delivered" || o.status === "Cancelled");

  const getStatusColor = (status) => {
    switch (status) {
      case "Placed": return "status-placed";
      case "Shipped": return "status-shipped";
      case "Out for Delivery": return "status-out-for-delivery";
      case "Delivered": return "status-delivered";
      case "Cancelled": return "status-cancelled";
      default: return "";
    }
  };

  const renderOrderCard = (order, isActive) => (
    <div key={order.id} className="premium-order-card">
      <div className="order-card-header">
        <div className="order-id-block">
          <span className="order-label">Order ID</span>
          <span className="order-id">#{order.id.replace('ORD', '')}</span>
        </div>
        <div className={`order-status-pill ${getStatusColor(order.status)}`}>
          <span className="status-dot"></span>
          {order.status}
        </div>
      </div>

      {/* Render Product Images directly in the card */}
      {order.items && order.items.length > 0 && (
        <div className="order-items-preview">
          <div className="order-item-images">
            {order.items.slice(0, 4).map((item, idx) => (
              <div key={idx} className="product-img-wrapper">
                <img src={`/product/${item.image}`} alt={item.name} title={item.name} />
              </div>
            ))}
            {order.items.length > 4 && (
              <div className="product-img-wrapper extra-count">
                +{order.items.length - 4}
              </div>
            )}
          </div>
          <div className="order-items-names">
            {order.items.map(item => item.name).join(" • ")}
          </div>
        </div>
      )}

      <div className="order-card-body">
        <div className="order-amount">
          <span className="amount-label">Total Amount</span>
          <span className="amount-value">₹{order.total}</span>
        </div>
        <div className="order-date">
          <span className="date-label">Date</span>
          <span className="date-value">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {isActive && (
        <div className="order-progress-bar">
          <div className={`progress-fill ${getStatusColor(order.status)}`}></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="orders-dashboard container">
      <div className="orders-header">
        <h1 className="orders-title">My Orders</h1>
        <p className="orders-subtitle">Track and manage your recent purchases</p>
      </div>

      <div className="orders-sections-container">
        
        {/* ROW 1: ACTIVE ORDERS */}
        <section className="order-section active-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Active Orders</h2>
            <span className="count-badge">{activeOrders.length}</span>
          </div>
          
          <div className="orders-list">
            {activeOrders.length === 0 ? (
              <div className="empty-orders-state">
                <p>No active orders right now.</p>
              </div>
            ) : (
              activeOrders.map(order => renderOrderCard(order, true))
            )}
          </div>
        </section>

        {/* ROW 2: ORDER HISTORY */}
        <section className="order-section history-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Order History</h2>
            <span className="count-badge history">{historyOrders.length}</span>
          </div>
          
          <div className="orders-list">
            {historyOrders.length === 0 ? (
              <div className="empty-orders-state">
                <p>Your past orders will appear here.</p>
              </div>
            ) : (
              historyOrders.map(order => renderOrderCard(order, false))
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default MyOrdersPage;