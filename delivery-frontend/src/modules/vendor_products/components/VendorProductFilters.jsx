import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

const VendorProductFilters = ({ filters, setFilters, categories, brands, onClear, selectedCount, onExport }) => {

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = Object.values(filters).some(Boolean);

    return (
        <div className="product-filters-container">
            {/* Search */}
            <div className="p-search">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search by product, brand, id..."
                    value={filters.search || ''}
                    onChange={(e) => handleChange('search', e.target.value)}
                />
            </div>

            <div className="filter-group">
                {/* Category */}
                <div className="input-with-icon">
                    <Filter size={14} className="field-icon" />
                    <select
                        className="filter-select"
                        value={filters.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {Object.keys(categories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Brand */}
                <select
                    className="filter-select"
                    value={filters.brand || ''}
                    onChange={(e) => handleChange('brand', e.target.value)}
                >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>

                {/* Stock Filter */}
                <select
                    className="filter-select"
                    value={filters.stock || ''}
                    onChange={(e) => handleChange('stock', e.target.value)}
                >
                    <option value="">Stock Status</option>
                    <option value="high">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                </select>

                {/* Status Filter */}
                <select
                    className="filter-select"
                    value={filters.status || ''}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">Approval Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>

                {/* Clear Button */}
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

export default VendorProductFilters;
