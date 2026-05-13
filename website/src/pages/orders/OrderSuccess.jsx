import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || "ORD" + Math.floor(Math.random() * 90000);
  
  const [showCheck, setShowCheck] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    setTimeout(() => setShowCheck(true), 100);
    setTimeout(() => setShowTitle(true), 800);
    setTimeout(() => setShowSub(true), 1100);
    setTimeout(() => setShowCard(true), 1400);
    setTimeout(() => setShowBtn(true), 1700);
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative px-4 py-10 overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-emerald-500/20 rounded-full blur-[80px] md:blur-[120px] animate-[pulse_3s_ease-in-out_infinite_alternate] -z-10"></div>

      <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 p-8 md:p-12 rounded-[40px] shadow-[0_30px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] max-w-lg w-full text-center relative z-10 animate-[popIn_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]">
        
        <div className="w-24 h-24 md:w-28 md:h-28 mx-auto bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border-4 border-emerald-100 dark:border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <svg className="w-14 h-14 md:w-16 md:h-16 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {showCheck && (
              <>
                <circle 
                  cx="12" cy="12" r="10" 
                  className="stroke-emerald-500"
                  strokeDasharray="100" 
                  strokeDashoffset="100"
                  style={{ animation: 'drawCircle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards' }}
                />
                <path 
                  d="M8 12.5l3 3 5-6" 
                  className="stroke-emerald-500"
                  strokeDasharray="50" 
                  strokeDashoffset="50"
                  style={{ animation: 'drawTick 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.5s forwards' }}
                />
              </>
            )}
          </svg>
        </div>
        
        <h1 className={`text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-[#005f73] to-[#14b8a6] bg-clip-text text-transparent transition-all duration-700 transform ${showTitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Payment Successful!
        </h1>
        
        <p className={`text-[var(--text-muted)] font-medium mb-8 md:mb-10 transition-all duration-700 transform ${showSub ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          Hooray! Your order is confirmed and is currently being prepared for shipment.
        </p>
        
        <div className={`bg-slate-50 dark:bg-slate-800/50 rounded-[20px] p-5 md:p-6 mb-8 text-left border border-slate-100 dark:border-slate-700/50 transition-all duration-700 transform ${showCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-dashed border-slate-200 dark:border-slate-700">
            <span className="text-[var(--text-muted)] font-bold text-sm">Order ID</span>
            <strong className="text-[var(--text-main)] font-black text-sm">#{orderId}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)] font-bold text-sm">Status</span>
            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-black text-xs uppercase tracking-widest shadow-sm">
              Confirmed
            </span>
          </div>
        </div>

        <div className={`flex flex-col gap-4 transition-all duration-700 transform ${showBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button 
            onClick={() => navigate("/orders")}
            className="w-full py-4 md:py-5 bg-[image:var(--brand-gradient)] text-white rounded-[16px] font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-transform duration-300 shadow-[var(--shadow-md)] shadow-teal-500/30"
          >
            Track My Order
          </button>
          
          <button 
            onClick={() => navigate("/shop")}
            className="w-full py-4 text-[var(--primary)] dark:text-teal-400 font-bold text-sm hover:underline transition-all"
          >
            ← Back to Shopping
          </button>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawCircle {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes drawTick {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />

    </div>
  );
};

export default OrderSuccess;