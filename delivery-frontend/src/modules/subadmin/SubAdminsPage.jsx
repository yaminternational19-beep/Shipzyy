import React, { useState } from 'react';
import { Users, Shield, Terminal } from 'lucide-react';
import SubAdminList from './components/SubAdminList';
import SubAdminForm from './components/SubAdminForm';
import SubAdminPermissions from './components/SubAdminPermissions';
import SubAdminStats from './components/SubAdminStats';
import AccessLogs from './components/AccessLogs';
import Toast from '../../components/common/Toast/Toast';
import { createSubAdminApi, updateSubAdminApi, toggleSubAdminStatusApi, deleteSubAdminApi, updateSubAdminPermissionsApi } from '../../api/subadmin.api';
import './SubAdmins.css';


const SubAdminsPage = () => {
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

    const handleSaveSubAdmin = async (data) => {
        try {
            // Check if we have a user in modal (edit mode)
            const editingUserId = modal.user?.id;

            if (editingUserId) {
                // Ensure ID doesn't have a leading colon (defensive)
                const sanitizedId = editingUserId.toString().startsWith(':')
                    ? editingUserId.toString().substring(1)
                    : editingUserId;
                await updateSubAdminApi(sanitizedId, data);
            } else {
                await createSubAdminApi(data);
            }

            showToast(editingUserId ? 'Sub admin updated successfully' : 'Sub admin created successfully', 'success');
            setModal({ open: false, type: null, user: null });
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Save error:', error);
            const errorMessage = error.response?.data?.error?.details || error.response?.data?.message || 'Failed to save sub-admin details';
            showToast(errorMessage, 'error');
        }
    };


    const handleSavePermissions = async (permissions) => {
        try {
            const sanitizedId = modal.user?.id.toString().startsWith(':')
                ? modal.user?.id.toString().substring(1)
                : modal.user?.id;

            await updateSubAdminPermissionsApi(sanitizedId, permissions);
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

            await toggleSubAdminStatusApi(sanitizedId);
            const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
            showToast(`Sub-Admin ${user.name} is now ${newStatus}`, 'success');
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete this sub-admin?`)) {
            try {
                const sanitizedId = user.id.toString().startsWith(':')
                    ? user.id.toString().substring(1)
                    : user.id;

                await deleteSubAdminApi(sanitizedId);
                showToast('Sub admin deleted successfully', 'success');
                setRefreshKey(prev => prev + 1);
            } catch (error) {
                const msg = error.response?.data?.message || '';
                if (msg.toLowerCase().includes('active')) {
                    showToast('Admin is active. Please deactivate first.', 'error');
                } else {
                    showToast(msg || 'Failed to delete sub-admin', 'error');
                }
            }
        }
    };

    return (
        <div className="subadmin-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Sub-Admin Management</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Manage system administrators and their relative permissions</p>
                </div>
                {activeTab === 'users' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setModal({ open: true, type: 'form', user: null })}
                    >
                        <Users size={18} />
                        Add New Sub-Admin
                    </button>
                )}
            </div>

            {/* Stats Section */}
            <SubAdminStats stats={stats} />

            {/* Tabs */}
            <div className="tab-group-pills">
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    <Shield size={14} />
                    Sub-Admins
                </button>
                <button
                    className={activeTab === 'logs' ? 'active' : ''}
                    onClick={() => setActiveTab('logs')}
                >
                    <Terminal size={14} />
                    Access Logs
                </button>
            </div>


            {/* Content Area */}
            {activeTab === 'users' ? (
                <SubAdminList
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
                <SubAdminForm
                    user={modal.user}
                    onClose={() => setModal({ open: false, type: null, user: null })}
                    onSave={handleSaveSubAdmin}
                />
            )}

            {modal.open && modal.type === 'permissions' && (
                <SubAdminPermissions
                    user={modal.user}
                    onClose={() => setModal({ open: false, type: null, user: null })}
                    onSave={handleSavePermissions}
                />
            )}
        </div>
    );
};

export default SubAdminsPage;
