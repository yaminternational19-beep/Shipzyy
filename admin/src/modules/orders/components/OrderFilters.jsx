import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

const OrderFilters = ({ filters, setFilters, onClear, selectedCount, onExport }) => {

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="order-filters-container" style={{ minWidth: '1100px' }}>
            {/* Search */}
            <div className="o-search" style={{ width: '200px' }}>
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search order, customer…"
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                />
            </div>

            {/* Filters Group */}
            <div className="filter-group">
                {/* Order Status */}
                <div className="input-with-icon">
                    <Filter size={14} className="field-icon" />
                    <select
                        className="filter-select"
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Payment Status */}
                <select
                    className="filter-select"
                    value={filters.payment_status}
                    onChange={(e) => handleChange('payment_status', e.target.value)}
                >
                    <option value="">All Payments</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                </select>

                {/* Date Range */}
                <div className="date-inputs">
                    <Calendar size={14} color="#94a3b8" />
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => handleChange('fromDate', e.target.value)}
                    />
                    <span style={{ color: '#cbd5e1' }}>–</span>
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => handleChange('toDate', e.target.value)}
                    />
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="filter-clear-btn"
                        title="Clear Filters"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            <div className="filter-actions" style={{ marginLeft: 'auto' }}>
                <ExportActions selectedCount={selectedCount} onExport={onExport} />
            </div>
        </div>
    );
};

export default OrderFilters;
