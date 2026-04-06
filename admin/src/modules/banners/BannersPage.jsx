import React, { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import BannerList from './components/BannerList';
import BannerForm from './components/BannerForm';
import Toast from '../../components/common/Toast/Toast';
import { getBannersApi, createBannerApi, updateBannerApi, deleteBannerApi } from '../../api/banners.api';
import './Banners.css';

const BannersPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [banners, setBanners] = useState([]);
    const [stats, setStats] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedRows, setSelectedRows] = useState([]);
    const [filters, setFilters] = useState({
        search: ''
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const fetchBanners = async (params = {}) => {
        setLoading(true);
        try {
            const response = await getBannersApi(params);
            if (response.data.success) {
                setBanners(response.data.data.records || []);
                setStats(response.data.data.stats || null);
                setPagination(response.data.data.pagination || null);
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to fetch banners', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to delete "${item.banner_name}"?`)) {
            try {
                const response = await deleteBannerApi(item.id);
                if (response.data.success) {
                    showToast(response.data.message, 'success');
                    fetchBanners();
                }
            } catch (error) {
                showToast(error.response?.data?.message || 'Failed to delete banner', 'error');
            }
        }
    };

    const handleSelectAll = async (e) => {
        const checked = e?.target?.checked;
        if (!checked) {
            setSelectedRows([]);
            return;
        }

        try {
            setLoading(true);
            const params = {
                limit: pagination?.totalRecords || 1000,
                search: filters.search || undefined
            };

            const response = await getBannersApi(params);
            if (response.data.success) {
                const allIds = (response.data.data.records || []).map(b => b.id);
                setSelectedRows(allIds);
            }
        } catch (error) {
            console.error('Select All Error:', error);
            showToast('Failed to select all banners', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (data) => {
        try {
            const formData = new FormData();
            formData.append('banner_name', data.banner_name);
            formData.append('description', data.description || '');
            if (data.imageFile) {
                formData.append('banner_image', data.imageFile);
            }

            let response;
            if (editingItem) {
                response = await updateBannerApi(editingItem.id, formData);
            } else {
                response = await createBannerApi(formData);
            }

            if (response.data.success) {
                showToast(response.data.message, 'success');
                setShowForm(false);
                setEditingItem(null);
                fetchBanners();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to save banner', 'error');
            throw error;
        }
    };

    return (
        <div className="vendor-brands-container">
            <div className="vendor-brands-header">
                <div>
                    <h1 className="vendor-brand-title">
                        <ImageIcon size={28} color="var(--primary-color)" />
                        Banner Management
                    </h1>
                    <p className="vendor-brand-subtitle">
                        Manage app banners for promotions and highlights
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add New Banner
                </button>
            </div>

            <BannerList
                banners={banners}
                pagination={pagination}
                filters={filters}
                setFilters={setFilters}
                loading={loading}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                onSelectAll={handleSelectAll}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRefresh={fetchBanners}
                showToast={showToast}
            />

            {showForm && (
                <BannerForm
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

export default BannersPage;
