import React, { useState, useEffect, useMemo } from "react";
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
import { getSafeImage } from "../utils/imageUtils";
import "../styles/Profile.css";
import Toast from "../components/common/Toast/Toast";
import ExportActions from "../components/common/ExportActions";
import { getProfileApi, updateProfileApi } from "../api/auth.api";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { menuItems as adminModules } from "../utils/roles";
import { menuItems as vendorModules } from "../utils/vendorroles";

const ProfilePage = () => {
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        countryCode: '+91',
        mobile: '',
        emergencyCountryCode: '+91',
        emergencyContact: '',
        location: '',
        postalCode: '',
        status: 'Active',
        role: '',
        newPassword: '',
        confirmPassword: '',
        permissions: [],
        profile_image: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const modules = useMemo(() => {
        let config = [];
        if (userData.role === 'SUPER_ADMIN' || userData.role === 'SUB_ADMIN') {
            config = adminModules;
        } else if (userData.role === 'VENDOR_OWNER' || userData.role === 'VENDOR_STAFF') {
            config = vendorModules;
        }

        const mapped = config.map(item => ({
            id: item.key.toLowerCase(),
            name: item.name,
            desc: item.description || `Access to ${item.name} module`
        }));
        
        // Filter out duplicates based on ID
        return Array.from(new Map(mapped.map(m => [m.id, m])).values());
    }, [userData.role]);

    // Helper to check if a module is active
    const isModuleActive = (moduleId) => {
        if (userData.role === 'SUPER_ADMIN' || userData.role === 'VENDOR_OWNER') return true;
        return (userData.permissions || []).map(p => p.toLowerCase()).includes(moduleId.toLowerCase());
    };

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await getProfileApi();
            if (res.data && res.data.data) {
                const profile = res.data.data;
                setUserData(prev => ({
                    ...prev,
                    ...profile,
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (err) {
            showToast("Failed to load profile", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleSave = async () => {
        if (userData.newPassword || userData.confirmPassword) {
            if (userData.newPassword !== userData.confirmPassword) {
                showToast("New password and confirm password do not match!", "error");
                return;
            }
            if (userData.newPassword.length < 6) {
                showToast("New password must be at least 6 characters long", "warning");
                return;
            }
        }

        try {
            await updateProfileApi({
                fullName: userData.fullName,
                email: userData.email,
                countryCode: userData.countryCode,
                mobile: userData.mobile,
                emergencyCountryCode: userData.emergencyCountryCode,
                emergencyContact: userData.emergencyContact,
                newPassword: userData.newPassword
            });
            showToast("Profile details updated successfully!", "success");
            setUserData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to update profile", "error");
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
                                    src={getSafeImage(userData.profile_image, 'USER')}
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
                            <PhoneInput
                                country={'in'}
                                value={(userData.countryCode || '') + (userData.mobile || '')}
                                onChange={(value, data) => {
                                    const dialCode = `+${data.dialCode}`;
                                    const mobileNumber = value.startsWith(data.dialCode)
                                        ? value.slice(data.dialCode.length)
                                        : value;
                                    setUserData({
                                        ...userData,
                                        countryCode: dialCode,
                                        mobile: mobileNumber
                                    });
                                }}
                                enableSearch={true}
                                containerClass="mobile-phone-input"
                                inputClass="profile-modern-input"
                                buttonClass="country-dropdown-btn"
                                dropdownClass="country-dropdown-list"
                                placeholder="Primary Phone"
                                inputStyle={{ width: '100%', paddingLeft: '48px' }}
                            />
                        </div>
                    </div>

                    <div className="profile-form-row">
                        <div className="profile-input-group">
                            <label>Emergency Contact</label>
                            <PhoneInput
                                country={'in'}
                                value={(userData.emergencyCountryCode || '') + (userData.emergencyContact || '')}
                                onChange={(value, data) => {
                                    const dialCode = `+${data.dialCode}`;
                                    const mobileNumber = value.startsWith(data.dialCode)
                                        ? value.slice(data.dialCode.length)
                                        : value;
                                    setUserData({
                                        ...userData,
                                        emergencyCountryCode: dialCode,
                                        emergencyContact: mobileNumber
                                    });
                                }}
                                enableSearch={true}
                                containerClass="mobile-phone-input"
                                inputClass="profile-modern-input"
                                buttonClass="country-dropdown-btn"
                                dropdownClass="country-dropdown-list"
                                placeholder="Emergency Contact"
                                inputStyle={{ width: '100%', paddingLeft: '48px' }}
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    {/* <div className="section-header" style={{ marginTop: '40px' }}>Address Details</div> */}
                    {/* <div className="profile-form-row">
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
                    </div> */}

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
                                    background: isModuleActive(module.id) ? '#f5f3ff' : '#f8fafc',
                                    border: isModuleActive(module.id) ? '1px solid #c7d2fe' : '1px solid #e2e8f0',
                                    transition: 'all 0.2s ease',
                                    opacity: isModuleActive(module.id) ? 1 : 0.6
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isModuleActive(module.id) ? '#4f46e5' : '#cbd5e1',
                                    color: 'white',
                                    flexShrink: 0
                                }}>
                                    {isModuleActive(module.id) ? <Check size={12} strokeWidth={4} /> : null}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        color: isModuleActive(module.id) ? '#1e1b4b' : '#64748b'
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