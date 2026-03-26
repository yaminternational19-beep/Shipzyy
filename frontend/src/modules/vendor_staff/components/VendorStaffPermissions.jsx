import React, { useState, useEffect } from 'react';
import { X, Shield, Check } from 'lucide-react';
import { menuItems } from '../../../utils/menuConfig';

const VendorStaffPermissions = ({ user, onClose, onSave }) => {
    // Generate modules from sidebar menu configuration
    const modules = React.useMemo(() => {
        const config = menuItems.map(item => ({
            id: item.key.toLowerCase(),
            name: item.name,
            desc: item.description || `Access to ${item.name} module`
        }));
        // Filter out duplicate modules based on ID
        return Array.from(new Map(config.map(m => [m.id, m])).values());
    }, []);

    const [permissions, setPermissions] = useState([]);

    // Reset permissions when user changes, filtering for valid module IDs
    useEffect(() => {
        if (user) {
            const validIds = modules.map(m => m.id);
            const filteredPermissions = (user.permissions || []).filter(id => validIds.includes(id));
            setPermissions(filteredPermissions);
        }
    }, [user, modules]);

    const handleToggle = (id) => {
        setPermissions(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    };

    const handleFullAccess = () => {
        // If all modules are selected, clear all. Otherwise, select all.
        if (permissions.length === modules.length) {
            setPermissions([]);
        } else {
            setPermissions(modules.map(m => m.id));
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content wide" style={{ height: 'auto', maxHeight: '95vh', maxWidth: '1100px', width: '95%' }}>
                <div className="modal-header" style={{ padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Shield size={28} color="#4f46e5" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#111827', fontWeight: 800 }}>Access Permissions</h3>
                            <p style={{ margin: 0, fontSize: '0.95rem', color: '#64748b' }}>Configure system module access for <strong>{user?.name}</strong></p>
                        </div>
                    </div>
                    <button className="toast-close" onClick={onClose} style={{ fontSize: '28px', color: '#94a3b8' }}>&times;</button>
                </div>

                <div className="modal-body" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', background: '#f8fafc', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div>
                            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>Global Access Control</span>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>{permissions.length} modules currently granted to this staff member</p>
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ height: '42px', padding: '0 20px', fontSize: '13px', fontWeight: 700 }}
                            onClick={handleFullAccess}
                        >
                            {permissions.length === modules.length ? 'Revoke All Access' : 'Grant Full Management Access'}
                        </button>
                    </div>

                    <div className="permission-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                        {modules.map(module => (
                            <div
                                key={module.id}
                                className={`permission-item ${permissions.includes(module.id) ? 'active' : ''}`}
                                onClick={() => handleToggle(module.id)}
                                style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: permissions.includes(module.id) ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                    background: permissions.includes(module.id) ? '#f5f3ff' : 'white',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div className={`checkbox-circle ${permissions.includes(module.id) ? 'checked' : ''}`} style={{ width: '24px', height: '24px' }}>
                                    {permissions.includes(module.id) && <Check size={16} strokeWidth={3} />}
                                </div>
                                <div className="permission-info">
                                    <strong style={{ fontSize: '1rem', color: permissions.includes(module.id) ? '#4f46e5' : '#1e293b', transition: 'color 0.2s' }}>{module.name}</strong>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{module.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '40px', padding: '32px 0 0 0', borderTop: '2px solid #f1f5f9' }}>
                        <button
                            className="btn btn-secondary"
                            style={{ flex: 1, height: '52px', fontSize: '15px', fontWeight: 700, borderRadius: '12px' }}
                            onClick={onClose}
                        >
                            Discard Changes
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 2, height: '52px', fontSize: '15px', fontWeight: 700, borderRadius: '12px', background: '#4f46e5', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)' }}
                            onClick={() => onSave(permissions)}
                        >
                            Update System Permissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorStaffPermissions;
