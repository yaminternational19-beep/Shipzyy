import React from 'react';
import { Search, X } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import ExportActions from '../../../components/common/ExportActions';

const ProductFilters = ({ 
    filters, 
    setFilters, 
    onClear, 
    selectedCount = 0, 
    onExport, 
    onDownload,
    vendorList = [],
    categoryList = [],
    brandList = []
}) => {

    const handleChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const hasActiveFilters = filters.search || filters.category || filters.vendor ||
        filters.brand || filters.isApproved;

    return (
        <div className="product-filters-container">

            {/* ── Row: Search + Dropdowns + Export ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px', flexWrap: 'wrap' }}>

                {/* Left: Search + Dropdowns */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>

                    {/* Search */}
                    <div className="p-search" style={{ minWidth: '220px', maxWidth: '280px' }}>
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search product, brand..."
                            value={filters.search}
                            onChange={(e) => handleChange('search', e.target.value)}
                        />
                    </div>

                    {/* Vendor */}
                    <select
                        className="filter-select"
                        value={filters.vendor}
                        onChange={(e) => handleChange('vendor', e.target.value)}
                    >
                        <option value="">All Companies</option>
                        {vendorList.map(vendor => (
                            <option key={vendor.id} value={vendor.id}>{vendor.business_name}</option>
                        ))}
                    </select>

                    {/* Category */}
                    <select
                        className="filter-select"
                        value={filters.category}
                        onChange={(e) => handleChange('category', e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categoryList.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    {/* Brand */}
                    <select
                        className="filter-select"
                        value={filters.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                    >
                        <option value="">All Brands</option>
                        {brandList.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        className="filter-select"
                        value={filters.isApproved}
                        onChange={(e) => handleChange('isApproved', e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="false">Pending</option>
                        <option value="true">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>



                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <ActionButton
                            icon={X}
                            onClick={onClear}
                            variant="delete"
                            tooltip="Clear All Filters"
                            size={15}
                        />
                    )}
                </div>

                {/* Right: Export — shared component */}
                <ExportActions
                    selectedCount={selectedCount}
                    onExport={onExport}
                    onDownload={onDownload}
                />
            </div>

        </div>
    );
};

export default ProductFilters;
