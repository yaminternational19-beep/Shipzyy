function Wallet() {
  return (
    <div className="wallet-section">
      <h2 className="section-title">My Wallet</h2>
      <div className="wallet-card">
        <div>
          <p>Available Balance</p>
          <h3>₹1,250.00</h3>
        </div>
        <button className="outline-btn">Add Money</button>
      </div>
      
      <h4 style={{ marginTop: "30px", marginBottom: "15px", color: "var(--text-main)" }}>Recent Transactions</h4>
      <div className="transaction-list">
        <div className="transaction-item">
          <div>
            <strong>Added to Wallet</strong>
            <p>12 Feb 2026, 10:30 AM</p>
          </div>
          <span className="success">+ ₹500</span>
        </div>
        <div className="transaction-item">
          <div>
            <strong>Order #ORD1024</strong>
            <p>10 Feb 2026, 04:15 PM</p>
          </div>
          <span className="danger">- ₹850</span>
        </div>
      </div>
    </div>
  );
}

export default Wallet;