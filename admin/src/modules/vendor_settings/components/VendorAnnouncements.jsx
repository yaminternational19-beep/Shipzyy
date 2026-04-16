import React, { useState, useEffect } from 'react';
import { Megaphone, Clock, User, Loader2, ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import { getAnnouncementsApi } from '../../../api/settings.api';

const VendorAnnouncements = ({ showToast }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchAnnouncements();
    }, [pagination.page]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                target_type: 'VENDOR'
            };

            const res = await getAnnouncementsApi(params);
            if (res.data?.success) {
                setAnnouncements(res.data.data);
                if (res.data.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: res.data.meta.totalRecords,
                        totalPages: res.data.meta.totalPages
                    }));
                }
            }
        } catch (error) {
            console.error('Failed to fetch vendor announcements:', error);
            showToast('Failed to load announcements', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && announcements.length === 0) {
        return (
            <div className="legal-loading">
                <Loader2 className="animate-spin" size={40} color="#6366f1" />
                <p style={{ marginTop: '12px', fontWeight: 600 }}>Loading announcements...</p>
            </div>
        );
    }

    return (
        <div className="vendor-announcements-module" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div className="announcements-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
                {announcements.length > 0 ? (
                    announcements.map((item) => (
                        <div 
                            key={item.id} 
                            className="history-item" 
                            style={{ 
                                backgroundColor: 'white', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '12px', 
                                padding: '16px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start', 
                                position: 'relative', 
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedAnnouncement(item)}
                        >
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ 
                                    backgroundColor: '#eff6ff', 
                                    color: '#3b82f6', 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: 'fit-content' 
                                }}>
                                    <Megaphone size={24} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{item.title}</h4>
                                    <p style={{ 
                                        margin: '0 0 12px 0', 
                                        fontSize: '14px', 
                                        color: '#475569', 
                                        lineHeight: '1.5', 
                                        maxWidth: '800px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {item.message}
                                    </p>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <User size={12} color="#64748b" />
                                            </div>
                                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{item.targeted_to || "All Vendors"}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} color="#94a3b8" />
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                {new Date(item.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <span style={{ 
                                            fontSize: '11px', 
                                            color: '#059669', 
                                            backgroundColor: '#f0fdf4', 
                                            padding: '2px 10px', 
                                            borderRadius: '20px', 
                                            fontWeight: 700, 
                                            border: '1px solid #dcfce7',
                                            textTransform: 'capitalize'
                                        }}>
                                            {item.status || "delivered"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ alignSelf: 'center', color: '#cbd5e1' }}>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                        <Megaphone size={40} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                        <p style={{ color: '#94a3b8' }}>No announcements found for your account.</p>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.total > 0 && (
                <div className="c-pagination" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '20px', borderRadius: '0 0 12px 12px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="c-pagination-info" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                        Showing <strong style={{ color: '#1e293b' }}>{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</strong> to <strong style={{ color: '#1e293b' }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong style={{ color: '#1e293b' }}>{pagination.total}</strong> broadcasts
                    </span>
                    <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page === 1}
                            onClick={(e) => { e.stopPropagation(); setPagination(prev => ({ ...prev, page: prev.page - 1 })); }}
                            style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: pagination.page === 1 ? '#f1f5f9' : 'white', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-color)' }}>{pagination.page}</span>
                            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>{pagination.totalPages || 1}</span>
                        </div>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                            onClick={(e) => { e.stopPropagation(); setPagination(prev => ({ ...prev, page: prev.page + 1 })); }}
                            style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: pagination.page === pagination.totalPages ? '#f1f5f9' : 'white', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div className="ticket-modal-overlay" onClick={() => setSelectedAnnouncement(null)}>
                    <div className="ticket-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
                        <div className="ticket-modal-header">
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Megaphone size={20} color="#3b82f6" />
                                Announcement Details
                            </h3>
                            <button className="modal-close-btn" onClick={() => setSelectedAnnouncement(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="ticket-modal-body" style={{ padding: '32px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>{selectedAnnouncement.title}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={16} color="#94a3b8" />
                                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                        {new Date(selectedAnnouncement.created_at).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={16} color="#94a3b8" />
                                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{selectedAnnouncement.targeted_to}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '1.05rem', color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                                {selectedAnnouncement.message}
                            </div>
                        </div>
                        <div className="ticket-modal-footer">
                            <button 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 700 }}
                                onClick={() => setSelectedAnnouncement(null)}
                            >
                                Mark as Read
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorAnnouncements;
