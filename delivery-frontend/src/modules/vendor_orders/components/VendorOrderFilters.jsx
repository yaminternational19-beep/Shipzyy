import React from 'react';
import { Search, X, Calendar } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

const VendorOrderFilters = ({ filters, setFilters, onClear, onExport, selectedCount }) => {
    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="order-filters-container">
            <div className="o-search">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search Order ID, Customer..."
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                />
            </div>

            <div className="filter-group">
                <select
                    className="filter-select"
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="Picked">Picked</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.paymentStatus || ''}
                    onChange={(e) => handleChange('paymentStatus', e.target.value)}
                >
                    <option value="">Payment Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                </select>

                <div className="date-inputs">
                    <Calendar size={16} color="#94a3b8" />
                    <input
                        type="date"
                        value={filters.fromDate || ''}
                        onChange={(e) => handleChange('fromDate', e.target.value)}
                        placeholder="From"
                    />
                    <span style={{ color: '#cbd5e1' }}>-</span>
                    <input
                        type="date"
                        value={filters.toDate || ''}
                        onChange={(e) => handleChange('toDate', e.target.value)}
                        placeholder="To"
                    />
                </div>

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

export default VendorOrderFilters;

