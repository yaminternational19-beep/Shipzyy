import React from 'react';

function Wallet() {
  return (
    <div className="h-[414px] w-full p-6 md:p-8 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-[var(--border)] relative shrink-0">
        <h2 className="text-2xl font-black bg-[image:var(--brand-gradient)] bg-clip-text text-transparent inline-block">
          My Wallet
        </h2>
        <div className="absolute bottom-[-1px] left-0 w-16 h-[3px] bg-[image:var(--brand-gradient)] rounded-full"></div>
      </div>
      
      {/* Balance Card - Compact & Premium */}
      <div className="p-6 bg-[image:var(--brand-gradient)] rounded-[24px] shadow-lg mb-6 text-white shrink-0 relative overflow-hidden group transition-transform hover:scale-[1.01]">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-black opacity-80 uppercase tracking-[0.2em] mb-1">Available Balance</p>
            <h3 className="text-3xl font-black tracking-tight">₹1,250.00</h3>
          </div>
          <button className="px-6 py-2.5 bg-white text-[#005f73] font-black uppercase tracking-widest text-[11px] rounded-full shadow-md hover:bg-slate-50 transition-all active:scale-95">
            + Add Money
          </button>
        </div>
      </div>
      
      {/* Transactions List - Scrollable */}
      <div className="flex-1 flex flex-col min-h-0">
        <h4 className="text-[14px] font-black text-[var(--text-main)] uppercase tracking-widest mb-4 ml-1">Recent Transactions</h4>
        
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">💰</div>
              <div>
                <strong className="text-sm font-black text-slate-800">Added to Wallet</strong>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">12 Feb 2026 • 10:30 AM</p>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-500 tracking-wider">+ ₹500</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 text-lg">🛍️</div>
              <div>
                <strong className="text-sm font-black text-slate-800">Order #ORD1024</strong>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">10 Feb 2026 • 04:15 PM</p>
              </div>
            </div>
            <span className="text-sm font-black text-rose-500 tracking-wider">- ₹850</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600 text-lg">🔄</div>
              <div>
                <strong className="text-sm font-black text-slate-800">Refund Received</strong>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">08 Feb 2026 • 11:20 AM</p>
              </div>
            </div>
            <span className="text-sm font-black text-emerald-500 tracking-wider">+ ₹1,200</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Wallet;