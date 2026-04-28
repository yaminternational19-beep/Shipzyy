import React, { useState } from 'react';
import { Undo2, Users, Bike } from 'lucide-react';
import Toast from '../../components/common/Toast/Toast';
import CustomerRefunds from './components/CustomerRefunds';
import RiderRefunds from './components/RiderRefunds';
import './Refunds.css';

const RefundsPage = () => {
    const [activeTab, setActiveTab] = useState('customer');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    return (
        <div className="refunds-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div className="module-intro">
                <div className="intro-content">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Refunds Management</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Manage refund requests and dispute settlements</p>
                </div>
            </div>

            {/* <div className="tab-group-pills">
                <button
                    className={activeTab === 'customer' ? 'active' : ''}
                    onClick={() => setActiveTab('customer')}
                >
                    <Users size={14} />
                    Customer Refunds
                </button>
                <button
                    className={activeTab === 'rider' ? 'active' : ''}
                    onClick={() => setActiveTab('rider')}
                >
                    <Bike size={14} />
                    Rider Refunds
                </button>
            </div> */}

            {activeTab === 'customer' && <CustomerRefunds onShowToast={showToast} />}
            {activeTab === 'rider' && <RiderRefunds onShowToast={showToast} />}
        </div>
    );
};

export default RefundsPage;
