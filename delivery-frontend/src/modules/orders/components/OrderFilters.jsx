import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

const OrderFilters = ({ filters, setFilters, onClear, selectedCount, onExport }) => {

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="order-filters-container" style={{ minWidth: '1500px' }}>
            {/* Search */}
            <div className="o-search">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search by customer, item, brand, or vendor..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                />
            </div>

            {/* Filters Group */}
            <div className="filter-group">
                <div className="input-with-icon">
                    <Filter size={14} className="field-icon" />
                    <select
                        className="filter-select"
                        value={filters.vendor}
                        onChange={(e) => handleChange('vendor', e.target.value)}
                    >
                        <option value="">All Vendors</option>
                        <option value="Tech Mart">Tech Mart</option>
                        <option value="Fashion Ave">Fashion Ave</option>
                        <option value="Global Electronics">Global Electronics</option>
                    </select>
                </div>

                <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Accessories">Accessories</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.subCategory}
                    onChange={(e) => handleChange('subCategory', e.target.value)}
                >
                    <option value="">All Sub Categories</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Footwear">Footwear</option>
                </select>

                <select
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="delivered">Delivered</option>
                    <option value="on-the-way">On the Way</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
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
