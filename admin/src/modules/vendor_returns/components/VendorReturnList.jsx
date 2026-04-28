import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Filter, Eye, CheckCircle, PackageCheck, CreditCard, Square, CheckSquare, XCircle } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import { exportReturnsToPDF, exportReturnsToExcel } from '../services/return_export.service';
import { getVendorReturnsApi } from '../../../api/vendor_returns.api';

const VendorReturnList = ({ onFetchSuccess, onUpdateStatus, showToast }) => {
    const [returns, setReturns] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

    const fetchReturns = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getVendorReturnsApi({
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: statusFilter
            });
            setReturns(data.data.returns);
            setPagination(data.data.pagination);
            if (onFetchSuccess) onFetchSuccess(data.data);
        } catch (error) {
            showToast(error?.response?.data?.message || "Failed to fetch returns", "error");
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, search, statusFilter]);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSelectAll = async (checked) => {
        if (checked) {
            try {
                setLoading(true);
                const data = await getVendorReturnsApi({
                    limit: pagination.total || 1000,
                    search,
                    status: statusFilter
                });
                const allIds = (data.data.returns || []).map(r => r.return_id);
                setSelectedRows(allIds);
            } catch (error) {
                showToast('Failed to select all returns', 'error');
            } finally {
                setLoading(false);
            }
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
    };

    const handleExportDownload = (type) => {
        const dataToExport = returns.filter(r => selectedRows.includes(r.return_id));

        if (dataToExport.length === 0) {
            showToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportReturnsToPDF(dataToExport);
            } else if (type === 'excel') {
                exportReturnsToExcel(dataToExport);
            }
            showToast(`${type.toUpperCase()} exported successfully!`, 'success');
        } catch (error) {
            showToast('Failed to generate export file', 'error');
        }
    };

    const allSelected = returns.length > 0 && selectedRows.length === pagination.total;

    const getStatusBadge = (status) => {
        const colors = {
            'Requested': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-blue-100 text-blue-800',
            'Picked Up': 'bg-indigo-100 text-indigo-800',
            'Received': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800'
        };
        return <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
    };

    return (
        <div className="o-table-wrapper">
            <div className="order-filters-container">
                <div className="o-search">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Return ID, Product, Customer..." 
                        value={search}
                        onChange={handleSearch}
                    />
                </div>
                
                <div className="filter-group">
                    <select 
                        className="filter-select"
                        value={statusFilter} 
                        onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="Requested">Requested</option>
                        <option value="Approved">Approved</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="Received">Received</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="filter-actions" style={{ marginLeft: 'auto' }}>
                    <ExportActions
                        selectedCount={selectedRows.length}
                        onExport={showToast}
                        onDownload={handleExportDownload}
                    />
                </div>
            </div>

            <div className="o-table-container">
                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
                        <p style={{ color: '#64748b', fontWeight: 500 }}>Loading returns...</p>
                    </div>
                ) : (
                    <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px 12px', textAlign: 'left', width: '40px' }}>
                                    <div onClick={() => handleSelectAll(!allSelected)} style={{ cursor: 'pointer' }}>
                                        {allSelected && pagination.total > 0
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>IMAGE</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RETURN & PRODUCT</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CUSTOMER</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>QTY</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PRICE</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>REASON</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RETURN IMAGES</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>STATUS</th>
                                <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.length === 0 ? (
                                <tr>
                                    <td colSpan="10" style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                                        No returns found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                returns.map(ret => (
                                    <tr key={ret.return_id} className="table-row-hover" style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div onClick={() => handleSelectOne(ret.return_id)} style={{ cursor: 'pointer' }}>
                                                {selectedRows.includes(ret.return_id)
                                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                                    : <Square size={17} color="#94a3b8" />
                                                }
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <img 
                                                src={ret.featured_image || 'https://via.placeholder.com/40'} 
                                                alt={ret.product_name} 
                                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }} 
                                            />
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.8rem' }}>
                                                    #{ret.return_id} (Ord: {ret.order_number})
                                                </span>
                                                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.2 }}>
                                                    {ret.product_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#334155' }}>{ret.customer_name}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ret.customer_phone}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600 }}>{ret.quantity}</td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, color: '#4f46e5' }}>₹{ret.price}</td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }} title={ret.reason}>
                                                {ret.reason}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '120px', margin: '0 auto' }}>
                                                {(() => {
                                                    let imageArray = [];
                                                    try {
                                                        if (Array.isArray(ret.images)) {
                                                            imageArray = ret.images;
                                                        } else if (typeof ret.images === 'string') {
                                                            imageArray = JSON.parse(ret.images);
                                                        }
                                                    } catch (e) {
                                                        imageArray = [];
                                                    }

                                                    return imageArray && imageArray.length > 0 ? imageArray.map((img, idx) => (
                                                        <img 
                                                            key={idx} 
                                                            src={img} 
                                                            alt={`Return proof ${idx + 1}`} 
                                                            style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #e2e8f0' }}
                                                            onClick={() => window.open(img, '_blank')}
                                                        />
                                                    )) : (
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No Images</span>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            {getStatusBadge(ret.return_status)}
                                        </td>
                                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                            <div className="action-buttons-group">
                                                {ret.return_status === 'Requested' && (
                                                    <>
                                                        <button onClick={() => onUpdateStatus(ret.return_id, 'Approved')} className="action-view-btn" style={{ color: '#16a34a', borderColor: '#bcf0da' }} title="Approve Return">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button onClick={() => onUpdateStatus(ret.return_id, 'Rejected')} className="action-view-btn" style={{ color: '#dc2626', borderColor: '#fecaca' }} title="Reject Return">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {ret.return_status === 'Approved' && (
                                                    <>
                                                        <button onClick={() => onUpdateStatus(ret.return_id, 'Picked Up')} className="action-view-btn" style={{ color: '#6366f1', borderColor: '#c7d2fe' }} title="Mark as Picked Up">
                                                            <PackageCheck size={16} />
                                                        </button>
                                                        <button onClick={() => onUpdateStatus(ret.return_id, 'Rejected')} className="action-view-btn" style={{ color: '#dc2626', borderColor: '#fecaca' }} title="Reject Return">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {ret.return_status === 'Picked Up' && (
                                                    <button onClick={() => onUpdateStatus(ret.return_id, 'Received')} className="action-view-btn" style={{ color: '#16a34a', borderColor: '#bcf0da' }} title="Mark as Received (Restocks item)">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                <span className="c-pagination-info">
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total || 0)}–{Math.min(pagination.page * pagination.limit, pagination.total || 0)} of {pagination.total || 0} returns
                </span>
                <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                        className="c-page-btn"
                        disabled={pagination.page === 1 || loading} 
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    >
                        Prev
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                        {pagination.page} / {pagination.totalPages || 1}
                    </span>
                    <button 
                        className="c-page-btn"
                        disabled={pagination.page === pagination.totalPages || loading} 
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    >
                        Next
                    </button>
                </div>
            </div>

            <style>{`
                .table-row-hover:hover { background: #f8fafc; }
                .o-table-wrapper { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                
                .action-buttons-group {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    align-items: center;
                }

                .action-view-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-view-btn:hover {
                    background: #f8fafc;
                    border-color: #cbd5e1;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
            `}</style>
        </div>
    );
};

export default VendorReturnList;
