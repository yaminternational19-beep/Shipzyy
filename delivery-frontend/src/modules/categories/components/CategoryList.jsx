import React, { useState } from 'react';
import {
    Search, Filter, ChevronLeft, ChevronRight,
    CheckSquare, Square
} from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';
import { exportCategoriesToPDF, exportCategoriesToExcel } from '../services/export.service';

const CategoryList = ({ categories = [], pagination = null, loading = false, onEdit, onDelete, onToggleStatus, onRefresh, showToast }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSelectAll = () => {
        if (selectedRows.length === categories.length && categories.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(categories.map(c => c.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handlePageChange = (newPage) => {
        onRefresh({ page: newPage, search: searchQuery, status: statusFilter === 'All' ? '' : statusFilter });
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        onRefresh({ page: 1, search: value, status: statusFilter === 'All' ? '' : statusFilter });
    };

    const handleStatusFilter = (e) => {
        const value = e.target.value;
        setStatusFilter(value);
        onRefresh({ page: 1, search: searchQuery, status: value === 'All' ? '' : value });
    };

    const handleExportDownload = (type) => {
        const selectedData = categories.filter(cat => selectedRows.includes(cat.id));

        if (selectedData.length === 0) {
            showToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportCategoriesToPDF(selectedData);
                showToast(`Exported ${selectedData.length} records as PDF successfully!`, 'success');
            } else if (type === 'excel') {
                exportCategoriesToExcel(selectedData);
                showToast(`Exported ${selectedData.length} records as Excel successfully!`, 'success');
            }
        } catch (error) {
            console.error('Export Error:', error);
            showToast('Failed to generate export file. Please try again.', 'error');
        }
    };

    return (
        <div className="c-table-container">
            {/* Controls Bar */}
            <div className="c-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="c-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="input-with-icon" style={{ width: '160px' }}>
                        <Filter size={15} className="field-icon" />
                        <select value={statusFilter} onChange={handleStatusFilter}>
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

            {/* Bulk Selection Bar */}
            {selectedRows.length > 0 && (
                <div className="c-bulk-bar">
                    <span>{selectedRows.length} items selected</span>
                    <button onClick={() => setSelectedRows([])}>Clear</button>
                </div>
            )}

            {/* Table */}
            <table className="dashboard-table">
                <thead>
                    <tr>
                        <th style={{ width: '40px' }}>
                            <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                {selectedRows.length === categories.length && categories.length > 0
                                    ? <CheckSquare size={17} color="#6366f1" />
                                    : <Square size={17} color="#cbd5e1" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '60px' }}>Icon</th>
                        <th>Category ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th style={{ textAlign: 'center' }}>Sub-Categories</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>Loading...</td></tr>
                    ) : categories.length === 0 ? (
                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>No data found.</td></tr>
                    ) : (
                        categories.map((cat) => (
                            <tr key={cat.id} className={selectedRows.includes(cat.id) ? 'selected-row' : ''}>
                                <td>
                                    <div onClick={() => toggleSelectRow(cat.id)} style={{ cursor: 'pointer' }}>
                                        {selectedRows.includes(cat.id) ? <CheckSquare size={17} color="#6366f1" /> : <Square size={17} color="#cbd5e1" />}
                                    </div>
                                </td>
                                <td>
                                    <div className="category-icon-box" style={{ width: '40px', height: '40px', borderRadius: '10px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {cat.icon ? <img src={cat.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📁'}
                                    </div>
                                </td>
                                <td><span className="cat-id-badge">{cat.category_code || cat.id}</span></td>
                                <td><span style={{ fontWeight: 600 }}>{cat.name}</span></td>
                                <td style={{ maxWidth: '200px', fontSize: '0.85rem', color: '#64748b', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                    {cat.description || '-'}
                                </td>
                                <td style={{ textAlign: 'center' }}>{cat.subCategoryCount || 0}</td>
                                <td><span className={`badge ${cat.status === 'Active' ? 'success' : 'error'}`}>{cat.status}</span></td>
                                <td style={{ display: 'flex', justifyContent: 'center' }}>
                                    <ActionButtons
                                        onEdit={() => onEdit?.(cat)}
                                        onDelete={() => onDelete?.(cat)}
                                        onToggleStatus={() => onToggleStatus?.(cat)}
                                        isActive={cat.status === 'Active'}
                                    />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {pagination && (
                <div className="c-pagination">
                    <span className="c-pagination-info">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords}
                    </span>
                    <div className="c-pagination-btns">
                        <button className="c-page-btn" disabled={!pagination.hasPrevPage} onClick={() => handlePageChange(pagination.page - 1)}>
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <button className="c-page-btn" disabled={!pagination.hasNextPage} onClick={() => handlePageChange(pagination.page + 1)}>
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
