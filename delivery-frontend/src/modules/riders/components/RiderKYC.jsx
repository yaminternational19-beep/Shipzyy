import React, { useState } from 'react';
import { X, CheckCircle, AlertOctagon, FileText, Download, Hash, User, Mail, Phone, Bike, MapPin } from 'lucide-react';

const RiderKYC = ({ rider, onClose, onApprove, onReject }) => {
    const [rejectionReason, setRejectionReason] = useState('');
    if (!rider) return null;

    return (
        <div className="kyc-modal-overlay">
            <div className="kyc-modal-content">
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>KYC Document Verification</h2>
                        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                            Reviewing documents for <strong style={{ color: 'var(--primary-color)' }}>{rider.name}</strong> ({rider.id})
                        </p>
                    </div>
                    <button className="icon-btn-sm" onClick={onClose} style={{ width: '40px', height: '40px' }}><X size={24} /></button>
                </div>

                <div className="kyc-body" style={{ background: '#fafbfc' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '40px' }}>
                        {/* Personal Details */}
                        <div>
                            <h3 className="section-title"><User size={16} /> Personal Summary</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Full Name</label>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={14} color="var(--primary-color)" /> {rider.name}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Email Address</label>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Mail size={14} color="var(--primary-color)" /> {rider.email}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Phone Number</label>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Phone size={14} color="var(--primary-color)" /> {rider.phone}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Vehicle Type</label>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Bike size={14} color="var(--primary-color)" /> {rider.vehicle || 'Motorcycle'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>Living Address</label>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={14} color="var(--primary-color)" /> Sector 45, DLF Phase 1, Gurgaon, HR
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        <div>
                            <h3 className="section-title"><FileText size={16} /> Uploaded Documents</h3>
                            <div className="kyc-document-grid">
                                <div className="kyc-doc-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Driver's License (Front)</span>
                                        <button className="icon-btn-sm" style={{ width: '32px', height: '32px' }}><Download size={14} /></button>
                                    </div>
                                    <div className="kyc-doc-image">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={40} color="#cbd5e1" />
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview not available</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="kyc-doc-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Driver's License (Back)</span>
                                        <button className="icon-btn-sm" style={{ width: '32px', height: '32px' }}><Download size={14} /></button>
                                    </div>
                                    <div className="kyc-doc-image">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={40} color="#cbd5e1" />
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview not available</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="kyc-doc-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Identity Proof (Adhaar/ID)</span>
                                        <button className="icon-btn-sm" style={{ width: '32px', height: '32px' }}><Download size={14} /></button>
                                    </div>
                                    <div className="kyc-doc-image">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={40} color="#cbd5e1" />
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview not available</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="kyc-doc-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Vehicle RC</span>
                                        <button className="icon-btn-sm" style={{ width: '32px', height: '32px' }}><Download size={14} /></button>
                                    </div>
                                    <div className="kyc-doc-image">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <FileText size={40} color="#cbd5e1" />
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Preview not available</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Rejection Reason (Optional)</h4>
                        <textarea
                            placeholder="Type the reason for rejection here... (e.g., Blur documents, invalid ID)"
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                minHeight: '100px',
                                fontSize: '0.9rem',
                                outline: 'none',
                                background: '#f8fafc',
                                transition: 'all 0.2s',
                                resize: 'vertical'
                            }}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                    </div>

                    <div style={{
                        marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--border-color)',
                        display: 'flex', gap: '16px', justifyContent: 'flex-end'
                    }}>
                        <button
                            className="btn btn-secondary"
                            style={{ color: '#ef4444', borderColor: '#fee2e2' }}
                            onClick={() => onReject(rider, rejectionReason)}
                        >
                            <AlertOctagon size={18} />
                            Reject KYC
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ background: '#10b981', border: 'none' }}
                            onClick={() => onApprove(rider)}
                        >
                            <CheckCircle size={18} />
                            Approve & Verify
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiderKYC;
