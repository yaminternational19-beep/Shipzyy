function MyOrders() {
  return (
    <>
      <h2>Orders (2)</h2>

      <div className="order-card">
        <div className="order-header">
          <span>#SDGT1254FD</span>
          <span>$74.00</span>
          <span>Paypal</span>
          <span>29 July 2024</span>
        </div>

        <div className="order-body">
          <p>Fresh Oranges - 500g x 4</p>
          <p>Red Onion - 500g x 2</p>
          <p>Fresh Yellow Lemon - 500g x 1</p>
          <p>Pomegranate - 500g x 2</p>
        </div>

        <div className="order-actions">
          <button className="green-btn">Track Order</button>
          <button className="outline-btn">Invoice</button>
          <span className="cancel">Cancel Order</span>
        </div>
      </div>
    </>
  );
}

export default MyOrders;