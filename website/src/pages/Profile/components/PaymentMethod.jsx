import React from 'react';
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

function PaymentMethod() {
  return (
    <div className="p-8 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)] max-w-2xl">
      <h2 className="text-[28px] font-black text-[var(--text-main)] mb-2">Payment Methods</h2>
      <p className="text-[14px] text-[var(--text-muted)] font-medium mb-8">Manage your saved cards for faster checkouts.</p>

      <div className="flex items-center justify-between p-5 mb-8 rounded-[var(--radius-lg)] border-2 border-[var(--border)] bg-[var(--bg-soft)] group">
        <div className="flex items-center gap-4">
          <div className="w-12 h-8 bg-blue-900 rounded text-white flex items-center justify-center font-black text-xs tracking-widest shadow-sm">
            VISA
          </div>
          <p className="text-[16px] font-bold text-[var(--text-main)] tracking-widest">•••• •••• •••• 8047</p>
        </div>
        <button className="text-[var(--danger)] bg-white p-2 rounded-full shadow-sm hover:scale-110 transition-transform">
           <DeleteOutlineIcon fontSize="small" />
        </button>
      </div>

      <div className="border-t border-[var(--border)] pt-8">
        <h3 className="text-[18px] font-bold text-[var(--text-main)] mb-5">Add New Card</h3>
        <div className="grid grid-cols-1 gap-5 mb-6">
          <div className="relative group">
            <input className="w-full p-4 bg-[var(--bg-soft)] rounded-[var(--radius-md)] font-bold text-[var(--text-main)] outline-none border-2 border-transparent focus:border-[var(--primary)] focus:bg-[var(--bg)] transition-all" placeholder="Card Holder Name (Ex. John Doe)" />
          </div>
          <div className="relative group">
            <input className="w-full p-4 bg-[var(--bg-soft)] rounded-[var(--radius-md)] font-bold text-[var(--text-main)] outline-none border-2 border-transparent focus:border-[var(--primary)] focus:bg-[var(--bg)] transition-all tracking-widest" placeholder="Card Number (4716 9627 1635 8047)" />
          </div>
        </div>
        <button className="px-8 py-3.5 rounded-[var(--radius-pill)] font-black uppercase tracking-widest text-sm transition-all shadow-[var(--shadow-md)] bg-[var(--primary)] text-[var(--secondary)] hover:bg-[var(--primary-hover)] hover:-translate-y-1">
          Add Card
        </button>
      </div>
    </div>
  );
}

export default PaymentMethod;