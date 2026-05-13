import { useState } from "react";
import { toast } from "react-toastify";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';

function PasswordManager() {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwords.new.length < 6) return toast.error("New password must be at least 6 characters.");
    if (passwords.new !== passwords.confirm) return toast.error("New passwords do not match!");

    toast.success("Password updated successfully!");
    setPasswords({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="flex flex-col min-h-[500px] w-full p-8 md:p-10 bg-[var(--card-bg)] rounded-[var(--radius-xl)] border border-[var(--border)] shadow-[var(--shadow-sm)]">
      <div className="mb-10 pb-4 border-b border-[var(--border)]">
        <h2 className="text-[24px] font-black text-[var(--text-main)]">Password Manager</h2>
        <p className="text-[13px] text-[var(--text-muted)] font-medium mt-1">Ensure your account is using a long, random password to stay secure.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          
          <div className="flex flex-col">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-2">Current Password</label>
            <div className="flex items-center gap-3 px-5 py-4 rounded-[var(--radius-md)] border-2 border-transparent bg-[var(--bg-soft)] focus-within:border-[var(--primary)] focus-within:bg-[var(--bg)] transition-all">
              <LockOutlinedIcon className="text-[var(--text-muted)] scale-90" />
              <input type="password" name="current" value={passwords.current} onChange={handleChange} required className="w-full bg-transparent outline-none text-[15px] font-bold text-[var(--text-main)]" placeholder="Enter current password" />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-2">New Password</label>
            <div className="flex items-center gap-3 px-5 py-4 rounded-[var(--radius-md)] border-2 border-transparent bg-[var(--bg-soft)] focus-within:border-[var(--primary)] focus-within:bg-[var(--bg)] transition-all">
              <VpnKeyOutlinedIcon className="text-[var(--text-muted)] scale-90" />
              <input type="password" name="new" value={passwords.new} onChange={handleChange} required className="w-full bg-transparent outline-none text-[15px] font-bold text-[var(--text-main)]" placeholder="Enter new password" />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 pl-2">Confirm New Password</label>
            <div className="flex items-center gap-3 px-5 py-4 rounded-[var(--radius-md)] border-2 border-transparent bg-[var(--bg-soft)] focus-within:border-[var(--primary)] focus-within:bg-[var(--bg)] transition-all">
              <VpnKeyOutlinedIcon className="text-[var(--text-muted)] scale-90" />
              <input type="password" name="confirm" value={passwords.confirm} onChange={handleChange} required className="w-full bg-transparent outline-none text-[15px] font-bold text-[var(--text-main)]" placeholder="Re-type new password" />
            </div>
          </div>

          <button type="submit" className="w-full mt-4 px-8 py-4 rounded-[var(--radius-pill)] font-black uppercase tracking-widest text-[13px] transition-all shadow-[var(--shadow-md)] bg-[var(--primary)] text-[var(--secondary)] hover:bg-[var(--primary-hover)] hover:-translate-y-1">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default PasswordManager;