import React from 'react';
import { Edit2, Trash2, Search, Filter, RefreshCw, CheckCircle2, XCircle, MapPin, Ruler, Power } from 'lucide-react';

const DeliveryChargeList = ({
    deliveryCharges,
    pagination,
    filters,
    setFilters,
    loading,
    onEdit,
    onDelete,
    onToggleStatus,
    onRefresh
}) => {
    return (
        <div className="delivery-charge-list-container">
            <div className="vendor-table-controls">
                <div className="vendor-controls-left">
                    <div className="vendor-search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by area or range..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <div className="vendor-filter-select">
                        <Filter className="field-icon" size={16} />
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                    <button className="btn-icon" onClick={() => onRefresh()} title="Refresh">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <table className="vendor-brand-table">
                <thead>
                    <tr>
                        <th>Calculation Type</th>
                        <th>Distance Range</th>
                        <th>Delivery Fee</th>
                        <th>Min. Order Required</th>
                        <th>Free Delivery Eligibility</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="vendor-empty-state">Loading delivery charges...</td>
                        </tr>
                    ) : deliveryCharges.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="vendor-empty-state">No delivery charges defined</td>
                        </tr>
                    ) : (
                        deliveryCharges.map((charge) => (
                            <tr key={charge.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', fontWeight: '500' }}>
                                        <Ruler size={16} /> Distance Based
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {charge.min_distance} km to {charge.max_distance} km
                                    </span>
                                </td>
                                <td style={{ fontWeight: '700', color: '#0f172a' }}>
                                    ₹{charge.charge_amount}
                                </td>
                                <td>
                                    ₹{charge.min_order_amount || 0}
                                </td>
                                <td>
                                    {charge.free_delivery_above ? (
                                        <span style={{ color: '#059669', fontStyle: 'italic' }}>
                                            Free above ₹{charge.free_delivery_above}
                                        </span>
                                    ) : (
                                        <span style={{ color: '#94a3b8' }}>No free delivery</span>
                                    )}
                                </td>
                                <td>
                                    <span 
                                        className={`status-badge ${charge.status.toLowerCase()}`}
                                        onClick={() => onToggleStatus(charge)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {charge.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {charge.status}
                                    </span>
                                </td>
                                <td className="vendor-col-actions">
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button 
                                            className={`btn-icon ${charge.status === 'Active' ? 'active-toggle' : 'inactive-toggle'}`} 
                                            onClick={() => onToggleStatus(charge)}
                                            title={charge.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power size={16} color={charge.status === 'Active' ? '#10b981' : '#ef4444'} />
                                        </button>
                                        <button className="btn-icon" onClick={() => onEdit(charge)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => onDelete(charge)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
                <div className="vendor-pagination">
                    <div className="vendor-pagination-info">
                        Showing {deliveryCharges.length} of {pagination.totalRecords} records
                    </div>
                    <div className="vendor-pagination-btns">
                        <button 
                            className="vendor-page-btn"
                            disabled={pagination.currentPage === 1}
                            onClick={() => onRefresh({ page: pagination.currentPage - 1 })}
                        >
                            Previous
                        </button>
                        <button 
                            className="vendor-page-btn"
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => onRefresh({ page: pagination.currentPage + 1 })}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryChargeList;
