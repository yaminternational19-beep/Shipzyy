import React, { useState } from 'react';
import { UserCheck, Loader2 } from 'lucide-react';
import VendorOrderStats from './components/VendorOrderStats';
import VendorOrderList from './components/VendorOrderList';
import AssignRiderModal from './components/AssignRiderModal';
import Toast from '../../components/common/Toast/Toast';
import * as ordersService from './services/orders.service';
import './VendorOrders.css';

const VendorOrdersPage = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, delivered: 0 });
    const [assigningOrder, setAssigningOrder] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [refreshKey, setRefreshKey] = useState(0);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleFetchSuccess = (data) => {
        if (data.stats) {
            setStats({
                total: data.stats.total || 0,
                pending: data.stats.pending || 0,
                assigned: (data.stats.confirmed || 0) + (data.stats.shipped || 0) + (data.stats.out_for_delivery || 0),
                delivered: data.stats.delivered || 0
            });
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const response = await ordersService.updateOrderStatus(orderId, newStatus);
            showToast(response.message);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            showToast(error.message || "Failed to update status", "error");
        }
    };

    const handleAssignRider = (rider) => {
        // Logic for persisting rider assignment would go here
        setAssigningOrder(null);
        setRefreshKey(prev => prev + 1);
        showToast(`Rider ${rider.name} assigned successfully`);
    };

    return (
        <div className="vendor-orders-module management-module">
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Order Dispatch
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        {stats.pending} new orders waiting for rider assignment
                    </p>
                </div>
            </div>

            {/* Stats Summary */}
            <VendorOrderStats stats={stats} />

            {/* Unified Table Section */}
            <div className="vendor-orders-table-section">
                <VendorOrderList
                    key={refreshKey}
                    onAssignRider={setAssigningOrder}
                    onUpdateStatus={handleUpdateStatus}
                    onFetchSuccess={handleFetchSuccess}
                    showToast={showToast}
                />
            </div>

            {/* Modals */}
            {assigningOrder && (
                <AssignRiderModal
                    order={assigningOrder}
                    onClose={() => setAssigningOrder(null)}
                    onAssign={handleAssignRider}
                />
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default VendorOrdersPage;

