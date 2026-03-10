
import React from 'react';
import { X, Bike, Phone, Star, MapPin } from 'lucide-react';

const MOCK_RIDERS = [
    { id: 1, name: "Ravi Sharma", phone: "+91 98765 43210", status: "Available", activeOrders: 1, rating: 4.8 },
    { id: 2, name: "Imran Khan", phone: "+91 87654 32109", status: "Busy", activeOrders: 3, rating: 4.5 },
    { id: 3, name: "Suresh Reddy", phone: "+91 76543 21098", status: "Available", activeOrders: 0, rating: 4.9 },
    { id: 4, name: "Amit Patel", phone: "+91 65432 10987", status: "Available", activeOrders: 2, rating: 4.7 }
];

const AssignRiderModal = ({ order, onClose, onAssign }) => {
    if (!order) return null;

    return (
        <div className="rider-modal-overlay">
            <div className="rider-modal-content" style={{ maxWidth: '600px', width: '95%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Assign Rider</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>Order: #{order.id} | Amount: ₹{order.totalAmount || order.finalTotal}</p>
                    </div>
                    <button onClick={onClose} style={{ padding: '8px', borderRadius: '10px', border: 'none', background: '#f1f5f9', cursor: 'pointer' }}>
                        <X size={20} color="#64748b" />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {MOCK_RIDERS.map(rider => {
                        const isAvailable = rider.status === 'Available';

                        return (
                            <div key={rider.id} style={{
                                padding: '20px',
                                background: 'white',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                transition: '0.2s',
                                opacity: isAvailable ? 1 : 0.6
                            }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: isAvailable ? '#f5f3ff' : '#f1f5f9',
                                    color: isAvailable ? '#6366f1' : '#94a3b8',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Bike size={24} />
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{rider.name}</h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700 }}>
                                            <Star size={10} fill="#b45309" /> {rider.rating}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Phone size={12} /> {rider.phone}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: isAvailable ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                            • {rider.status}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                                        Active Orders: <span style={{ fontWeight: 700, color: '#475569' }}>{rider.activeOrders}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => isAvailable && onAssign(rider)}
                                    disabled={!isAvailable}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: isAvailable ? '#6366f1' : '#e2e8f0',
                                        color: 'white',
                                        fontWeight: 700,
                                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Assign
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <MapPin size={20} color="#6366f1" />
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                        Assigning a rider will notify them immediately and set order status to <span style={{ fontWeight: 700, color: '#4f46e5' }}>"Assigned"</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssignRiderModal;
