import React, { useState } from 'react';
import { ExternalLink, Store } from 'lucide-react';
import './Dashboard.css';
import Toast from '../../components/common/Toast/Toast';

// Role-based dashboards
import SuperAdminDashboard from './dashboards/SuperAdminDashboard';
import AdminDashboard from './dashboards/AdminDashboard';
import VendorOwnerDashboard from './dashboards/VendorOwnerDashboard';
import CommonDashboard from './dashboards/CommonDashboard';

const DashboardPage = () => {
    const userRole = localStorage.getItem('userRole') || 'SUPER_ADMIN';
    const [isVendorView, setIsVendorView] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    // const handleGroceryClick = () => {
    //     setToast({ show: true, message: 'Grocery module is coming soon!', type: 'info' });
    // };

    const handleexportClick = () => {
        setToast({ show: true, message: 'Export functionality is under development!', type: 'info' });
    }

    const toggleView = () => {
        setIsVendorView(!isVendorView);
        setToast({
            show: true,
            message: `Switched to ${!isVendorView ? 'Vendor' : 'Admin'} view`,
            type: 'success'
        });
    };

    const renderDashboard = () => {
        if (userRole === 'SUPER_ADMIN' && isVendorView) {
            return <VendorOwnerDashboard />;
        }

        switch (userRole) {
            case 'SUPER_ADMIN':
                return <SuperAdminDashboard />;
            case 'ADMIN':
                return <AdminDashboard />;
            case 'SUB_ADMIN':
                return <CommonDashboard title="Sub Admin" />;
            case 'SUPPORT_AGENT':
                return <CommonDashboard title="Support Agent" />;
            case 'FINANCE_USER':
                return <CommonDashboard title="Finance" />;
            case 'VENDOR_OWNER':
                return <VendorOwnerDashboard />;
            case 'VENDOR_MANAGER':
                return <CommonDashboard title="Vendor Manager" />;
            case 'VENDOR_STAFF':
                return <CommonDashboard title="Vendor Staff" />;
            default:
                return <div className="unauthorized">Unauthorized Access</div>;
        }
    };

    const formatRole = (role) => {
        return role.replace('_', ' ').toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    };

    return (
        <div className={`dashboard-container ${isVendorView ? 'vendor-mode' : ''}`}>
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Dashboard Overview</h1>
                    <p className="dashboard-subtitle">
                        Viewing system as <strong>{formatRole(userRole)}</strong>
                        {isVendorView && <span className="badge success" style={{ marginLeft: '12px' }}>Vendor Mode</span>}
                    </p>
                </div>
                <div className="dashboard-actions">
                    {userRole === 'SUPER_ADMIN' && (
                        <button className={`btn ${isVendorView ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleView}>
                            {isVendorView ? <ExternalLink size={16} /> : <Store size={16} />}
                            {isVendorView ? 'Return to Admin View' : 'Switch to Vendor View'}
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={handleexportClick}>
                        <ExternalLink size={16} /> Export Report
                    </button>
                </div>
            </div>

            {renderDashboard()}

            {toast.show && (
                <div className="toast-container">
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ ...toast, show: false })}
                    />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
