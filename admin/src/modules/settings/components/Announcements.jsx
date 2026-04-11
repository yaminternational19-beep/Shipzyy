import React, { useState, useMemo, useEffect } from 'react';
import { 
    Megaphone, 
    Users, 
    Bike, 
    Truck, 
    Search, 
    X, 
    Plus,
    History,
    MoreVertical,
    CheckCircle2,
    Clock,
    User,
    Send,
    Filter,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    RotateCcw
} from 'lucide-react';
import SettingTabs from './SettingTabs';

import { getAnnouncementsApi, createAnnouncementApi, updateAnnouncementApi, deleteAnnouncementApi, resendAnnouncementApi } from '../../../api/settings.api';

const Announcements = ({ onShowToast }) => {
    const [view, setView] = useState('list'); // 'list' or 'create'
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'customer', 'rider', 'vendor'
    const [activeMenu, setActiveMenu] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    
    // Pagination State
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Broadcast State
    const [targetType, setTargetType] = useState('ALL');
    const [targetDetail, setTargetDetail] = useState('ALL');
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Notification History (Expanded for pagination)
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, [activeTab, pagination.page, pagination.limit]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };
            
            // To make sure we fetch all if 'all' is selected, otherwise we filter by activeTab
            // In a real query, we'd pass target_type to backend. But wait, I didn't update the backend to accept target_type filters!
            // I'll fetch and we'll see. Wait, I should just pass target_type if needed.
            // Actually let me just pass target_type if activeTab is not 'all'.
            if (activeTab !== 'all') {
                params.target_type = activeTab.toUpperCase();
            }

            const response = await getAnnouncementsApi(params);
            if (response.data.success) {
                setHistory(response.data.data.map(item => ({
                    id: item.id,
                    title: item.title,
                    message: item.message,
                    target_type: item.target_type,
                    target_detail: item.target_detail,
                    targetedTo: item.targeted_to,
                    entity_id: item.entity_id,
                    entity_name: item.entity_name,
                    date: item.created_at,
                    status: item.status
                })));

                if (response.data.meta) {
                    setPagination(prev => ({
                        ...prev,
                        total: response.data.meta.totalRecords,
                        totalPages: response.data.meta.totalPages
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to fetch announcements", error);
            onShowToast("Failed to load announcements", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            onShowToast('Please enter both a title and message', 'warning');
            return;
        }

        if (targetDetail === 'SPECIFIC' && !selectedEntity) {
            onShowToast('Please select a specific recipient', 'warning');
            return;
        }

        let targetedToDisplay = '';
        if (targetDetail === 'ALL') {
             targetedToDisplay = targetType === 'ALL' ? 'All Members' : `All ${targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase()}s`;
        } else {
             targetedToDisplay = `${selectedEntity.name} (${targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase()})`;
        }

        try {
            setLoading(true);
            const payload = {
                title,
                message,
                target_type: targetType,
                target_detail: targetDetail,
                targeted_to: targetedToDisplay,
                entity_id: selectedEntity ? selectedEntity.id : null,
                entity_name: selectedEntity ? selectedEntity.name : null
            };

            if (editingId) {
                await updateAnnouncementApi(editingId, { title, message });
                onShowToast(`Announcement updated successfully!`, 'success');
            } else {
                await createAnnouncementApi(payload);
                onShowToast(`Announcement broadcasted successfully!`, 'success');
            }
            
            setMessage('');
            setTitle('');
            setEditingId(null);
            setView('list');
            fetchHistory(); // refresh the list
        } catch (error) {
            console.error("Failed to send/update broadcast", error);
            onShowToast(error.response?.data?.message || "Operation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history;

    const handleAction = async (e, action, item) => {
        e.stopPropagation();
        setActiveMenu(null);
        if (action === 'edit') {
            setTitle(item.title);
            setMessage(item.message);
            setTargetType(item.target_type);
            setTargetDetail(item.target_detail);
            if (item.entity_id) {
                setSelectedEntity({ id: item.entity_id, name: item.entity_name });
            }
            setEditingId(item.id);
            setView('create');
        } else if (action === 'delete') {
            if (window.confirm("Are you sure you want to delete this broadcast record?")) {
                try {
                    await deleteAnnouncementApi(item.id);
                    onShowToast(`Announcement deleted.`, 'info');
                    fetchHistory();
                } catch(err) {
                    onShowToast("Failed to delete", "error");
                }
            }
        } else if (action === 'resend') {
            try {
                await resendAnnouncementApi(item.id);
                onShowToast(`Announcement resent successfully!`, 'success');
            } catch(err) {
                onShowToast("Failed to resend", "error");
            }
        }
    };

    const renderList = () => (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <SettingTabs activeTab={activeTab} onTabChange={handleTabChange} />
                <button 
                    className="btn btn-primary" 
                    onClick={() => { setTitle(''); setMessage(''); setEditingId(null); setView('create'); }} 
                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <Plus size={16} /> New Broadcast
                </button>
            </div>

            <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
                {loading && history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading announcements...</div>
                ) : history.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No announcements found.</div>
                ) : history.map(item => (
                    <div key={item.id} className="history-item" style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'fit-content' }}>
                                <Megaphone size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{item.title}</h4>
                                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#475569', lineHeight: '1.5', maxWidth: '600px' }}>{item.message}</p>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={12} color="#64748b" />
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{item.targetedTo}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={14} color="#94a3b8" />
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#059669', backgroundColor: '#f0fdf4', padding: '2px 10px', borderRadius: '20px', fontWeight: 700, border: '1px solid #dcfce7' }}>{item.status}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(activeMenu === item.id ? null : item.id);
                                }}
                                style={{ border: 'none', background: '#f8fafc', color: '#94a3b8', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <MoreVertical size={18} />
                            </button>
                            
                            {activeMenu === item.id && (
                                <div className="action-dropdown" style={{ 
                                    position: 'absolute', 
                                    right: 0, 
                                    top: '100%', 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '10px', 
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                                    zIndex: 10,
                                    width: '160px',
                                    padding: '6px',
                                    marginTop: '8px',
                                    animation: 'fadeIn 0.2s ease'
                                }}>
                                    <button onClick={(e) => handleAction(e, 'edit', item)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: 500, borderRadius: '6px', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <Edit2 size={16} color="#64748b" /> Edit Message
                                    </button>
                                    <button onClick={(e) => handleAction(e, 'resend', item)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#334155', fontWeight: 500, borderRadius: '6px', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <RotateCcw size={16} color="#64748b" /> Resend Push
                                    </button>
                                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }}></div>
                                    <button onClick={(e) => handleAction(e, 'delete', item)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#ef4444', fontWeight: 600, borderRadius: '6px', textAlign: 'left' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <Trash2 size={16} color="#ef4444" /> Delete Record
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="c-pagination" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc', padding: '20px', borderRadius: '0 0 12px 12px', marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="c-pagination-info" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                    Showing <strong style={{ color: '#1e293b' }}>{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</strong> to <strong style={{ color: '#1e293b' }}>{Math.min(pagination.page * pagination.limit, pagination.total)}</strong> of <strong style={{ color: '#1e293b' }}>{pagination.total}</strong> broadcasts
                </span>
                <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className="c-page-btn"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: pagination.page === 1 ? '#f1f5f9' : 'white', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
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
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '8px', background: pagination.page === pagination.totalPages ? '#f1f5f9' : 'white', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderCreate = () => (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={() => { setView('list'); setEditingId(null); }} 
                        style={{ 
                            background: '#f1f5f9', 
                            border: '1px solid #e2e8f0', 
                            color: '#475569', 
                            cursor: 'pointer', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    >
                        <ArrowLeft size={18} /> Back to List
                    </button>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
                        {editingId ? 'Edit Broadcast' : 'Create New Broadcast'}
                    </h2>
                </div>
                <button className="btn btn-primary" onClick={handleSend} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                    <Send size={18} /> {loading ? 'Sending...' : (editingId ? 'Save Edits' : 'Send Announcement')}
                </button>
            </div>

            <div className="announcement-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="message-box">
                    <div className="form-group" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Broadcast Title</label>
                            <input 
                                type="text"
                                className="form-control"
                                placeholder="e.g. Flash Sale Alert!"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ fontSize: '15px', padding: '12px', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>Announcement Message</label>
                            <textarea 
                                className="form-control"
                                placeholder="Type your detailed message here... This will be sent as a push notification."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                style={{ flex: 1, minHeight: '300px', fontSize: '15px', padding: '20px', lineHeight: '1.6', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="target-sidebar" style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                     <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                        <Filter size={15} /> Select Audience
                    </h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <SettingTabs 
                            activeTab={targetType.toLowerCase()} 
                            onTabChange={(tab) => setTargetType(tab.toUpperCase())} 
                        />
                    </div>

                    {targetType !== 'ALL' && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <button className={`tab-btn ${targetDetail === 'ALL' ? 'active' : ''}`} onClick={() => setTargetDetail('ALL')} style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: targetDetail === 'ALL' ? '1px solid var(--primary-color)' : '1px solid #e2e8f0', backgroundColor: targetDetail === 'ALL' ? '#eff6ff' : 'white', fontWeight: 600 }}>All</button>
                            <button className={`tab-btn ${targetDetail === 'SPECIFIC' ? 'active' : ''}`} onClick={() => setTargetDetail('SPECIFIC')} style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: targetDetail === 'SPECIFIC' ? '1px solid var(--primary-color)' : '1px solid #e2e8f0', backgroundColor: targetDetail === 'SPECIFIC' ? '#eff6ff' : 'white', fontWeight: 600 }}>Specific</button>
                        </div>
                    )}

                    {targetDetail === 'SPECIFIC' && targetType !== 'ALL' && (
                        <div className="specific-search" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                            <div style={{ position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
                                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input type="text" placeholder="Search..." style={{ width: '100%', padding: '10px 10px 10px 36px', border: 'none', fontSize: '13px', outline: 'none' }} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            </div>
                            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', maxHeight: '350px' }}>
                                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                                    <Search size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                    <p style={{ fontSize: '13px' }}>Search functionality for specific recipients is being integrated.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</h4>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            <CheckCircle2 size={14} style={{ color: '#22c55e', marginRight: '6px', verticalAlign: 'middle' }} />
                            {targetDetail === 'ALL' ? `Broadcast to All ${targetType === 'ALL' ? 'Members' : targetType + 's'}` : `Message to: ${selectedEntity?.name || '...'}`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="announcements-container">
            {view === 'list' ? renderList() : renderCreate()}
        </div>
    );
};

export default Announcements;
