import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import QuantityStats from './components/QuantityStats';
import QuantityList from './components/QuantityList';
import QuantityForm from './components/QuantityForm';
import Toast from '../../components/common/Toast/Toast';
import './quantity.css';

const INITIAL_DATA = [
    { id: 1, category: 'Vegetables', subCategory: 'Leafy Greens', name: 'Kilogram', shortCode: 'kg', status: 'Active', createdAt: '2024-03-01' },
    { id: 2, category: 'Spices & Herbs', subCategory: 'Powder Spices', name: 'Gram', shortCode: 'g', status: 'Active', createdAt: '2024-03-01' },
    { id: 3, category: 'Dairy & Eggs', subCategory: 'Milk', name: 'Liter', shortCode: 'l', status: 'Active', createdAt: '2024-03-02' },
    { id: 4, category: 'Dairy & Eggs', subCategory: 'Milk', name: 'Milliliter', shortCode: 'ml', status: 'Active', createdAt: '2024-03-02' },
    { id: 5, category: 'Bakery', subCategory: 'Bread', name: 'Piece', shortCode: 'pc', status: 'Active', createdAt: '2024-03-03' },
    { id: 6, category: 'Electronics', subCategory: 'Accessories', name: 'Box', shortCode: 'box', status: 'Inactive', createdAt: '2024-03-04' },
    { id: 7, category: 'Spices & Herbs', subCategory: 'Dried Herbs', name: 'Packet', shortCode: 'pkt', status: 'Active', createdAt: '2024-03-05' },
];

const Quantity = () => {
    const [units, setUnits] = useState(INITIAL_DATA);
    const [showForm, setShowForm] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleSave = (data) => {
        if (editingUnit) {
            setUnits(units.map(u => u.id === editingUnit.id ? { ...u, ...data } : u));
            showToast('Unit updated successfully!');
        } else {
            const newUnit = {
                ...data,
                id: Date.now(),
                createdAt: new Date().toISOString().split('T')[0]
            };
            setUnits([newUnit, ...units]);
            showToast('New unit added successfully!');
        }
        setShowForm(false);
        setEditingUnit(null);
    };

    const handleDelete = (id) => {
        setUnits(units.filter(u => u.id !== id));
        showToast('Unit deleted successfully!');
    };

    const toggleStatus = (unit) => {
        const newStatus = unit.status === 'Active' ? 'Inactive' : 'Active';
        setUnits(units.map(u => u.id === unit.id ? { ...u, status: newStatus } : u));
        showToast(`${unit.name} is now ${newStatus}`);
    };

    return (
        <div className="quantity-module management-module">
            <header className="quantity-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Quantity Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Define and manage measurement units for categories
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingUnit(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add New Unit
                </button>
            </header>

            <QuantityStats />

            <div style={{ marginTop: '24px' }}>
                <QuantityList
                    units={units}
                    onEdit={(unit) => { setEditingUnit(unit); setShowForm(true); }}
                    onDelete={handleDelete}
                    onToggleStatus={toggleStatus}
                    showToast={showToast}
                />
            </div>

            {showForm && (
                <QuantityForm
                    initialData={editingUnit}
                    onCancel={() => { setShowForm(false); setEditingUnit(null); }}
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

export default Quantity;
