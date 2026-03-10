import React, { useState, useEffect } from 'react';
import { X, Bike, Truck, Car, ShoppingBag } from 'lucide-react';

const VehicleForm = ({ initialData, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        iconType: 'Bike',
        status: 'Active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                description: initialData.description || '',
                iconType: initialData.iconType || 'Bike',
                status: initialData.status || 'Active'
            });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="veh-modal-overlay">
            <div className="veh-modal-card">
                {/* Header */}
                <div className="veh-modal-header">
                    <h3>{initialData ? 'Update Vehicle Type' : 'Register New Vehicle'}</h3>
                    <button className="icon-btn-sm" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit}>
                    <div className="veh-modal-body">

                        {/* Vehicle Category Name */}
                        <div className="veh-form-group">
                            <label>Vehicle Category Name</label>
                            <input
                                type="text"
                                className="veh-input"
                                placeholder="e.g. Electric Scooter"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div className="veh-form-group">
                            <label>Description</label>
                            <textarea
                                className="veh-input"
                                rows="3"
                                placeholder="Explain the typical use case for this vehicle..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                required
                                style={{ resize: 'none' }}
                            />
                        </div>

                        {/* Representative Icon */}
                        <div className="veh-form-group">
                            <label>Representative Icon</label>
                            <select
                                className="veh-input"
                                value={formData.iconType}
                                onChange={e => setFormData({ ...formData, iconType: e.target.value })}
                            >
                                <option value="Bike">Motorbike / Bicycle</option>
                                <option value="ShoppingBag">Light Carrier</option>
                                <option value="Car">Sedan / Hatchback</option>
                                <option value="Truck">Heavy Truck</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div className="veh-form-group">
                            <label>Fleet Status</label>
                            <div className="veh-status-group">
                                <label className="veh-status-option">
                                    <input
                                        type="radio"
                                        name="vehStatus"
                                        value="Active"
                                        checked={formData.status === 'Active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Active
                                </label>
                                <label className="veh-status-option">
                                    <input
                                        type="radio"
                                        name="vehStatus"
                                        value="Inactive"
                                        checked={formData.status === 'Inactive'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    Inactive
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="veh-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {initialData ? 'Save Changes' : 'Register Type'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;
