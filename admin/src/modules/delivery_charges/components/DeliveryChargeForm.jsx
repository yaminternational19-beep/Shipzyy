import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DeliveryChargeForm = ({ initialData, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        type: 'Distance',
        area_name: '',
        min_distance: '',
        max_distance: '',
        charge_amount: '',
        min_order_amount: '',
        free_delivery_above: '',
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

    return (
        <div className="vendor-modal-overlay">
            <div className="vendor-modal-card">
                <div className="vendor-modal-header">
                    <h3>{initialData ? 'Edit Delivery Charge' : 'Add Delivery Charge'}</h3>
                    <button className="btn-icon" onClick={onCancel}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="vendor-modal-body">
                        <div className="vendor-form-group-full">
                            <label className="vendor-label">Charge Type <span className="vendor-required-star">*</span></label>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="Distance" 
                                        checked={formData.type === 'Distance'} 
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    />
                                    Distance Based
                                </label>
                                {/* <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input 
                                        type="radio" 
                                        name="type" 
                                        value="Area" 
                                        checked={formData.type === 'Area'} 
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    />
                                    Area Based
                                </label> */}
                            </div>
                        </div>

                        {/* {formData.type === 'Area' ? (
                            <div className="vendor-form-group-full">
                                <label className="vendor-label">Area Name <span className="vendor-required-star">*</span></label>
                                <input
                                    type="text"
                                    className="vendor-input"
                                    placeholder="E.g. Downtown, Westside..."
                                    value={formData.area_name}
                                    onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                                    required
                                />
                            </div>
                        ) : ( */}
                            <>
                                <div className="vendor-form-group">
                                    <label className="vendor-label">Min Distance (km) <span className="vendor-required-star">*</span></label>
                                    <input
                                        type="number"
                                        className="vendor-input"
                                        placeholder="0"
                                        value={formData.min_distance}
                                        onChange={(e) => setFormData({ ...formData, min_distance: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="vendor-form-group">
                                    <label className="vendor-label">Max Distance (km) <span className="vendor-required-star">*</span></label>
                                    <input
                                        type="number"
                                        className="vendor-input"
                                        placeholder="5"
                                        value={formData.max_distance}
                                        onChange={(e) => setFormData({ ...formData, max_distance: e.target.value })}
                                        required
                                    />
                                </div>
                            </>
                        {/* )} */}

                        <div className="vendor-form-group">
                            <label className="vendor-label">Charge Amount (₹) <span className="vendor-required-star">*</span></label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="40"
                                value={formData.charge_amount}
                                onChange={(e) => setFormData({ ...formData, charge_amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Min. Order Amount (₹)</label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="0"
                                value={formData.min_order_amount}
                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                            />
                        </div>
                        <div className="vendor-form-group">
                            <label className="vendor-label">Free Delivery Above (₹)</label>
                            <input
                                type="number"
                                className="vendor-input"
                                placeholder="500"
                                value={formData.free_delivery_above}
                                onChange={(e) => setFormData({ ...formData, free_delivery_above: e.target.value })}
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
                        <button type="submit" className="btn btn-primary">Save Charge</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeliveryChargeForm;
