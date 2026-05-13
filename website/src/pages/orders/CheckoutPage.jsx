import React, { useState, useEffect } from "react";
import { useCart } from "../../pages/cart/CartContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCheckoutDetails, placeOrder } from "../../utils/checkoutApi";
import { getProfileDetails } from "../../utils/profileApi";
import { addAddress } from "../../utils/addressApi";
import { FaArrowLeftLong } from "react-icons/fa6";

const CheckoutPage = () => {
  const { cart, subtotal, shippingCharge, grandTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("COD"); 
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [isLoadingBill, setIsLoadingBill] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const fetchAddresses = async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await getProfileDetails();
      if (res && res.success && res.data.addresses) {
        const fetchedAddresses = res.data.addresses;
        setAddresses(fetchedAddresses);
        
        const defaultAddr = fetchedAddresses.find(a => a.is_default) || fetchedAddresses[0];
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      }
    } catch (error) {
      toast.error("Failed to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!cart.length || !selectedAddress) return;

    const fetchBill = async () => {
      setIsLoadingBill(true);
      try {
        const res = await getCheckoutDetails(selectedAddress, appliedCoupon);
        if (res && res.success) {
          setBillDetails(res.data);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to calculate bill.");
        setAppliedCoupon(null); 
      } finally {
        setIsLoadingBill(false);
      }
    };

    const timer = setTimeout(() => fetchBill(), 300);
    return () => clearTimeout(timer);
  }, [selectedAddress, appliedCoupon, cart.length]);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return toast.warning("Enter a valid coupon!");
    setAppliedCoupon(couponInput.trim().toUpperCase());
  };

  const handleApplyFromList = (code) => {
    setCouponInput(code);
    setAppliedCoupon(code);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    const form = e.target;
    
    const newAddressData = {
      address_name: form.address_name.value,
      contact_person_name: form.contact_person_name.value,
      contact_phone: form.contact_phone.value,
      address_line_1: form.address_line_1.value,
      address_line_2: form.address_line_2.value || "",
      landmark: form.landmark.value || "",
      city: form.city.value,
      state: form.state.value,
      pincode: form.pincode.value,
      is_default: false,
      country: "India"
    };

    try {
      setIsAddingAddress(true);
      const res = await addAddress(newAddressData);
      if (res.success) {
        toast.success("Address Added Successfully");
        setShowNewAddress(false);
        form.reset();
        await fetchAddresses();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add address");
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!cart.length) return toast.error("Cart is empty");
    if (!selectedAddress) return toast.error("Select a delivery address");
    if (!paymentMethod) return toast.error("Select a payment method");

    try {
      setIsPlacingOrder(true);
      const orderData = {
        address_id: selectedAddress,
        payment_method: paymentMethod.toUpperCase(), 
        coupon_code: appliedCoupon 
      };

      const res = await placeOrder(orderData);
      
      if (res && res.success) {
        clearCart();        
        navigate("/order-success", { state: { orderId: res.data?.order_number || res.data?.id } }); 
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to place order.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const eligibleCoupons = billDetails?.eligible_coupons || [];
  const orderSummary = billDetails?.order_summary || {};
  const displaySubtotal = orderSummary.subtotal || subtotal;
  const displayDelivery = orderSummary.delivery_charges || shippingCharge || 0;
  const displayDiscount = orderSummary.discount || 0;
  const finalTotal = orderSummary.total || grandTotal;

  return (
    <div className="min-h-screen py-10 px-4 md:px-6">
      <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-8">
        
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3 bg-white hover:bg-slate-50 px-5 py-2.5 rounded-full border border-slate-200 text-slate-800 transition-all font-black shadow-sm"
          >
            <FaArrowLeftLong className="group-hover:-translate-x-2 transition-transform"/> 
            Back
          </button>
        </div>

        <header>
          <h1 className="text-3xl font-black text-white tracking-tight">Secure Checkout</h1>
          <p className="text-slate-300 font-bold mt-1 uppercase tracking-widest text-xs">Review your details to complete the order</p>
        </header>

        <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-black text-sm shadow-sm">
              📍
            </div>
            <h2 className="text-xl font-black text-slate-800">Delivery Address</h2>
          </div>

          {isLoadingAddresses ? (
            <div className="py-10 text-center text-slate-400 font-bold animate-pulse">Loading addresses...</div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide">
              {addresses.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => setSelectedAddress(loc.id)}
                  className={`shrink-0 w-[240px] sm:w-[260px] snap-start p-4 border-2 rounded-2xl cursor-pointer transition-all relative ${selectedAddress === loc.id ? "border-cyan-600 bg-cyan-50 shadow-md" : "border-slate-100 hover:border-cyan-300 hover:bg-slate-50"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-slate-800 flex items-center gap-2">
                      {loc.address_name} {loc.is_default && <span className="text-[9px] bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">Default</span>}
                      {selectedAddress === loc.id && <span className="w-2.5 h-2.5 bg-cyan-600 rounded-full inline-block absolute top-5 right-4"></span>}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 font-bold mb-1 line-clamp-1">{loc.contact_person_name} • {loc.contact_phone}</p>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {loc.address_line_1}, {loc.address_line_2 && loc.address_line_2 + ","} {loc.city}, {loc.state}
                  </p>
                  <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">{loc.pincode}</span>
                </div>
              ))}

              <div
                className="shrink-0 w-[240px] sm:w-[260px] snap-start p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all flex flex-col items-center justify-center text-slate-500 hover:text-cyan-700 min-h-[130px]"
                onClick={() => setShowNewAddress(!showNewAddress)}
              >
                <span className="text-2xl font-light mb-1">{showNewAddress ? "-" : "+"}</span>
                <span className="font-bold text-sm uppercase tracking-widest">{showNewAddress ? "Cancel" : "Add New Address"}</span>
              </div>
            </div>
          )}

          {showNewAddress && (
            <form className="mt-2 p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2" onSubmit={handleAddAddress}>
              <h3 className="font-black mb-4 text-slate-800">Add New Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Label (Home/Office)</label>
                  <input name="address_name" placeholder="e.g. Home" required className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Full Name</label>
                  <input name="contact_person_name" placeholder="Receiver's Name" required className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Phone Number</label>
                  <input name="contact_phone" placeholder="10-digit mobile" required maxLength="10" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Pincode</label>
                  <input name="pincode" placeholder="ZIP Code" required maxLength="6" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Address Line 1</label>
                <input name="address_line_1" placeholder="House No, Building Name" required className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <input name="address_line_2" placeholder="Area / Street (Opt)" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                <input name="landmark" placeholder="Landmark (Opt)" className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                <div className="flex gap-2">
                  <input name="city" placeholder="City" required className="w-1/2 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                  <input name="state" placeholder="State" required className="w-1/2 p-4 rounded-xl border border-slate-200 focus:outline-none focus:border-cyan-500 font-medium" />
                </div>
              </div>

              <button type="submit" disabled={isAddingAddress} className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-md disabled:opacity-50">
                {isAddingAddress ? "Saving..." : "Save Address"}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-black text-sm shadow-sm">
              🎟️
            </div>
            <h2 className="text-xl font-black text-slate-800">Coupons & Offers</h2>
          </div>
          
          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="text-emerald-500 text-xl">🎉</span>
                <span className="text-emerald-800 font-black text-sm uppercase tracking-widest">{appliedCoupon} Applied</span>
              </div>
              <button onClick={handleRemoveCoupon} className="bg-rose-500 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-colors">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-cyan-500 transition-colors">
                <input
                  type="text"
                  placeholder="Enter Promo Code"
                  className="flex-1 bg-transparent border-none outline-none px-4 py-3 font-black text-slate-800 uppercase placeholder-slate-400"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  disabled={isLoadingBill}
                />
                <button 
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50" 
                  onClick={handleApplyCoupon}
                  disabled={isLoadingBill || !couponInput.trim()}
                >
                  Apply
                </button>
              </div>

              {eligibleCoupons.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Available Coupons</p>
                  <div className="flex overflow-x-auto gap-5 pb-4 snap-x scrollbar-hide">
                    {eligibleCoupons.map((coupon, idx) => (
                      <div key={idx} className="shrink-0 w-[260px] snap-start border border-slate-200 bg-white rounded-[20px] shadow-sm flex flex-col relative overflow-hidden group hover:border-cyan-400 hover:shadow-md transition-all">
                        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-dashed border-cyan-200 relative">
                          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-white rounded-full border border-slate-200 z-10"></div>
                          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-white rounded-full border border-slate-200 z-10"></div>
                          
                          <div className="flex justify-between items-center">
                            <span className="bg-white text-cyan-800 font-black px-3 py-1.5 rounded-lg text-[11px] uppercase tracking-widest shadow-sm border border-cyan-100">
                              {coupon.code}
                            </span>
                            {coupon.expiry_date && <span className="text-[9px] font-black text-slate-400 bg-white/50 px-2 py-1 rounded-md uppercase">Exp: {coupon.expiry_date}</span>}
                          </div>
                        </div>
                        
                        <div className="p-4 flex flex-col flex-1 bg-white relative">
                          <div className="absolute -top-3 -left-3 w-6 h-6 bg-white rounded-full z-20"></div>
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-white rounded-full z-20"></div>
                          
                          <h4 className="font-black text-slate-800 text-sm mb-1 mt-1">{coupon.title}</h4>
                          <p className="text-[11px] font-bold text-slate-400 line-clamp-2 mb-4">{coupon.description}</p>
                          
                          <button 
                            onClick={() => handleApplyFromList(coupon.code)}
                            className="mt-auto w-full bg-slate-100 text-slate-800 font-black text-[11px] uppercase tracking-widest py-3 rounded-xl group-hover:bg-cyan-600 group-hover:text-white transition-colors"
                          >
                            Tap to Apply
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-black text-sm shadow-sm">
              💳
            </div>
            <h2 className="text-xl font-black text-slate-800">Payment Method</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div
              className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-3 cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-cyan-600 bg-cyan-50 text-cyan-800 shadow-md" : "border-slate-100 hover:border-cyan-300 text-slate-500 hover:bg-slate-50"}`}
              onClick={() => setPaymentMethod("CARD")}
            >
              <span className="text-3xl">💳</span>
              <span className="font-bold text-xs uppercase tracking-widest">Card</span>
            </div>
            <div
              className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-3 cursor-pointer transition-all ${paymentMethod === "UPI" ? "border-cyan-600 bg-cyan-50 text-cyan-800 shadow-md" : "border-slate-100 hover:border-cyan-300 text-slate-500 hover:bg-slate-50"}`}
              onClick={() => setPaymentMethod("UPI")}
            >
              <span className="text-3xl">📱</span>
              <span className="font-bold text-xs uppercase tracking-widest">UPI</span>
            </div>
            <div
              className={`p-5 border-2 rounded-2xl flex flex-col items-center gap-3 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-cyan-600 bg-cyan-50 text-cyan-800 shadow-md" : "border-slate-100 hover:border-cyan-300 text-slate-500 hover:bg-slate-50"}`}
              onClick={() => setPaymentMethod("COD")}
            >
              <span className="text-3xl">💵</span>
              <span className="font-bold text-xs uppercase tracking-widest text-center">Cash On Delivery</span>
            </div>
          </div>

          {paymentMethod === "CARD" && (
            <div className="space-y-4 animate-in fade-in bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <input placeholder="Card Number" className="w-full p-4 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none font-bold" />
              <div className="flex gap-4">
                <input placeholder="MM/YY" className="w-1/2 p-4 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none font-bold" />
                <input type="password" placeholder="CVV" className="w-1/2 p-4 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none font-bold" />
              </div>
            </div>
          )}

          {paymentMethod === "UPI" && (
            <div className="animate-in fade-in bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <input placeholder="Enter UPI ID (eg. name@bank)" className="w-full p-4 rounded-xl border border-slate-200 focus:border-cyan-500 outline-none font-bold" />
            </div>
          )}

          {paymentMethod === "COD" && (
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl text-amber-800 font-medium animate-in fade-in">
              <strong className="font-black text-amber-900">Pay on Delivery!</strong> You can pay via Cash or UPI when the package arrives at your doorstep.
            </div>
          )}
        </div>

        <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-900 p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <h2 className="text-2xl font-black relative z-10">Order Summary</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1 relative z-10">Review your final details</p>
          </div>

          <div className="p-6 md:p-8">
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {cart.map((item) => {
                const itemPrice = Number(item.offer_price || item.sale_price || item.price || item.mrp || 0);
                const itemQty = Number(item.quantity || 1);
                const itemTotal = (itemPrice * itemQty).toFixed(0);

                return (
                  <div key={item.id} className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 border border-slate-100 shrink-0">
                        <img src={item.product_image || item.image || "https://via.placeholder.com/80?text=No+Image"} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{item.name}</span>
                        <span className="text-slate-500 text-xs font-black mt-0.5">Qty: {itemQty}</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 ml-4 shrink-0">₹{itemTotal}</span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-4 mb-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              {isLoadingBill ? (
                <div className="py-4 text-center text-slate-400 font-bold animate-pulse text-sm">Calculating final amounts...</div>
              ) : (
                <>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Item Total</span>
                    <span className="text-slate-800">₹{displaySubtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <span>Delivery Charge</span>
                    <span className={displayDelivery === 0 ? "text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md" : "text-slate-800"}>
                      {displayDelivery === 0 ? "FREE" : `₹${displayDelivery}`}
                    </span>
                  </div>
                  
                  {displayDiscount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600 bg-emerald-50 p-2 -mx-2 rounded-lg">
                      <span>Discount</span>
                      <span>- ₹{displayDiscount}</span>
                    </div>
                  )}

                  <div className="border-t-2 border-dashed border-slate-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-slate-800 uppercase tracking-widest">Grand Total</span>
                      <span className="text-3xl font-black text-cyan-700">₹{finalTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              disabled={!cart.length || isPlacingOrder || isLoadingBill || !selectedAddress}
              onClick={handlePlaceOrder}
              className="w-full py-5 bg-yellow-400 text-yellow-900 rounded-2xl flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl shadow-yellow-400/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 px-6"
            >
              <span className="font-black text-sm md:text-base uppercase tracking-widest">
                {isPlacingOrder ? "Processing..." : "Place Order Securely"}
              </span>
              <span className="bg-white/30 px-4 py-2 rounded-xl font-black text-lg md:text-xl shadow-inner">
                ₹{finalTotal}
              </span>
            </button>

            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 256-bit Encrypted Checkout
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;