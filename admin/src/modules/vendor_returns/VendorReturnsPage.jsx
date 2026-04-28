import React, { useState } from 'react';
import VendorReturnList from './components/VendorReturnList';
import Toast from '../../components/common/Toast/Toast';
import { updateVendorReturnStatusApi } from '../../api/vendor_returns.api';
import './VendorReturns.css';

const VendorReturnsPage = () => {
    const [stats, setStats] = useState({ total: 0, requested: 0, received: 0, refunded: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [refreshKey, setRefreshKey] = useState(0);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleFetchSuccess = (data) => {
        if (data.pagination) {
            // Placeholder for stats calculation if needed, or fetched from API
            // The list API only provides pagination, so we can mock stats or compute them
            // if we add a stats API later.
            setStats({
                total: data.pagination.total || 0,
                requested: 0,
                received: 0,
                refunded: 0
            });
        }
    };

    const handleUpdateStatus = async (returnId, newStatus) => {
        try {
            const response = await updateVendorReturnStatusApi(returnId, newStatus);
            showToast(response.message);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            showToast(error?.response?.data?.message || "Failed to update return status", "error");
        }
    };

    return (
        <div className="vendor-orders-module">
            <div className="orders-header">
                <div>
                    <h2>Returns Management</h2>
                    <p>Process customer returns and refunds.</p>
                </div>
            </div>

            {/* <VendorReturnStats stats={stats} /> */}

            <VendorReturnList 
                key={refreshKey}
                onFetchSuccess={handleFetchSuccess}
                onUpdateStatus={handleUpdateStatus}
                showToast={showToast}
            />

            {toast.show && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ show: false, message: '', type: 'success' })} 
                />
            )}
        </div>
    );
};

export default VendorReturnsPage;
