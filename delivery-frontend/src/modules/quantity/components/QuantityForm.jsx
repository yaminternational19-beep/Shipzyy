import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

const CATEGORIES_DATA = {
    'Electronics': ['Mobile Phones', 'Laptops', 'Smart Watches', 'Accessories'],
    'Spices & Herbs': ['Dried Herbs', 'Seeds', 'Powder Spices'],
    'Vegetables': ['Leafy Greens', 'Root Vegetables', 'Potatoes'],
    'Fruits': ['Fresh Fruits', 'Dry Fruits', 'Tropical Fruits'],
    'Dairy & Eggs': ['Milk', 'Cheese', 'Butter'],
    'Bakery': ['Bread', 'Cakes', 'Pastries']
};

const QuantityForm = ({ initialData, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        shortCode: '',
        category: '',
        subCategory: '',
        status: 'Active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleCategoryChange = (val) => {
        setFormData({ ...formData, category: val, subCategory: '' });
    };

    return (
        <div className="q-modal-overlay">
            <div className="q-modal-card">
                <div className="q-modal-header">
                    <h3>
                        {initialData ? 'Edit Quantity Unit' : 'Add New Unit'}
                    </h3>
                    <button className="icon-btn-sm" onClick={onCancel}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="q-modal-body">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="q-form-group">
                                <label>Category *</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="q-input"
                                        style={{ appearance: 'none' }}
                                        value={formData.category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {Object.keys(CATEGORIES_DATA).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                </div>
                            </div>

                            <div className="q-form-group">
                                <label>Sub Category *</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="q-input"
                                        style={{ appearance: 'none' }}
                                        value={formData.subCategory}
                                        onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                                        required
                                        disabled={!formData.category}
                                    >
                                        <option value="">Select Sub Category</option>
                                        {formData.category && CATEGORIES_DATA[formData.category].map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="q-form-group">
                                <label>Unit Name *</label>
                                <input
                                    type="text"
                                    className="q-input"
                                    placeholder="e.g. Kilogram"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="q-form-group">
                                <label>Unit Code *</label>
                                <input
                                    type="text"
                                    className="q-input"
                                    placeholder="e.g. kg"
                                    value={formData.shortCode}
                                    onChange={(e) => setFormData({ ...formData, shortCode: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="q-form-group">
                            <label>Status</label>
                            <div className="q-status-group">
                                <label className="q-status-option">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Active"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Active
                                </label>
                                <label className="q-status-option">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Inactive"
                                        checked={formData.status === 'Inactive'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Inactive
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="q-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {initialData ? 'Update Unit' : 'Create Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuantityForm;
