import React, { useState } from "react";
import {
    User,
    Heart,
    Star,
    Settings,
    Bell,
    Pencil,
    Mail,
    Phone,
    MapPin,
    Lock,
    Globe,
    Shield,
    Smartphone,
    ShieldAlert,
    CheckCircle,
    AlertCircle,
    Download,
    Check,
    Eye,
    EyeOff
} from "lucide-react";
import "../styles/Profile.css";
import Toast from "../components/common/Toast/Toast";
import ExportActions from "../components/common/ExportActions";

const ProfilePage = () => {
    // Permission Modules Template
    const modules = [
        { id: 'dashboard', name: 'Dashboard', desc: 'Overview, analytics and reports' },
        { id: 'subadmins', name: 'Sub-Admin Management', desc: 'Manage system administrator accounts' },
        { id: 'vendors', name: 'Vendor Management', desc: 'Handle applications, KYC and tiering' },
        { id: 'customers', name: 'Customer Management', desc: 'Client accounts and support tickets' },
        { id: 'delivery', name: 'Delivery Tracking', desc: 'Live tracking and rider management' },
        { id: 'settings', name: 'System Settings', desc: 'Core platform configurations' },
        { id: 'orders', name: 'Order Management', desc: 'Track and manage customer orders' },
        { id: 'products', name: 'Product Inventory', desc: 'Manage catalogue and item stock' }
    ];

    // Data based on SubAdmin structure & Image placeholders
    const [userData, setUserData] = useState({
        fullName: 'Sara Tancredi',
        email: 'SaraTancredi@gmail.com',
        countryCode: '+1',
        mobile: '9123728167',
        emergencyCountryCode: '+91',
        emergencyContact: '9123728167',
        location: 'New York, USA',
        postalCode: '23728167',
        status: 'Active',
        role: 'SUPER_ADMIN',
        newPassword: '',
        confirmPassword: '',
        permissions: ['dashboard', 'subadmins', 'vendors', 'orders', 'products']
    });

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleSave = () => {
        // Password Change Logic
        if (userData.newPassword || userData.confirmPassword) {
            // 1. Check if new password and confirm match
            if (userData.newPassword !== userData.confirmPassword) {
                showToast("New password and confirm password do not match!", "error");
                return;
            }

            // 2. Check password strength
            if (userData.newPassword.length < 6) {
                showToast("New password must be at least 6 characters long", "warning");
                return;
            }

            showToast("Password updated and profile saved!", "success");
        } else {
            showToast("Profile details updated successfully!", "success");
        }
    };

    const handleExportProfile = (message, type) => {
        showToast(message, type);
    };

    return (
        <div className="profile-page-wrapper">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Main Content Area */}
            <main className="profile-main-content">
                <div className="profile-view-header" style={{ justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                        <div className="profile-avatar-container">
                            <div className="profile-avatar-glow">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Sara`}
                                    alt="User Profile"
                                    className="profile-avatar-img"
                                />
                            </div>
                            <div className="profile-avatar-edit">
                                <Pencil size={14} />
                            </div>
                        </div>
                        <div className="profile-user-info">
                            <h2>{userData.fullName}</h2>
                            <p>{userData.location}</p>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <span className="status-badge status-approved">{userData.role.replace('_', ' ')}</span>
                                <span className={`status-badge ${userData.status === 'Active' ? 'status-live' : 'status-blocked'}`}>{userData.status}</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-page-actions">
                        <ExportActions selectedCount={1} onExport={handleExportProfile} />
                    </div>
                </div>

                <div className="profile-form-container">
                    {/* Basic Info Section */}
                    <div className="section-header">Basic Info</div>
                    <div className="profile-form-row">
                        <div className="profile-input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="profile-modern-input"
                                placeholder="Enter full name"
                                value={userData.fullName}
                                onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="profile-form-row">
                        <div className="profile-input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                className="profile-modern-input"
                                placeholder="Enter email address"
                                value={userData.email}
                                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            />
                        </div>
                        <div className="profile-input-group">
                            <label>Contact Number</label>
                            <div className="mobile-input-split">
                                <select
                                    className="profile-modern-select"
                                    value={userData.countryCode}
                                    onChange={(e) => setUserData({ ...userData, countryCode: e.target.value })}
                                >
                                    <option value="+1">+1 (USA)</option>
                                    <option value="+44">+44 (UK)</option>
                                    <option value="+91">+91 (IND)</option>
                                </select>
                                <input
                                    type="text"
                                    className="profile-modern-input"
                                    style={{ flex: 1 }}
                                    value={userData.mobile}
                                    onChange={(e) => setUserData({ ...userData, mobile: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="profile-form-row">
                        <div className="profile-input-group">
                            <label>Emergency Contact</label>
                            <input
                                type="text"
                                className="profile-modern-input"
                                placeholder="Emergency number"
                                value={userData.emergencyContact}
                                onChange={(e) => setUserData({ ...userData, emergencyContact: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="section-header" style={{ marginTop: '40px' }}>Address Details</div>
                    <div className="profile-form-row">
                        <div className="profile-input-group">
                            <label>Location / City</label>
                            <input
                                type="text"
                                className="profile-modern-input"
                                value={userData.location}
                                placeholder="e.g. New York, USA"
                                onChange={(e) => setUserData({ ...userData, location: e.target.value })}
                            />
                        </div>
                        <div className="profile-input-group">
                            <label>Postal Code</label>
                            <input
                                type="text"
                                className="profile-modern-input"
                                value={userData.postalCode}
                                onChange={(e) => setUserData({ ...userData, postalCode: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="section-header" style={{ marginTop: '40px' }}>Security Settings</div>

                    <div className="profile-form-row">
                        <div className="profile-input-group">
                            <label>New Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    className="profile-modern-input"
                                    placeholder="Enter new password"
                                    value={userData.newPassword}
                                    onChange={(e) => setUserData({ ...userData, newPassword: e.target.value })}
                                    style={{ paddingRight: '45px' }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="profile-input-group">
                            <label>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`profile-modern-input ${userData.confirmPassword && userData.newPassword !== userData.confirmPassword ? 'error-border' : ''}`}
                                    placeholder="Confirm new password"
                                    value={userData.confirmPassword}
                                    onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                                    style={{ paddingRight: '45px' }}
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {userData.confirmPassword && userData.newPassword !== userData.confirmPassword && (
                                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', marginLeft: '4px' }}>Passwords do not match</span>
                            )}
                        </div>
                    </div>

                    {/* Permissions Section (Read-Only) */}
                    <div className="section-header" style={{ marginTop: '40px' }}>System Permissions</div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px',
                        marginTop: '16px'
                    }}>
                        {modules.map(module => (
                            <div
                                key={module.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: userData.permissions.includes(module.id) ? '#f5f3ff' : '#f8fafc',
                                    border: userData.permissions.includes(module.id) ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease',
                                    opacity: userData.permissions.includes(module.id) ? 1 : 0.6
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: userData.permissions.includes(module.id) ? '#4f46e5' : '#cbd5e1',
                                    color: 'white',
                                    flexShrink: 0
                                }}>
                                    {userData.permissions.includes(module.id) ? <Check size={12} strokeWidth={4} /> : null}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        color: userData.permissions.includes(module.id) ? '#1e1b4b' : '#64748b'
                                    }}>
                                        {module.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{module.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="profile-save-btn" onClick={handleSave} style={{ marginTop: '48px' }}>
                        Save Profile Changes
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;