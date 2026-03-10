import React, { useState } from 'react';
import {
    Search, Filter, ListTree,
    CheckSquare, Square, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';
import { exportSubCategoriesToPDF, exportSubCategoriesToExcel } from '../services/export.service';

const SubCategoryList = ({ subcategories = [], parentCategories = [], loading = false, pagination = null, onRefresh, onEdit, onDelete, onToggleStatus, showToast }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const getCountByCategory = (catId) =>
        subcategories.filter(sc => sc.categoryId === catId).length;

    const getCategoryName = (catId) => {
        const cat = parentCategories.find(c => c.id === catId);
        return cat ? cat.name : "Unknown Category";
    };

    const toggleSelectAll = () => {
        if (selectedRows.length === subcategories.length && subcategories.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(subcategories.map(item => item.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handlePageChange = (newPage) => {
        onRefresh({ page: newPage, search: searchQuery, status: statusFilter === 'All' ? '' : statusFilter, categoryId: categoryFilter === 'All' ? '' : categoryFilter });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        onRefresh({ page: 1, search: value, status: statusFilter === 'All' ? '' : statusFilter, categoryId: categoryFilter === 'All' ? '' : categoryFilter });
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        onRefresh({ page: 1, search: searchQuery, status: value === 'All' ? '' : value, categoryId: categoryFilter === 'All' ? '' : categoryFilter });
    };

    const handleCategoryFilter = (e) => {
        const value = e.target.value;
        setCategoryFilter(value);
        onRefresh({ page: 1, search: searchQuery, status: statusFilter === 'All' ? '' : statusFilter, categoryId: value === 'All' ? '' : value });
    };

    const handleExportDownload = (type) => {
        const selectedData = subcategories.filter(sc => selectedRows.includes(sc.id));

        if (selectedData.length === 0) {
            showToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportSubCategoriesToPDF(selectedData, parentCategories);
                showToast(`Exported ${selectedData.length} records as PDF successfully!`, 'success');
            } else if (type === 'excel') {
                exportSubCategoriesToExcel(selectedData, parentCategories);
                showToast(`Exported ${selectedData.length} records as Excel successfully!`, 'success');
            }
        } catch (error) {
            console.error('Export Error:', error);
            showToast('Failed to generate export file. Please try again.', 'error');
        }
    };

    return (
        <div className="sc-table-container">

            {/* ── Controls Bar ── */}
            <div className="sc-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

                    {/* Search */}
                    <div className="sc-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="input-with-icon" style={{ width: '190px' }}>
                        <Layers size={15} className="field-icon" />
                        <select
                            value={categoryFilter}
                            onChange={handleCategoryFilter}
                        >
                            <option value="All">All Categories</option>
                            {parentCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({getCountByCategory(cat.id)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="input-with-icon" style={{ width: '150px' }}>
                        <Filter size={15} className="field-icon" />
                        <select
                            value={statusFilter}
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

            {/* ── Bulk Selection Bar ── */}
            {selectedRows.length > 0 && (
                <div className="c-bulk-bar">
                    <span>
                        {selectedRows.length} {selectedRows.length === 1 ? 'item' : 'items'} selected
                    </span>
                    <button onClick={() => setSelectedRows([])}>Clear Selection</button>
                </div>
            )}

            {/* ── Table ── */}
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th style={{ width: '48px' }}>
                            <div
                                onClick={toggleSelectAll}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {selectedRows.length === subcategories.length && subcategories.length > 0
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '60px' }}>Icon</th>
                        <th>Category ID</th>
                        <th>Category Name</th>
                        <th>Sub-Category ID</th>
                        <th>Sub-Category Name</th>
                        <th>Items / Products</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {subcategories.length === 0 ? (
                        <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                                No sub-categories found.
                            </td>
                        </tr>
                    ) : (
                        subcategories.map((item) => (
                            <tr
                                key={item.id}
                                className={selectedRows.includes(item.id) ? 'selected-row' : ''}
                            >
                                {/* Checkbox */}
                                <td>
                                    <div
                                        onClick={() => toggleSelectRow(item.id)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {selectedRows.includes(item.id)
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </td>

                                {/* Icon */}
                                <td>
                                    <div className="category-icon-box" style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.icon ? (
                                            <img src={item.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            '📁'
                                        )}
                                    </div>
                                </td>

                                {/* Cat ID */}
                                <td>
                                    <span className="cat-id-badge">{item.category_code || item.categoryId || '-'}</span>
                                </td>

                                {/* Category Name */}
                                <td>
                                    <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.9rem' }}>
                                        {item.category}
                                    </span>
                                </td>

                                {/* Sub ID */}
                                <td>
                                    <span className="cat-id-badge">{item.subcategory_code || item.id}</span>
                                </td>

                                {/* Sub Category Name */}
                                <td>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {item.name}
                                    </span>
                                </td>

                                {/* Items / Products */}
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' }}>
                                        <ListTree size={14} />
                                        {item.description || '-'}
                                    </div>
                                </td>

                                {/* Status */}
                                <td>
                                    <span className={`badge ${item.status === 'Active' ? 'success' : 'error'}`}>
                                        {item.status}
                                    </span>
                                </td>

                                {/* Actions — shared ActionButtons component */}
                                <td>
                                    <ActionButtons
                                        onEdit={() => onEdit?.(item)}
                                        onToggleStatus={() => onToggleStatus(item)}
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
                <div className="c-pagination">
                    <span className="c-pagination-info">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} items
                    </span>
                    <div className="c-pagination-btns">
                        <button
                            className="c-page-btn"
                            disabled={!pagination.hasPrevPage}
                            onClick={() => handlePageChange(pagination.page - 1)}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button
                            className="c-page-btn"
                            disabled={!pagination.hasNextPage}
                            onClick={() => handlePageChange(pagination.page + 1)}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SubCategoryList;
