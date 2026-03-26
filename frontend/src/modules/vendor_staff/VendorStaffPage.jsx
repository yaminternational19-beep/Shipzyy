import React, { useState } from 'react';
import { Users, Shield, Terminal } from 'lucide-react';
import VendorStaffList from './components/VendorStaffList';
import VendorStaffForm from './components/VendorStaffForm';
import VendorStaffPermissions from './components/VendorStaffPermissions';
import VendorStaffStats from './components/VendorStaffStats';
import AccessLogs from './components/AccessLogs';
import Toast from '../../components/common/Toast/Toast';
import { createVendorStaffApi, updateVendorStaffApi, toggleVendorStaffStatusApi, deleteVendorStaffApi, updateVendorStaffPermissionsApi } from '../../api/vendor_staff.api';
import './VendorStaff.css';


const VendorStaffPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [modal, setModal] = useState({ open: false, type: null, user: null });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const [refreshKey, setRefreshKey] = useState(0);
    const [stats, setStats] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleFetchSuccess = (data) => {
        if (data.stats) {
            setStats(data.stats);
        }
    };

    const handleSaveVendorStaff = async (data) => {
        try {
            // Check if we have a user in modal (edit mode)
            const editingUserId = modal.user?.id;

            if (editingUserId) {
                // Ensure ID doesn't have a leading colon (defensive)
                const sanitizedId = editingUserId.toString().startsWith(':')
                    ? editingUserId.toString().substring(1)
                    : editingUserId;
                await updateVendorStaffApi(sanitizedId, data);
            } else {
                await createVendorStaffApi(data);
            }

            showToast(editingUserId ? 'Vendor staff updated successfully' : 'Vendor staff created successfully', 'success');
            setModal({ open: false, type: null, user: null });
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Save error:', error);
            const errorMessage = error.response?.data?.error?.details || error.response?.data?.message || 'Failed to save vendor staff details';
            showToast(errorMessage, 'error');
        }
    };


    const handleSavePermissions = async (permissions) => {
        try {
            const sanitizedId = modal.user?.id.toString().startsWith(':')
                ? modal.user?.id.toString().substring(1)
                : modal.user?.id;

            await updateVendorStaffPermissionsApi(sanitizedId, permissions);
            showToast(`Access permissions for ${modal.user?.name} updated successfully`, 'success');
            setModal({ open: false, type: null, user: null });
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update permissions', 'error');
        }
    };

    const handleDeactivate = async (user) => {
        try {
            const sanitizedId = user.id.toString().startsWith(':')
                ? user.id.toString().substring(1)
                : user.id;

            await toggleVendorStaffStatusApi(sanitizedId);
            const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
            showToast(`Vendor Staff ${user.name} is now ${newStatus}`, 'success');
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete this vendor staff member?`)) {
            try {
                const sanitizedId = user.id.toString().startsWith(':')
                    ? user.id.toString().substring(1)
                    : user.id;

                await deleteVendorStaffApi(sanitizedId);
                showToast('Vendor staff deleted successfully', 'success');
                setRefreshKey(prev => prev + 1);
            } catch (error) {
                const msg = error.response?.data?.message || '';
                if (msg.toLowerCase().includes('active')) {
                    showToast('Admin is active. Please deactivate first.', 'error');
                } else {
                    showToast(msg || 'Failed to delete vendor staff', 'error');
                }
            }
        }
    };

    return (
        <div className="vendorstaff-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Toast Notification - Floating at Right Top */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Page Header */}
            <div className="module-intro">
                <div className="intro-content">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Vendor Staff Management</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Manage vendor staff members and their relative permissions</p>
                </div>
                {activeTab === 'users' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setModal({ open: true, type: 'form', user: null })}
                    >
                        <Users size={18} />
                        Add New Vendor Staff
                    </button>
                )}
            </div>

            {/* Stats Section */}
            <VendorStaffStats stats={stats} />

            {/* Tabs */}
            <div className="tab-group-pills">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    <Shield size={14} />
                    Vendor Staff
                </button>
                <button
                    className={activeTab === 'access' ? 'active' : ''}
                    onClick={() => setActiveTab('access')}
                >
                    <Terminal size={14} />
                    Access Logs
                </button>
            </div>


            {/* Content Area */}
            {activeTab === 'users' ? (
                <VendorStaffList
                    key={refreshKey}
                    onEdit={(user) => setModal({ open: true, type: 'form', user })}
                    onEditPermissions={(user) => setModal({ open: true, type: 'permissions', user })}
                    onDeactivate={handleDeactivate}
                    onDelete={handleDelete}
                    onShowToast={showToast}
                    onFetchSuccess={handleFetchSuccess}
                />
            ) : (
                <AccessLogs onShowToast={showToast} />
            )}


            {/* Modals */}
            {modal.open && modal.type === 'form' && (
                <VendorStaffForm
                    user={modal.user}
                    onClose={() => setModal({ open: false, type: null, user: null })}
                    onSave={handleSaveVendorStaff}
                />
            )}

            {modal.open && modal.type === 'permissions' && (
                <VendorStaffPermissions
                    user={modal.user}
                    onClose={() => setModal({ open: false, type: null, user: null })}
                    onSave={handleSavePermissions}
                />
            )}
        </div>
    );
};

export default VendorStaffPage;
