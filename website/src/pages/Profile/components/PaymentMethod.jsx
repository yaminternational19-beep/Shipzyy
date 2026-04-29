function PaymentMethod() {
  return (
    <>
      <h2>Payment Method</h2>

      <div className="payment-card">
        <p>Visa •••• 8047</p>
        <span className="delete">Delete</span>
      </div>

      <div className="form-group">
        <label>Card Holder Name *</label>
        <input placeholder="Ex. John Doe" />
      </div>

      <div className="form-group">
        <label>Card Number *</label>
        <input placeholder="4716 9627 1635 8047" />
      </div>

      <button className="primary-btn">Add Card</button>
    </>
  );
}

export default PaymentMethod;