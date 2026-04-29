import { useState } from "react";
import { toast } from "react-toastify";

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
    <form onSubmit={handleSubmit}>
      <h2 className="section-title">Password Manager</h2>
      <p className="section-subtitle">Ensure your account is using a long, random password to stay secure.</p>

      <div className="form-group" style={{ maxWidth: "400px" }}>
        <input type="password" name="current" value={passwords.current} onChange={handleChange} required placeholder=" " />
        <label>Current Password *</label>
      </div>

      <div className="form-group" style={{ maxWidth: "400px" }}>
        <input type="password" name="new" value={passwords.new} onChange={handleChange} required placeholder=" " />
        <label>New Password *</label>
      </div>

      <div className="form-group" style={{ maxWidth: "400px" }}>
        <input type="password" name="confirm" value={passwords.confirm} onChange={handleChange} required placeholder=" " />
        <label>Confirm New Password *</label>
      </div>

      <button type="submit" className="primary-btn">Update Password</button>
    </form>
  );
}

export default PasswordManager;