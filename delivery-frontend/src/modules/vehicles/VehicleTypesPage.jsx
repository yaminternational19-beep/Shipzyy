import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import VehicleStats from './components/VehicleStats';
import VehicleList from './components/VehicleList';
import VehicleForm from './components/VehicleForm';
import Toast from '../../components/common/Toast/Toast';
import './Vehicles.css';

const VehicleTypesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);
        setShowForm(true);
    };

    const handleToggleStatus = (id) => {
        showToast('Vehicle status updated successfully', 'success');
    };

    const handleSaveVehicle = (data) => {
        setShowForm(false);
        setEditingVehicle(null);
        showToast(`Vehicle type "${data.name}" has been ${editingVehicle ? 'updated' : 'registered'} successfully!`, 'success');
    };

    return (
        <div className="vehicles-module management-module">
            <div className="vehicles-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Vehicle Type Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage your fleet categories and availability
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => { setEditingVehicle(null); setShowForm(true); }}
                >
                    <Plus size={18} /> Add Vehicle Type
                </button>
            </div>

            <VehicleStats />

            <div style={{ marginTop: '24px' }}>
                <VehicleList
                    onEdit={handleEditVehicle}
                    onToggleStatus={handleToggleStatus}
                    showToast={showToast}
                />
            </div>

            {showForm && (
                <VehicleForm
                    initialData={editingVehicle}
                    onCancel={() => { setShowForm(false); setEditingVehicle(null); }}
                    onSave={handleSaveVehicle}
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

export default VehicleTypesPage;
