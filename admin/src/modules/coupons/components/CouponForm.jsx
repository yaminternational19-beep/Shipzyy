import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CouponForm = ({ initialData, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        description: '',
        discount_type: 'Percentage',
        discount_value: '',
        min_order_value: '',
        max_discount_amount: '',
        usage_limit: '',
        expiry_date: '',
        status: 'Active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                expiry_date: initialData.expiry_date ? initialData.expiry_date.split('T')[0] : ''
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="vendor-modal-overlay">
            <div className="vendor-modal-card">
                <div className="vendor-modal-header">
                    <h3>{initialData ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                    <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="vendor-modal-body">
                        <div className="vendor-form-group">
                            <label className="vendor-label">Coupon Code <span className="vendor-required-star">*</span></label>
                            <input
                                type="text"
                                className="vendor-input"
                                placeholder="E.g. SAVE50"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                required
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Title <span className="vendor-required-star">*</span></label>
                            <input
                                type="text"
                                className="vendor-input"
                                placeholder="Offer Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="vendor-form-group-full">
                            <label className="vendor-label">Description</label>
                            <textarea
                                className="vendor-input"
                                placeholder="Details about this offer..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ minHeight: '80px', resize: 'vertical' }}
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Discount Type <span className="vendor-required-star">*</span></label>
                            <select
                                className="vendor-input"
                                value={formData.discount_type}
                                onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                            >
                                <option value="Percentage">Percentage (%)</option>
                                <option value="Fixed">Fixed Amount (₹)</option>
                            </select>
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Discount Value <span className="vendor-required-star">*</span></label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="E.g. 10"
                                value={formData.discount_value}
                                onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                required
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Min. Order Value</label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="₹ 0.00"
                                value={formData.min_order_value}
                                onChange={(e) => setFormData({ ...formData, min_order_value: e.target.value })}
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Max. Discount</label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="₹ 0.00"
                                value={formData.max_discount_amount}
                                onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                disabled={formData.discount_type === 'Fixed'}
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Usage Limit</label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="Per User / Total"
                                value={formData.usage_limit}
                                onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Expiry Date</label>
                            <input
                                type="date"
                                className="vendor-input"
                                value={formData.expiry_date}
                                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Status</label>
                            <select
                                className="vendor-input"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="vendor-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Coupon</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponForm;
