import React from 'react';
import { X, MapPin, Phone, Mail, Bike, Calendar, ShieldCheck, Star, Clock, UserX, Hash, ChevronRight } from 'lucide-react';

const RiderProfileModal = ({ rider, onClose, onTerminate }) => {
    if (!rider) return null;

    // Mock ride history if not provided
    const rides = [
        { id: '#ORD-1234', date: '17 Feb 2026', customer: 'John Doe', location: 'Worli, Mumbai', status: 'Delivered', amount: '$12.50' },
        { id: '#ORD-1235', date: '16 Feb 2026', customer: 'Sarah Smith', location: 'Bandra, Mumbai', status: 'Delivered', amount: '$8.20' },
        { id: '#ORD-1236', date: '16 Feb 2026', customer: 'Mike Ross', location: 'Dadar, Mumbai', status: 'Delivered', amount: '$15.00' },
    ];

    return (
        <div className="modal-overlay">
            <div className="rider-view-modal">
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div className="profile-large-avatar">
                            {rider.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>{rider.name}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className="rider-id-badge" style={{ margin: 0 }}>{rider.id}</span>
                                <span className={`badge ${rider.riderStatus === 'Active' ? 'success' : rider.riderStatus === 'Terminated' ? 'error' : 'secondary'}`} style={{ fontSize: '0.7rem' }}>
                                    {rider.riderStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="icon-btn-sm" onClick={onClose} style={{ width: '40px', height: '40px' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ background: '#fafbfc' }}>
                    <div className="profile-grid">
                        <div className="profile-left">
                            <h3 className="section-title"><Hash size={16} /> Personal Details</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="detail-item"><Phone size={18} /> {rider.phone}</div>
                                <div className="detail-item"><Mail size={18} /> {rider.email}</div>
                                <div className="detail-item"><MapPin size={18} /> {rider.city}, {rider.state}</div>
                                <div className="detail-item"><Calendar size={18} /> Joined {rider.joinedDate}</div>
                            </div>

                            <h3 className="section-title" style={{ marginTop: '32px' }}><Bike size={16} /> Vehicle Information</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div className="detail-item"><Bike size={18} /> {rider.vehicle || 'Not Assigned'}</div>
                                <div className="detail-item"><ShieldCheck size={18} /> Plate: {rider.vehicleNumber || 'N/A'}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '40px' }}>
                                <h3 className="section-title">Manage Account</h3>
                                <button
                                    className="btn btn-secondary"
                                    style={{ width: '100%', color: '#ef4444', borderColor: '#fecaca' }}
                                    onClick={() => {
                                        if (window.confirm(`Are you sure you want to terminate rider ${rider.name}?`)) {
                                            onTerminate(rider.id);
                                            onClose();
                                        }
                                    }}
                                >
                                    <UserX size={18} /> Terminate Account
                                </button>
                            </div>
                        </div>

                        <div className="profile-right">
                            <h3 className="section-title">Performance Metrics</h3>
                            <div className="stats-mini-grid">
                                <div className="stat-card-small">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#eef2ff', padding: '10px', borderRadius: '12px', color: '#6366f1' }}>
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <div className="stat-val">124</div>
                                            <div className="stat-lbl">Total Rides</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="stat-card-small">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ background: '#fffbeb', padding: '10px', borderRadius: '12px', color: '#f59e0b' }}>
                                            <Star size={20} />
                                        </div>
                                        <div>
                                            <div className="stat-val">4.8</div>
                                            <div className="stat-lbl">Rating</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 className="section-title" style={{ margin: 0 }}>Recent Ride History</h3>
                                    <button className="text-btn" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>View All <ChevronRight size={14} /></button>
                                </div>
                                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    <table className="dashboard-table sm">
                                        <thead>
                                            <tr>
                                                <th>ORDER ID</th>
                                                <th>CUSTOMER</th>
                                                <th>LOCATION</th>
                                                <th>STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rides.map(ride => (
                                                <tr key={ride.id}>
                                                    <td style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{ride.id}</td>
                                                    <td style={{ fontSize: '0.8rem' }}>{ride.customer}</td>
                                                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{ride.location}</td>
                                                    <td>
                                                        <span className="badge success" style={{ fontSize: '0.65rem', padding: '2px 8px' }}>{ride.status}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderProfileModal;
