import React, { useState } from 'react';
import { Plus, Award } from 'lucide-react';
import BrandStats from './components/BrandStats';
import BrandList from './components/BrandList';
import BrandForm from './components/BrandForm';
import Toast from '../../components/common/Toast/Toast';
import './Brands.css';

const BrandsPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setShowForm(true);
    };

    const handleDelete = (item) => {
        showToast(`Brand "${item.name}" has been deleted.`, 'success');
    };

    const handleSave = (data) => {
        setShowForm(false);
        setEditingItem(null);
        showToast(`Brand "${data.name}" has been ${editingItem ? 'updated' : 'created'} successfully!`, 'success');
    };

    return (
        <div className="brands-module">
            <div className="brands-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Award size={28} color="var(--primary-color)" />
                        Brand Management
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage product brands and their associated categories/sub-categories
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingItem(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add New Brand
                </button>
            </div>

            <BrandStats />

            <div style={{ marginTop: '24px' }}>
                <BrandList
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    showToast={showToast}
                />
            </div>

            {showForm && (
                <BrandForm
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

export default BrandsPage;
