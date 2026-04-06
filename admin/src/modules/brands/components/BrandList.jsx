import React, { useState } from 'react';
import {
    Search, Filter, ListTree,
    CheckSquare, Square, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';
import { exportBrandsToPDF, exportBrandsToExcel } from '../services/export.service';

const BrandList = ({
    brands = [],
    categories = [],
    subCategories = [],
    pagination = null,
    filters = {
        search: '',
        status: 'All',
        categoryId: 'All',
        subCategoryId: 'All'
    },
    setFilters,
    loading = false,
    selectedRows = [],
    setSelectedRows,
    onSelectAll,
    onEdit,
    onDelete,
    onToggleStatus,
    onRefresh,
    showToast
}) => {
    // ── Helpers ──────────────────────────────────────────────────
    // Use == (loose) because API returns numeric IDs but select stores strings
    // eslint-disable-next-line eqeqeq
    const getCategoryName = (catId) => {
        // eslint-disable-next-line eqeqeq
        const cat = categories.find(c => c.id == catId);
        return cat ? cat.name : catId || '-';
    };

    const getSubCategoryName = (scId) => {
        // eslint-disable-next-line eqeqeq
        const sc = subCategories.find(s => s.id == scId);
        return sc ? sc.name : scId || '-';
    };

    // Sub-categories filtered by selected category — use == to handle number vs string
    const filteredSubCatOptions = subCategories.filter(sc =>
        // eslint-disable-next-line eqeqeq
        filters.categoryId === 'All' || sc.categoryId == filters.categoryId
    );

    // ── Selection ─────────────────────────────────────────────────
    const toggleSelectAll = () => {
        const total = pagination?.totalRecords || 0;
        const isCurrentlyFullySelected = selectedRows.length === total && total > 0;
        if (onSelectAll) {
            onSelectAll(!isCurrentlyFullySelected);
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    // ── API-driven handlers  ───────────────────────────────────────
    const handlePageChange = (newPage) => {
        onRefresh({
            page: newPage,
            search: filters.search,
            status: filters.status === 'All' ? '' : filters.status,
            categoryId: filters.categoryId === 'All' ? '' : filters.categoryId,
            subCategoryId: filters.subCategoryId === 'All' ? '' : filters.subCategoryId
        });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        const newFilters = { ...filters, search: value };
        setFilters(newFilters);
        onRefresh({
            page: 1,
            search: value,
            status: filters.status === 'All' ? '' : filters.status,
            categoryId: filters.categoryId === 'All' ? '' : filters.categoryId,
            subCategoryId: filters.subCategoryId === 'All' ? '' : filters.subCategoryId
        });
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        const newFilters = { ...filters, status: value };
        setFilters(newFilters);
        onRefresh({
            page: 1,
            search: filters.search,
            status: value === 'All' ? '' : value,
            categoryId: filters.categoryId === 'All' ? '' : filters.categoryId,
            subCategoryId: filters.subCategoryId === 'All' ? '' : filters.subCategoryId
        });
    };

    const handleCategoryFilter = (e) => {
        const value = e.target.value;
        const newFilters = { ...filters, categoryId: value, subCategoryId: 'All' };
        setFilters(newFilters);
        onRefresh({
            page: 1,
            search: filters.search,
            status: filters.status === 'All' ? '' : filters.status,
            categoryId: value === 'All' ? '' : value,
            subCategoryId: ''
        });
    };

    const handleSubCategoryFilter = (e) => {
        const value = e.target.value;
        const newFilters = { ...filters, subCategoryId: value };
        setFilters(newFilters);
        onRefresh({
            page: 1,
            search: filters.search,
            status: filters.status === 'All' ? '' : filters.status,
            categoryId: filters.categoryId === 'All' ? '' : filters.categoryId,
            subCategoryId: value === 'All' ? '' : value
        });
    };

    // ── Export ────────────────────────────────────────────────────
    const handleExportDownload = (type) => {
        const selectedData = brands.filter(b => selectedRows.includes(b.id));

        if (selectedData.length === 0) {
            showToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportBrandsToPDF(selectedData);
                showToast(`Exported ${selectedData.length} records as PDF successfully!`, 'success');
            } else if (type === 'excel') {
                exportBrandsToExcel(selectedData);
                showToast(`Exported ${selectedData.length} records as Excel successfully!`, 'success');
            }
        } catch (error) {
            console.error('Export Error:', error);
            showToast('Failed to generate export file. Please try again.', 'error');
        }
    };

    return (
        <>

            {/* ── Controls Bar ── */}
            <div className="vendor-table-controls">
                <div className="vendor-controls-left">
                    <div className="vendor-search-box">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by brand name or ID..."
                            value={filters.search}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="vendor-filter-select vendor-w-190">
                        <Layers size={15} className="field-icon" />
                        <select
                            value={filters.categoryId}
                            onChange={handleCategoryFilter}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="vendor-filter-select vendor-w-190">
                        <ListTree size={15} className="field-icon" />
                        <select
                            value={filters.subCategoryId}
                            onChange={handleSubCategoryFilter}
                            disabled={filters.categoryId === 'All'}
                        >
                            <option value="All">All Sub-Categories</option>
                            {filteredSubCatOptions.map(sc => (
                                <option key={sc.id} value={sc.id}>{sc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="vendor-filter-select vendor-w-150">
                        <Filter size={15} className="field-icon" />
                        <select
                            value={filters.status}
                            onChange={handleStatusFilter}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <ExportActions
                    selectedCount={selectedRows.length}
                    onExport={showToast}
                    onDownload={handleExportDownload}
                />
            </div>

            {/* ── Table ── */}
            <table className="vendor-brand-table dashboard-table">
                <thead>
                    <tr>
                        <th className="vendor-col-checkbox">
                            <div onClick={toggleSelectAll} className="vendor-clickable-cell">
                                {selectedRows.length === (pagination?.totalRecords || 0) && pagination?.totalRecords > 0
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th className="vendor-col-logo">Logo</th>
                        <th>Brand ID</th>
                        <th>Brand Name</th>
                        <th>Category</th>
                        <th>Sub Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th className="vendor-col-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={9} className="vendor-empty-state">
                                Loading...
                            </td>
                        </tr>
                    ) : brands.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="vendor-empty-state">
                                No brands found.
                            </td>
                        </tr>
                    ) : (
                        brands.map((item) => (
                            <tr
                                key={item.id}
                                className={selectedRows.includes(item.id) ? 'selected-row' : ''}
                            >
                                {/* Checkbox */}
                                <td>
                                    <div
                                        onClick={() => toggleSelectRow(item.id)}
                                        className="vendor-clickable-cell"
                                    >
                                        {selectedRows.includes(item.id)
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </td>

                                {/* Logo */}
                                <td>
                                    <div className="vendor-logo-box">
                                        {item.logo
                                            ? <img src={item.logo} alt="" className="vendor-logo-img" />
                                            : '🏷️'
                                        }
                                    </div>
                                </td>

                                {/* Brand ID */}
                                <td>
                                    <span className="cat-id-badge">{item.brand_code || item.id}</span>
                                </td>

                                {/* Brand Name */}
                                <td>
                                    <span className="vendor-brand-badge">
                                        {item.name}
                                    </span>
                                </td>

                                {/* Category */}
                                <td>
                                    <span className="vendor-category-badge">
                                        {item.category || getCategoryName(item.categoryId)}
                                    </span>
                                </td>

                                {/* Sub Category */}
                                <td>
                                    <span className="vendor-subcategory-badge">
                                        {item.subCategory || getSubCategoryName(item.subCategoryId) || '-'}
                                    </span>
                                </td>

                                {/* Description */}
                                <td>
                                    <div className="vendor-description-text">
                                        {item.description || '-'}
                                    </div>
                                </td>

                                {/* Status */}
                                <td>
                                    <span className={`badge ${item.status === 'Active' ? 'success' : 'error'}`}>
                                        {item.status}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td>
                                    <ActionButtons
                                        onEdit={() => onEdit?.(item)}
                                        onToggleStatus={() => onToggleStatus?.(item)}
                                        onDelete={() => onDelete?.(item)}
                                        isActive={item.status === 'Active'}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* ── Pagination ── */}
            {pagination && (
                <div className="vendor-pagination">
                    <span className="vendor-pagination-info">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of{' '}
                        {pagination.totalRecords} brands
                    </span>
                    <div className="vendor-pagination-btns">
                        <button
                            className="vendor-page-btn"
                            disabled={!pagination.hasPrevPage}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button
                            className="vendor-page-btn"
                            disabled={!pagination.hasNextPage}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

        </>
    );
};

export default BrandList;
