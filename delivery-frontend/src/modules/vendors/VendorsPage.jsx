import React, { useState } from 'react';
import {
    Award,
    Plus,
    Users,
    ShieldCheck,
    History
} from 'lucide-react';

import VendorStats from './components/VendorStats';
import VendorList from './components/VendorList';
import VendorForm from './components/VendorForm';
import VendorTiering from './components/VendorTiering';
import VendorKYC from './components/VendorKYC';
import VendorLogs from './components/VendorLogs';
import Toast from '../../components/common/Toast/Toast';

import './Vendors.css';

const VendorManagement = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showForm, setShowForm] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleEditVendor = (vendor) => {
        setEditingVendor(vendor);
        setShowForm(true);
    };

    const handleStatusToggle = (vendor) => {
        const newStatus = vendor.status === 'Active' ? 'Deactivated' : 'Activated';
        showToast(`${vendor.name} has been ${newStatus}.`, 'success');
    };

    const handleDeleteVendor = (vendor) => {
        showToast(`${vendor.name} has been deleted.`, 'success');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <VendorList
                        onEdit={handleEditVendor}
                        onStatusToggle={handleStatusToggle}
                        onDelete={handleDeleteVendor}
                        showToast={showToast}
                        onTabChange={setActiveTab}
                    />
                );
            case 'tiering':
                return <VendorTiering />;
            case 'kyc':
                return <VendorKYC showToast={showToast} />;
            case 'logs':
                return <VendorLogs showToast={showToast} />;
            default:
                return null;
        }
    };

    return (
        <div className="v-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Vendor Management</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Manage platform partners, onboarding, and kyc verification</p>
                </div>
                {!showForm && activeTab === 'overview' && (
                    <button
                        className="btn btn-primary"
                        onClick={() => { setEditingVendor(null); setShowForm(true); }}
                    >
                        <Plus size={18} /> Add New Vendor
                    </button>
                )}
            </div>

            {!showForm && (
                <>
                    <VendorStats />

                    {/* Tabs */}
                    <div className="tab-group-pills">
                        <button
                            className={activeTab === 'overview' ? 'active' : ''}
                            onClick={() => setActiveTab('overview')}
                        >
                            <Users size={16} /> Overview
                        </button>
                        <button
                            className={activeTab === 'kyc' ? 'active' : ''}
                            onClick={() => setActiveTab('kyc')}
                        >
                            <ShieldCheck size={16} /> KYC Verification
                        </button>
                        <button
                            className={activeTab === 'tiering' ? 'active' : ''}
                            onClick={() => setActiveTab('tiering')}
                        >
                            <Award size={16} /> Tier Management
                        </button>
                        <button
                            className={activeTab === 'logs' ? 'active' : ''}
                            onClick={() => setActiveTab('logs')}
                        >
                            <History size={16} /> Activity Logs
                        </button>
                    </div>
                </>
            )}


            <div className="content-container">
                {renderContent()}
            </div>

            {showForm && (
                <VendorForm
                    initialData={editingVendor}
                    onCancel={() => { setShowForm(false); setEditingVendor(null); }}
                    onSave={(data) => {
                        setShowForm(false);
                        setEditingVendor(null);
                        const vendorName = data.businessName || 'Vendor';
                        showToast(`${vendorName} ${editingVendor ? 'updated' : 'registered'} successfully!`, 'success');
                    }}
                />
            )}
        </div>
    );
};

export default VendorManagement;
