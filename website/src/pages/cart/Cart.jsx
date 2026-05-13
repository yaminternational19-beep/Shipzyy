import React from "react";
import { useCart } from "./CartContext";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount, isCartOpen, setIsCartOpen } = useCart();

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-[999] backdrop-blur-[2px] transition-opacity duration-300 ease-in-out ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} 
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div 
        className={`fixed top-0 w-full max-w-[420px] h-screen bg-[var(--card-bg)] z-[1000] flex flex-col shadow-[-5px_0_25px_rgba(0,0,0,0.1)] transition-[right] duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] ${
          isCartOpen ? "right-0" : "-right-[100%]"
        }`}
      >
        
        <div className="p-5 flex justify-between items-center border-b border-[var(--border)] shrink-0">
          <h2 className="text-[1.4rem] font-extrabold m-0 text-[var(--text-main)]">
            My Cart <span className="text-[1rem] text-[var(--text-muted)] font-semibold ml-1">({getCartCount()} items)</span>
          </h2>
          <button 
            className="bg-transparent border-none text-[1.5rem] text-[var(--text-muted)] cursor-pointer transition-colors duration-200 hover:text-[var(--danger)]" 
            onClick={() => setIsCartOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-[var(--bg-soft)]">
          {cart.length === 0 ? (
            <div className="text-center py-10 px-5">
              <span className="text-[4rem] block mb-[15px]">🛒</span>
              <h3 className="text-[1.4rem] text-[var(--text-main)] mb-[10px] font-bold">Your cart is empty</h3>
              <p className="text-[var(--text-muted)] mb-[25px]">Add some items to get started!</p>
              <button 
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--secondary)] px-6 py-3 border-none rounded-full font-semibold cursor-pointer transition-colors shadow-[var(--shadow-sm)]" 
                onClick={() => setIsCartOpen(false)}
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cart.map((item) => (
                <div key={item.id} className="flex bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)] gap-4 shadow-sm transition-all hover:shadow-[var(--shadow-sm)] hover:border-[var(--primary-hover)]">
                  
                  {/* Item Image */}
                  <div className="w-[70px] h-[70px] bg-[var(--bg-soft)] rounded-lg p-1.5 flex items-center justify-center shrink-0">
                    <img 
                      src={`/product/${item.image}`} 
                      alt={item.name} 
                      className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/60?text=No+Img"; }}
                    />
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <h4 className="m-0 mb-1 text-[0.95rem] text-[var(--text-main)] font-semibold line-clamp-2">{item.name}</h4>
                    <p className="m-0 mb-2 font-bold text-[var(--primary)] text-[0.9rem]">₹{item.price}</p>
                    
                    {/* Quantity Controls */}
                    <div className="inline-flex items-center bg-[var(--bg-soft)] rounded-lg px-1.5 py-0.5">
                      <button 
                        className="bg-transparent border-none font-black text-[1.1rem] w-[25px] cursor-pointer text-[var(--text-main)] hover:text-[var(--primary)]" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >-</button>
                      <span className="font-semibold text-[0.9rem] w-[20px] text-center text-[var(--text-main)]">{item.quantity}</span>
                      <button 
                        className="bg-transparent border-none font-black text-[1.1rem] w-[25px] cursor-pointer text-[var(--text-main)] hover:text-[var(--primary)]" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</button>
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex flex-col justify-between items-end shrink-0">
                    <p className="font-extrabold text-[var(--text-main)] m-0">₹{item.price * item.quantity}</p>
                    <button 
                      className="bg-transparent border-none text-[1.1rem] cursor-pointer opacity-60 transition-opacity duration-200 hover:opacity-100 hover:scale-110" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.length > 0 && (
          <div className="p-5 bg-[var(--card-bg)] border-t border-[var(--border)] shadow-[0_-4px_15px_rgba(0,0,0,0.03)] shrink-0">
            <div className="flex justify-between mb-2.5 font-semibold text-[var(--text-muted)]">
              <span>Delivery</span>
              <span className="text-[var(--success)] font-bold">{getCartTotal() > 500 ? "FREE" : "₹50"}</span>
            </div>
            <div className="flex justify-between text-[1.3rem] font-extrabold text-[var(--text-main)] mb-5 mt-2.5">
              <span>Grand Total</span>
              <span>₹{getCartTotal() > 500 ? getCartTotal() : getCartTotal() + 50}</span>
            </div>
            <button className="w-full p-4 bg-[image:var(--brand-gradient)] text-white border-none rounded-full text-[1.1rem] font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
              Proceed to Checkout
            </button>
          </div>
        )}
        
      </div>
    </>
  );
};

export default Cart;