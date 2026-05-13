import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../pages/cart/CartContext";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { encodeId } from "../../utils/crypto";
import { getCheckoutDetails } from "../../utils/checkoutApi";
import { getProfileDetails } from "../../utils/profileApi";
import { toast } from "react-toastify";

const CartPage = () => {
  const { cart, addToCart, removeFromCart, clearItemFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [tipAmount, setTipAmount] = useState(0);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [billDetails, setBillDetails] = useState(null);
  const [isLoadingBill, setIsLoadingBill] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, item: null });

  const fallbackSubtotal = useMemo(
    () => cart.reduce((total, item) => {
      const price = Number(item.offer_price || item.sale_price || item.price || 0);
      return total + price * item.quantity;
    }, 0),
    [cart]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAddress = async () => {
      try {
        const res = await getProfileDetails();
        if (res?.success && res.data?.addresses?.length > 0) {
          const defaultAddr = res.data.addresses.find(a => a.is_default) || res.data.addresses[0];
          setDefaultAddressId(defaultAddr.id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAddress();
  }, []);

  useEffect(() => {
    if (cart.length === 0) return;

    const fetchBill = async () => {
      setIsLoadingBill(true);
      try {
        const res = await getCheckoutDetails(defaultAddressId, null);
        if (res?.success) {
          setBillDetails(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingBill(false);
      }
    };

    const timer = setTimeout(() => {
      fetchBill();
    }, 500);

    return () => clearTimeout(timer);
  }, [cart, defaultAddressId]);

  const handleRemoveClick = (item) => {
    setConfirmModal({ isOpen: true, type: 'single', item });
  };

  const handleClearAllClick = () => {
    setConfirmModal({ isOpen: true, type: 'all', item: null });
  };

  const closeModal = () => {
    setConfirmModal({ isOpen: false, type: null, item: null });
  };

  const executeAction = () => {
    if (confirmModal.type === 'single') {
      clearItemFromCart(confirmModal.item.id);
      toast.success("Item removed from cart");
    } else if (confirmModal.type === 'all') {
      clearCart();
      toast.success("Cart cleared");
    }
    closeModal();
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-[75vh] flex justify-center items-center p-5 lg:p-10">
        <div className="p-12 md:p-16 rounded-[30px] text-center max-w-[600px] w-full shadow-lg bg-white border border-slate-100">
          <span className="text-[70px] block mb-5">🛍️</span>
          <h1 className="text-3xl font-black mb-4 text-slate-800">Your Cart is Empty</h1>
          <p className="text-base text-slate-500 mb-8">
            Looks like you haven't added anything yet. Start shopping and fill your bag with amazing products.
          </p>
          <Link 
            to="/" 
            className="inline-block py-4 px-10 rounded-full bg-slate-900 text-white font-bold transition-transform hover:scale-105 shadow-md uppercase tracking-widest text-sm"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const orderSummary = billDetails?.order_summary || {};
  const displaySubtotal = orderSummary.subtotal || fallbackSubtotal;
  const displayDelivery = orderSummary.delivery_charges || 0;
  const grandTotal = (orderSummary.total || fallbackSubtotal) + tipAmount;

  return (
    <div className="py-10 md:py-16 px-4 md:px-6 min-h-screen relative">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <section className="lg:col-span-7 xl:col-span-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
                Shopping Cart 
                <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-lg font-black shadow-sm">
                  {cart.length}
                </span>
              </h1>
              <div className="flex justify-end">
                <button 
                  className="group flex items-center gap-2 text-rose-500 font-black bg-rose-50 hover:bg-rose-500 hover:text-white px-5 py-2.5 rounded-xl border border-rose-100 transition-all duration-300 text-xs uppercase tracking-widest shadow-sm active:scale-95" 
                  onClick={handleClearAllClick}
                >
                  <DeleteOutlineIcon fontSize="small" className="group-hover:scale-110 transition-transform" />
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {cart.map((item) => {
                const itemPrice = Number(item.offer_price || item.sale_price || item.price || 0).toFixed(0); 
                const itemImage = item.product_image || item.image || "https://via.placeholder.com/80?text=No+Image";
                
                const handleProductClick = () => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  const maskedKey = encodeId(item.id); 
                  navigate(`/product/${maskedKey}`); 
                };

                return (
                  <div className="flex flex-wrap md:flex-nowrap items-center bg-white p-4 md:p-5 rounded-[24px] shadow-sm border border-slate-100 transition-all hover:shadow-md" key={item.id}>
                    
                    <div onClick={handleProductClick} className="w-[80px] h-[80px] bg-slate-50 border border-slate-100 rounded-2xl p-2 mr-4 shrink-0 cursor-pointer">
                      <img src={itemImage} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>

                    <div onClick={handleProductClick} className="flex-1 min-w-[150px] mr-4 cursor-pointer"> 
                      <h3 className="text-base text-slate-800 font-black line-clamp-2 hover:text-cyan-700 transition-colors">
                        {item.name}
                      </h3>
                      <div className="text-lg font-black text-cyan-700 mt-1">
                        ₹{itemPrice}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl mr-6 mt-4 md:mt-0 w-full md:w-auto justify-center border border-slate-100">
                      <button 
                        className="bg-white shadow-sm border border-slate-200 w-8 h-8 rounded-xl flex justify-center items-center text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <RemoveIcon fontSize="small" />
                      </button>
                      <span className="font-black text-slate-800 w-4 text-center">{item.quantity}</span>
                      <button 
                        className="bg-white shadow-sm border border-slate-200 w-8 h-8 rounded-xl flex justify-center items-center text-slate-600 hover:bg-slate-900 hover:text-white transition-colors"
                        onClick={() => addToCart({ ...item, quantity: 1 })}
                      >
                        <AddIcon fontSize="small" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-6">
                      <div className="font-black text-xl text-slate-800 md:text-right min-w-[80px]">
                        ₹{(itemPrice * item.quantity).toFixed(0)}
                      </div>
                      <button 
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-3 rounded-xl transition-all" 
                        onClick={() => handleRemoveClick(item)}
                      >
                        <DeleteOutlineIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="lg:col-span-5 xl:col-span-4 bg-white p-6 md:p-8 rounded-[30px] shadow-lg shadow-slate-200/50 border border-slate-100 w-full lg:sticky lg:top-24">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Order Summary</h2>

            <div className="mb-8">
              {/* <h4 className="text-sm font-bold text-slate-600 mb-3">Add a tip to support your delivery partner</h4>
              <div className="flex flex-wrap gap-3">
                {[10, 20, 30, 50].map((amt) => (
                  <button
                    key={amt}
                    className={`px-6 py-2.5 rounded-xl font-black text-sm border-2 transition-all ${
                      tipAmount === amt 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600" 
                        : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                    onClick={() => setTipAmount(tipAmount === amt ? 0 : amt)}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div> */}
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
              {isLoadingBill ? (
                <div className="py-4 text-center text-slate-400 font-bold animate-pulse text-sm">
                  Updating exact amount...
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center text-slate-600 font-bold text-base">
                    <span>Item Total</span>
                    <span>₹{displaySubtotal}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600 font-bold text-base">
                    <span>Delivery Charges</span>
                    <span className={displayDelivery === 0 ? "text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md" : ""}>
                      {displayDelivery === 0 ? "FREE" : `₹${displayDelivery}`}
                    </span>
                  </div>

                  {tipAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 font-bold text-base bg-emerald-50 p-2 -mx-2 rounded-lg">
                      <span>Delivery Partner Tip</span>
                      <span>₹{tipAmount}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="border-t-2 border-dashed border-slate-200 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-slate-800 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-cyan-700">₹{grandTotal}</span>
                </div>
              </div>
            </div>

            <button 
              disabled={isLoadingBill}
              className="w-full mt-8 py-5 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl shadow-slate-900/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              onClick={() => navigate("/checkout")}
            >
              <span className="font-black text-sm uppercase tracking-widest text-slate-100">
                {isLoadingBill ? "Wait..." : "Proceed to Checkout"}
              </span>
              <span className="bg-white/20 px-4 py-2 rounded-xl font-black text-lg text-white shadow-inner">
                ₹{grandTotal}
              </span>
            </button>
            
            <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 256-bit Encrypted Checkout
            </p>
          </section>

        </div>
      </div>

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
            
            <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mb-5 mx-auto">
              <DeleteOutlineIcon className="text-rose-500 text-3xl" />
            </div>
            
            <h3 className="text-[22px] font-black text-center text-slate-900 mb-2">
              {confirmModal.type === 'all' ? "Clear Cart?" : "Remove Item?"}
            </h3>
            
            <p className="text-center text-slate-500 font-bold text-sm mb-8">
              {confirmModal.type === 'all' 
                ? "Are you sure you want to remove all items from your cart? This action cannot be undone." 
                : `Are you sure you want to remove "${confirmModal.item?.name}" from your cart?`}
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={closeModal}
                className="flex-1 py-3.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-black hover:bg-slate-100 transition-colors uppercase text-xs tracking-wider"
              >
                Cancel
              </button>
              <button 
                onClick={executeAction}
                className="flex-1 py-3.5 bg-rose-500 text-white rounded-xl font-black hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30 uppercase text-xs tracking-wider"
              >
                {confirmModal.type === 'all' ? "Clear All" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;