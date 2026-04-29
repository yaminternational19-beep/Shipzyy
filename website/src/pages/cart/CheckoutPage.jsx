import React, { useState } from "react";
import { useCart } from "../../pages/cart/CartContext";
import { useNavigate } from "react-router-dom";
import userData from "../../data/mockData.json";
import { toast } from "react-toastify";
import { useOrders } from "./OrdersContext";
import "./checkoutPage.css";

const CheckoutPage = () => {
  const { cart, subtotal, shippingCharge, grandTotal, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [selectedAddress, setSelectedAddress] =
    useState(userData.locations[0]?.id);

  const [addresses, setAddresses] = useState(userData.locations);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // Add Address
  const handleAddAddress = (e) => {
    e.preventDefault();
    const form = e.target;

    const newAddress = {
      id: Date.now(),
      label: form.label.value,
      address: form.address.value,
      zip: form.zip.value,
    };

    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress.id);
    setShowNewAddress(false);
    form.reset();

    toast.success("Address Added Successfully");
  };

  // Place Order
  const handlePlaceOrder = () => {
    if (!cart.length) {
      toast.error("Cart is empty", { position: "top-center" });
      return;
    }

    const newOrder = {
      id: `ORD${Math.floor(Math.random() * 100000)}`,
      items: cart,
      total: grandTotal,
      paymentMethod,
      status: "Placed",
      createdAt: new Date().toISOString(),
    };

    addOrder(newOrder); 
    clearCart();        

    toast.success("Order Placed Successfully 🎉", {
      position: "top-center",
      autoClose: 2000, 
      hideProgressBar: false,
      closeOnClick: true,
    });

    navigate("/order-success", { state: { orderId: newOrder.id } });
  };
  return (
    <div className="checkout-page-root">
      <div className="checkout-max-width">

        {/* ================= LEFT SIDE (Accordion) ================= */}
        <main>
          <header className="checkout-header-main">
            <h1>Secure Checkout</h1>
            <p className="checkout-subtitle">Complete your order in 2 simple steps</p>
          </header>

          <section className="checkout-accordion-container">
            {/* ================= STEP 1 ACCORDION ================= */}
            <div className={`accordion-step ${step === 1 ? "active" : "completed"}`}>
              <div
                className="accordion-header"
                onClick={() => step > 1 && setStep(1)}
              >
                <div className="step-indicator">
                  {step > 1 ? "✓" : "1"}
                </div>
                <h2>Delivery Address</h2>
                {step > 1 && (
                  <span className="edit-link">Edit</span>
                )}
              </div>

              {step === 1 && (
                <div className="accordion-content form-slide-in">
                  <div className="address-grid">
                    {addresses.map((loc) => (
                      <div
                        key={loc.id}
                        className={`address-card ${selectedAddress === loc.id ? "selected" : ""}`}
                        onClick={() => setSelectedAddress(loc.id)}
                      >
                        <div className="address-card-header">
                          <h4>{loc.label}</h4>
                          {selectedAddress === loc.id && <div className="selected-dot"></div>}
                        </div>
                        <p>{loc.address}</p>
                        <span>{loc.zip}</span>
                      </div>
                    ))}

                    <div
                      className="address-card add-new"
                      onClick={() => setShowNewAddress(true)}
                    >
                      <span className="add-icon">+</span>
                      <span>Add New Address</span>
                    </div>
                  </div>

                  {showNewAddress && (
                    <form className="new-address-form slide-down" onSubmit={handleAddAddress}>
                      <div className="input-group">
                        <label>Label</label>
                        <input name="label" placeholder="e.g. Home, Office" required />
                      </div>
                      <div className="input-group">
                        <label>Full Address</label>
                        <input name="address" placeholder="Enter full address" required />
                      </div>
                      <div className="input-group">
                        <label>Zip Code</label>
                        <input name="zip" placeholder="Enter ZIP code" required />
                      </div>
                      <button type="submit" className="save-address-btn">
                        Save Address
                      </button>
                    </form>
                  )}

                  <button
                    className="primary-action-btn"
                    disabled={!selectedAddress}
                    onClick={() => setStep(2)}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}
            </div>

            {/* ================= STEP 2 ACCORDION ================= */}
            <div className={`accordion-step ${step === 2 ? "active" : "locked"}`}>
              <div className="accordion-header">
                <div className="step-indicator">2</div>
                <h2>Payment Method</h2>
              </div>

              {step === 2 && (
                <div className="accordion-content form-slide-in">
                  {/* Payment Options */}
                  <div className="payment-methods-grid">
                    <div
                      className={`payment-option ${paymentMethod === "card" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("card")}
                    >
                      <span className="pay-icon">💳</span>
                      <span>Credit / Debit Card</span>
                    </div>

                    <div
                      className={`payment-option ${paymentMethod === "upi" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("upi")}
                    >
                      <span className="pay-icon">📱</span>
                      <span>UPI Payment</span>
                    </div>

                    <div
                      className={`payment-option ${paymentMethod === "cod" ? "active" : ""}`}
                      onClick={() => setPaymentMethod("cod")}
                    >
                      <span className="pay-icon">💵</span>
                      <span>Cash on Delivery</span>
                    </div>
                  </div>

                  {/* Card Form */}
                  {paymentMethod === "card" && (
                    <div className="payment-form">
                      <div className="card-preview-modern">
                        <div className="chip"></div>
                        <div className="card-number-display">**** **** **** ****</div>
                      </div>
                      <div className="input-group">
                        <label>Card Number</label>
                        <input placeholder="Enter 16 digit card number" />
                      </div>
                      <div className="input-grid">
                        <div className="input-group">
                          <label>Expiry</label>
                          <input placeholder="MM/YY" />
                        </div>
                        <div className="input-group">
                          <label>CVC</label>
                          <input type="password" placeholder="***" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* UPI */}
                  {paymentMethod === "upi" && (
                    <div className="payment-form">
                      <div className="input-group">
                        <label>UPI ID</label>
                        <input
                          className="upi-input"
                          placeholder="Example: username@okhdfc"
                        />
                      </div>
                    </div>
                  )}

                  {/* COD */}
                  {paymentMethod === "cod" && (
                    <div className="cod-alert-box">
                      <strong>Cash on Delivery selected.</strong> You will pay when the order arrives at your address.
                    </div>
                  )}

                  <button
                    className="primary-action-btn place-order"
                    disabled={!cart.length}
                    onClick={handlePlaceOrder}
                  >
                    <span className="btn-text">Pay ₹{grandTotal}</span>
                    <span className="btn-icon">🔒</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* ================= RIGHT SIDE (Sticky Order Summary) ================= */}
        <aside className="checkout-sidebar">
          <div className="invoice-container">
            <h2 className="invoice-title">Order Summary</h2>

            {cart.map((item) => (
              <div key={item.id} className="invoice-row">
                <span className="qty">{item.quantity}x</span>
                <span className="name">{item.name}</span>
                <span className="price">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}

            <div className="invoice-footer">
              <div className="summary-line">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div className="summary-line">
                <span>Shipping</span>
                <span>
                  {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                </span>
              </div>

              <div className="summary-line total">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>

              <p className="secure-badge">
                🔒 Fully Encrypted Checkout
              </p>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
};

export default CheckoutPage;