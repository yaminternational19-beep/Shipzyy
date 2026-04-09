import React from 'react';
import { Edit2, Trash2, Search, Filter, RefreshCw, CheckCircle2, XCircle, Power } from 'lucide-react';

const CouponList = ({
    coupons,
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
        <div className="coupon-list-container">
            <div className="vendor-table-controls">
                <div className="vendor-controls-left">
                    <div className="vendor-search-box">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by code or title..."
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
                        <th>Coupon Code</th>
                        <th>Title</th>
                        <th>Discount</th>
                        <th>Type</th>
                        <th>Usage Limit</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="8" className="vendor-empty-state">Loading coupons...</td>
                        </tr>
                    ) : coupons.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="vendor-empty-state">No coupons found</td>
                        </tr>
                    ) : (
                        coupons.map((coupon) => (
                            <tr key={coupon.id}>
                                <td>
                                    <span className="vendor-brand-badge">{coupon.code}</span>
                                </td>
                                <td>{coupon.title}</td>
                                <td>
                                    {coupon.discount_type === 'Percentage' 
                                        ? `${coupon.discount_value}%` 
                                        : `₹${coupon.discount_value}`}
                                </td>
                                <td>{coupon.type || 'General'}</td>
                                <td>{coupon.usage_limit || 'Unlimited'}</td>
                                <td>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'No Expiry'}</td>
                                <td>
                                    <span 
                                        className={`status-badge ${coupon.status.toLowerCase()}`}
                                        onClick={() => onToggleStatus(coupon)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {coupon.status === 'Active' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                        {coupon.status}
                                    </span>
                                </td>
                                <td className="vendor-col-actions">
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button 
                                            className={`btn-icon ${coupon.status === 'Active' ? 'active-toggle' : 'inactive-toggle'}`} 
                                            onClick={() => onToggleStatus(coupon)}
                                            title={coupon.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power size={16} color={coupon.status === 'Active' ? '#10b981' : '#ef4444'} />
                                        </button>
                                        <button className="btn-icon" onClick={() => onEdit(coupon)}>
                                            <Edit2 size={16} />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => onDelete(coupon)}>
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
                        Showing {coupons.length} of {pagination.totalRecords} records
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

export default CouponList;
