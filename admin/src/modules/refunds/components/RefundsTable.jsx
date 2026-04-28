import React, { useState, useMemo } from 'react';
import { 
    Search, Filter, Eye, X, CheckCircle, XCircle, 
    ChevronLeft, ChevronRight, Square, CheckSquare, 
    Calendar, Download, RefreshCw, FileText, 
    ArrowUpRight, AlertCircle, Clock, Check
} from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

const RefundsTable = ({ refunds, title, onShowToast }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [actionModal, setActionModal] = useState({ open: false, refund: null });
    const [adminNotes, setAdminNotes] = useState('');
    const [localRefunds, setLocalRefunds] = useState(refunds);
    
    // Pagination & Selection State
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRefunds, setSelectedRefunds] = useState([]);
    const itemsPerPage = 8;

    // Stats Calculation
    const stats = useMemo(() => {
        const filtered = localRefunds;
        return {
            total: filtered.length,
            pending: filtered.filter(r => r.status === 'Pending').length,
            approved: filtered.filter(r => r.status === 'Approved').length,
            rejected: filtered.filter(r => r.status === 'Rejected').length,
            totalAmount: filtered.reduce((acc, r) => acc + r.amount, 0)
        };
    }, [localRefunds]);

    const filteredRefunds = localRefunds.filter(r => {
        const matchesSearch = (r.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                              (r.id?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                              (r.orderId?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                              (r.userId?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter ? r.status === statusFilter : true;
        
        let matchesDate = true;
        if (fromDate) {
            matchesDate = matchesDate && new Date(r.date) >= new Date(fromDate);
        }
        if (toDate) {
            matchesDate = matchesDate && new Date(r.date) <= new Date(toDate);
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredRefunds.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRefunds.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (totalPages || 1)) {
            setCurrentPage(page);
        }
    };

    // Selection logic
    const allSelectedInCurrentPage = currentItems.length > 0 && currentItems.every(r => selectedRefunds.includes(r.id));

    const handleSelectAll = () => {
        if (allSelectedInCurrentPage) {
            setSelectedRefunds(prev => prev.filter(id => !currentItems.find(r => r.id === id)));
        } else {
            const currentIds = currentItems.map(r => r.id);
            setSelectedRefunds(prev => [...new Set([...prev, ...currentIds])]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedRefunds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleViewAction = (refund) => {
        setActionModal({ open: true, refund });
        setAdminNotes(refund.adminNotes || '');
    };

    const handleProcessRefund = (statusAction) => {
        if (statusAction !== 'Pending' && !adminNotes.trim()) {
            onShowToast('Please provide admin notes before approving or rejecting.', 'warning');
            return;
        }

        setLocalRefunds(prev => prev.map(r => {
            if (r.id === actionModal.refund.id) {
                return {
                    ...r,
                    status: statusAction,
                    adminNotes
                };
            }
            return r;
        }));

        onShowToast(`Refund ${statusAction} successfully!`, 'success');
        setActionModal({ open: false, refund: null });
    };

    const handleBulkAction = (status) => {
        if (selectedRefunds.length === 0) return;
        
        setLocalRefunds(prev => prev.map(r => {
            if (selectedRefunds.includes(r.id)) {
                return { ...r, status, adminNotes: `Bulk ${status} action performed.` };
            }
            return r;
        }));

        onShowToast(`${selectedRefunds.length} refunds ${status.toLowerCase()} successfully!`, 'success');
        setSelectedRefunds([]);
    };

    const handleExport = (message, type) => {
        onShowToast(message, type);
    };

    const handleDownload = (type) => {
        onShowToast(`Downloading ${selectedRefunds.length || filteredRefunds.length} refunds as ${type.toUpperCase()}...`, 'success');
    };

    return (
        <div className="refunds-content">
            {/* Stats Overview */}
            <div className="refund-stats-grid">
                <div className="refund-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Requests</div>
                    </div>
                </div>
                <div className="refund-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fffbeb', color: '#d97706' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.pending}</div>
                        <div className="stat-label">Pending Reviews</div>
                    </div>
                </div>
                <div className="refund-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.approved}</div>
                        <div className="stat-label">Processed</div>
                    </div>
                </div>
                <div className="refund-stat-card">
                    <div className="stat-icon-wrapper" style={{ background: '#fdf2f8', color: '#db2777' }}>
                        <ArrowUpRight size={24} />
                    </div>
                    <div className="stat-info">
                        <div className="stat-value">₹{stats.totalAmount.toLocaleString()}</div>
                        <div className="stat-label">Total Value</div>
                    </div>
                </div>
            </div>

            <div className="refund-table-wrapper">
                <div className="v-table-controls" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div className="c-search" style={{ minWidth: '300px' }}>
                                <Search className="search-icon" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Order, or Name..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{ border: 'none', width: '100%', outline: 'none', background: 'transparent' }}
                                />
                            </div>
                            
                            <div className="input-with-icon" style={{ width: '160px' }}>
                                <Filter size={15} className="field-icon" style={{ left: '12px' }} />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="filter-select"
                                    style={{ paddingLeft: '36px' }}
                                >
                                    <option value="">All Status</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                    <option value="Rejected">Rejected</option>
                                </select>
                            </div>

                            <div className="date-filter-group" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '0 12px', borderRadius: '10px', border: '1px solid #e2e8f0', height: '42px' }}>
                                <Calendar size={15} color="#94a3b8" />
                                <input 
                                    type="date" 
                                    value={fromDate} 
                                    onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                                    style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', color: '#475569', outline: 'none' }}
                                />
                                <span style={{ color: '#cbd5e1' }}>-</span>
                                <input 
                                    type="date" 
                                    value={toDate} 
                                    onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                                    style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', color: '#475569', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {selectedRefunds.length > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={() => handleBulkAction('Approved')}
                                        style={{ padding: '8px 16px', fontSize: '12px', background: '#10b981' }}
                                    >
                                        Approve ({selectedRefunds.length})
                                    </button>
                                    <button 
                                        className="btn btn-danger" 
                                        onClick={() => handleBulkAction('Rejected')}
                                        style={{ padding: '8px 16px', fontSize: '12px' }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            ) : (
                                <ExportActions 
                                    selectedCount={selectedRefunds.length} 
                                    onExport={handleExport}
                                    onDownload={handleDownload}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th style={{ width: '50px', textAlign: 'center' }}>
                                    <div onClick={handleSelectAll} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                        {allSelectedInCurrentPage ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="#94a3b8" />}
                                    </div>
                                </th>
                                <th>Transaction</th>
                                <th>User Details</th>
                                <th>Reason</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date Requested</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(refund => (
                                <tr key={refund.id} className={selectedRefunds.includes(refund.id) ? 'selected-row' : ''}>
                                    <td style={{ textAlign: 'center' }}>
                                        <div onClick={() => handleSelectOne(refund.id)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                            {selectedRefunds.includes(refund.id) ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="#94a3b8" />}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{refund.id}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>Ref: {refund.orderId}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '12px', fontWeight: 700, color: '#475569'
                                            }}>
                                                {refund.userName.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>{refund.userName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{refund.userPhone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                                            {refund.reasonCategory || 'General'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{refund.reason}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 800, color: '#0f172a' }}>₹{refund.amount.toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${refund.status === 'Approved' ? 'status-approved' : refund.status === 'Rejected' ? 'status-blocked' : 'status-pending'}`}>
                                            {refund.status === 'Pending' && <Clock size={12} />}
                                            {refund.status === 'Approved' && <Check size={12} />}
                                            {refund.status === 'Rejected' && <AlertCircle size={12} />}
                                            {refund.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                                            {new Date(refund.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                            {new Date(refund.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button 
                                            onClick={() => handleViewAction(refund)}
                                            className="action-btn-view"
                                            style={{ 
                                                padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0',
                                                background: 'white', color: '#475569', cursor: 'pointer',
                                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                                fontSize: '0.75rem', fontWeight: 700, transition: 'all 0.2s'
                                            }}
                                        >
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="c-pagination" style={{ padding: '16px 20px', background: '#f8fafc' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                        Showing <strong>{indexOfFirstItem + 1}</strong>-<strong>{Math.min(indexOfLastItem, filteredRefunds.length)}</strong> of <strong>{filteredRefunds.length}</strong>
                    </span>
                    <div className="c-pagination-btns">
                        <button 
                            className="c-page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={currentPage === i + 1 ? 'active' : ''}
                                    style={{ 
                                        width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                        background: currentPage === i + 1 ? 'var(--primary)' : 'transparent',
                                        color: currentPage === i + 1 ? 'white' : '#64748b',
                                        fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button 
                            className="c-page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Action Modal */}
            {actionModal.open && actionModal.refund && (
                <div className="modal-overlay" onClick={() => setActionModal({ open: false, refund: null })}>
                    <div className="modal-content admin-form-modal" style={{ maxWidth: '600px', width: '95%' }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Refund Request Details</h2>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0' }}>Review and settle the refund claim</p>
                            </div>
                            <button className="close-btn" onClick={() => setActionModal({ open: false, refund: null })} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>
                        
                        <div className="modal-body" style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Reference Details</span>
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{actionModal.refund.id}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Order: {actionModal.refund.orderId}</div>
                                    </div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800 }}>Refund Amount</span>
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>₹{actionModal.refund.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Item-level partial refund</div>
                                    </div>
                                </div>
                            </div>

                            {/* Itemized Detail */}
                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>REFUNDED ITEMS</span>
                                {actionModal.refund.items?.map((item, idx) => (
                                    <div key={idx} className="item-preview-card">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="item-img-small" />
                                        ) : (
                                            <div className="item-img-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <AlertCircle size={20} color="#cbd5e1" />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qty: {item.qty} × ₹{item.price.toLocaleString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>₹{(item.qty * item.price).toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>CLAIM REASON</span>
                                <div style={{ marginTop: '8px', padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', color: '#92400e', fontSize: '0.85rem', lineHeight: '1.5' }}>
                                    <strong style={{ display: 'block', marginBottom: '4px' }}>{actionModal.refund.reasonCategory}</strong>
                                    {actionModal.refund.reason}
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '8px', display: 'block' }}>ADMIN SETTLEMENT NOTES</label>
                                <textarea 
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Provide detailed justification for approval or rejection..."
                                    disabled={actionModal.refund.status !== 'Pending'}
                                    style={{ 
                                        width: '100%', minHeight: '100px', padding: '12px', borderRadius: '12px', 
                                        border: '1px solid #e2e8f0', background: actionModal.refund.status !== 'Pending' ? '#f8fafc' : 'white',
                                        fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="modal-footer" style={{ padding: '20px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <button 
                                className="btn" 
                                onClick={() => setActionModal({ open: false, refund: null })}
                                style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, padding: '10px 20px' }}
                            >
                                Back to List
                            </button>
                            
                            {actionModal.refund.status === 'Pending' ? (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        onClick={() => handleProcessRefund('Rejected')}
                                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontWeight: 800, padding: '10px 24px', borderRadius: '10px', cursor: 'pointer' }}
                                    >
                                        Reject Claim
                                    </button>
                                    <button 
                                        onClick={() => handleProcessRefund('Approved')}
                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 800, padding: '10px 24px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    >
                                        Settle Refund
                                    </button>
                                </div>
                            ) : (
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '8px', 
                                    color: actionModal.refund.status === 'Approved' ? '#059669' : '#dc2626',
                                    fontWeight: 800, fontSize: '0.9rem'
                                }}>
                                    {actionModal.refund.status === 'Approved' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    Settled as {actionModal.refund.status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RefundsTable;
