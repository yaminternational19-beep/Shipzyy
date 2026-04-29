import React, { useMemo } from "react";
import { useOrders } from "../../pages/cart/OrdersContext";
import "./orderHistory.css";

const ACTIVE_STATUSES = ["Placed", "Shipped", "Out for Delivery"];
const HISTORY_STATUSES = ["Delivered", "Cancelled"];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);

const OrderHistory = () => {
  const { orders = [], loading } = useOrders();

  const { activeOrders, historyOrders } = useMemo(() => {
    const active = [];
    const history = [];

    orders.forEach((order) => {
      if (ACTIVE_STATUSES.includes(order.status)) {
        active.push(order);
      } else if (HISTORY_STATUSES.includes(order.status)) {
        history.push(order);
      }
    });

    return { activeOrders: active, historyOrders: history };
  }, [orders]);

  if (loading) {
    return <div className="loader-box">Loading your orders...</div>;
  }

  const renderCleanRow = (order) => {
    const { id, createdAt, status, items = [], total } = order;
    const statusClass = status.toLowerCase().replace(/\s+/g, "-");
    
    const firstItem = items[0];
    const extraItemsCount = items.length - 1;
    const itemsText = extraItemsCount > 0 
      ? `${firstItem?.name} & ${extraItemsCount} more item${extraItemsCount > 1 ? 's' : ''}`
      : firstItem?.name;

    return (
      <div className="clean-order-row" key={id}>
        
        {/* Column 1: Order ID & Date */}
        <div className="col-info">
          <span className="clean-id">#{id.replace('ORD', '')}</span>
          <span className="clean-date">
            {new Date(createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Column 2: 1 Image + Clean Text */}
        <div className="col-items">
          <div className="clean-img-box">
            <img src={`/product/${firstItem?.image}`} alt={firstItem?.name} loading="lazy" />
          </div>
          <span className="clean-item-text" title={items.map(i => i.name).join(", ")}>
            {itemsText}
          </span>
        </div>

        {/* Column 3: Status Pill */}
        <div className="col-status">
          <span className={`clean-pill ${statusClass}`}>{status}</span>
        </div>

        {/* Column 4: Total Amount */}
        <div className="col-total">
          <span className="clean-amount">{formatCurrency(total)}</span>
        </div>

      </div>
    );
  };

  return (
    <div className="orders-page container">
      <div className="orders-header-wrapper">
        <h1 className="page-main-title">My Orders</h1>
      </div>

      <div className="orders-grid-clean">
        
        {/* ACTIVE ORDERS */}
        <div className="orders-section">
          <div className="section-header-clean">
            <h2>Active Orders</h2>
            <span className="badge-count">{activeOrders.length}</span>
          </div>
          
          <div className="orders-list-wrapper">
            {activeOrders.length === 0 ? (
              <div className="empty-clean">No active orders right now.</div>
            ) : (
              activeOrders.map(renderCleanRow)
            )}
          </div>
        </div>

        {/* ORDER HISTORY */}
        <div className="orders-section">
          <div className="section-header-clean">
            <h2>Order History</h2>
            <span className="badge-count history">{historyOrders.length}</span>
          </div>

          <div className="orders-list-wrapper">
            {historyOrders.length === 0 ? (
              <div className="empty-clean">Your past orders will appear here.</div>
            ) : (
              historyOrders.map(renderCleanRow)
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderHistory;