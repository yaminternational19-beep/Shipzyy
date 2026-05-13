import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutPanel({ onCancel }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-[414px] w-full p-8 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col items-center justify-center text-center overflow-hidden relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-amber-50 text-amber-500 w-20 h-20 rounded-[30px] flex items-center justify-center mb-6 shadow-sm border border-amber-100 rotate-3 group hover:rotate-0 transition-transform duration-300">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Ready to leave?</h2>
        <p className="text-slate-400 text-[14px] font-bold mb-8 max-w-[380px] leading-relaxed">
          Log out to secure your account on public devices. Your cart items and preferences will be saved for your next visit!
        </p>
        
        {/* Security Badges */}
        <div className="flex gap-6 mb-8 py-3 px-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Session Secure
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span> Data Encrypted
            </div>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
          <button 
            onClick={onCancel}
            className="flex-1 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest bg-white border-2 border-slate-100 text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
          >
            Stay Logged In
          </button>
          <button 
            onClick={handleLogoutClick}
            className="flex-1 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30 transition-all active:scale-95"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutPanel;