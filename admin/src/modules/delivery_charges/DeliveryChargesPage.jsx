import React, { useState, useEffect } from 'react';
import { Plus, Truck } from 'lucide-react';
import DeliveryChargeList from './components/DeliveryChargeList';
import DeliveryChargeForm from './components/DeliveryChargeForm';
import Toast from '../../components/common/Toast/Toast';
import { getDeliveryChargesApi, createDeliveryChargeApi, updateDeliveryChargeApi, deleteDeliveryChargeApi, toggleDeliveryChargeStatusApi } from '../../api/delivery_charges.api';
import './DeliveryCharges.css';

const DeliveryChargesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deliveryCharges, setDeliveryCharges] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'All'
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchDeliveryCharges = async (params = {}) => {
        setLoading(true);
        try {
            const response = await getDeliveryChargesApi({
                ...params,
                search: filters.search || undefined,
                status: filters.status === 'All' ? undefined : filters.status
            });
            if (response.data.success) {
                setDeliveryCharges(response.data.data.records || []);
                setPagination(response.data.data.pagination || null);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to fetch delivery charges', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveryCharges();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleToggleStatus = async (item) => {
        try {
            const response = await toggleDeliveryChargeStatusApi(item.id);
            if (response.data.success) {
                showToast(response.data.message, 'success');
                fetchDeliveryCharges();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete delivery charge for "${item.area_name || item.distance_range}"?`)) {
            try {
                const response = await deleteDeliveryChargeApi(item.id);
                if (response.data.success) {
                    showToast(response.data.message, 'success');
                    fetchDeliveryCharges();
                }
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete delivery charge', 'error');
            }
        }
    };

    const handleSave = async (data) => {
        try {
            let response;
            if (editingItem) {
                response = await updateDeliveryChargeApi(editingItem.id, data);
            } else {
                response = await createDeliveryChargeApi(data);
            }

            if (response.data.success) {
                showToast(response.data.message, 'success');
                setShowForm(false);
                setEditingItem(null);
                fetchDeliveryCharges();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save delivery charge', 'error');
            throw error;
        }
    };

    return (
        <div className="vendor-brands-container">
            <div className="vendor-brands-header">
                <div>
                    <h1 className="vendor-brand-title">
                        <Truck size={28} color="var(--primary-color)" />
                        Delivery Charges
                    </h1>
                    <p className="vendor-brand-subtitle">
                        Manage delivery fees based on distance or areas
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add Delivery Charge
                </button>
            </div>

            <div className="vendor-brand-table-wrapper">
                <DeliveryChargeList
                    deliveryCharges={deliveryCharges}
                    pagination={pagination}
                    filters={filters}
                    setFilters={setFilters}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onRefresh={fetchDeliveryCharges}
                />
            </div>

            {showForm && (
                <DeliveryChargeForm
                    initialData={editingItem}
                    onCancel={() => { setShowForm(false); setEditingItem(null); }}
                    onSave={handleSave}
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

export default DeliveryChargesPage;
