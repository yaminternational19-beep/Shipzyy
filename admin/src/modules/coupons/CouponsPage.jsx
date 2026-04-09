import React, { useState, useEffect } from 'react';
import { Plus, Ticket } from 'lucide-react';
import CouponList from './components/CouponList';
import CouponForm from './components/CouponForm';
import Toast from '../../components/common/Toast/Toast';
import { getCouponsApi, createCouponApi, updateCouponApi, deleteCouponApi, toggleCouponStatusApi } from '../../api/coupons.api';
import './Coupons.css';

const CouponsPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        status: 'All'
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchCoupons = async (params = {}) => {
        setLoading(true);
        try {
            const response = await getCouponsApi({
                ...params,
                search: filters.search || undefined,
                status: filters.status === 'All' ? undefined : filters.status
            });
            if (response.data.success) {
                setCoupons(response.data.data.records || []);
                setPagination(response.data.data.pagination || null);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to fetch coupons', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
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
            const response = await toggleCouponStatusApi(item.id);
            if (response.data.success) {
                showToast(response.data.message, 'success');
                fetchCoupons();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete coupon "${item.code}"?`)) {
            try {
                const response = await deleteCouponApi(item.id);
                if (response.data.success) {
                    showToast(response.data.message, 'success');
                    fetchCoupons();
                }
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete coupon', 'error');
            }
        }
    };

    const handleSave = async (data) => {
        try {
            let response;
            if (editingItem) {
                response = await updateCouponApi(editingItem.id, data);
            } else {
                response = await createCouponApi(data);
            }

            if (response.data.success) {
                showToast(response.data.message, 'success');
                setShowForm(false);
                setEditingItem(null);
                fetchCoupons();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save coupon', 'error');
            throw error;
        }
    };

    return (
        <div className="vendor-brands-container">
            <div className="vendor-brands-header">
                <div>
                    <h1 className="vendor-brand-title">
                        <Ticket size={28} color="var(--primary-color)" />
                        Coupons & Offers
                    </h1>
                    <p className="vendor-brand-subtitle">
                        Manage discount coupons and promotional offers
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add New Coupon
                </button>
            </div>

            <div className="vendor-brand-table-wrapper">
                <CouponList
                    coupons={coupons}
                    pagination={pagination}
                    filters={filters}
                    setFilters={setFilters}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onRefresh={fetchCoupons}
                />
            </div>

            {showForm && (
                <CouponForm
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

export default CouponsPage;
