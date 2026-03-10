import React, { useState } from 'react';
import {
    Search, Filter, ListTree,
    CheckSquare, Square, ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';

const BrandList = ({ onEdit, onDelete, showToast }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [subCategoryFilter, setSubCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const brands = [
        { id: 'BR001', name: 'Apple', catId: 'CAT001', category: 'Electronics', subCategory: 'Mobile Phones', description: 'Premium smartphones and tech accessories', status: 'Active', logo: '🍎' },
        { id: 'BR002', name: 'Samsung', catId: 'CAT001', category: 'Electronics', subCategory: 'Mobile Phones', description: 'Innovative display and mobile technology', status: 'Active', logo: '📱' },
        { id: 'BR003', name: 'Sony', catId: 'CAT001', category: 'Electronics', subCategory: 'Laptops', description: 'Professional audio and visual electronics', status: 'Active', logo: '🎥' },
        { id: 'BR004', name: 'Nike', catId: 'CAT005', category: 'Fashion', subCategory: 'Footwear', description: 'Athletic footwear and sportswear', status: 'Active', logo: '👟' },
        { id: 'BR005', name: 'Adidas', catId: 'CAT005', category: 'Fashion', subCategory: 'Footwear', description: 'Original sports apparel and accessories', status: 'Inactive', logo: '👕' },
    ];

    const categories = [
        { id: 'CAT001', name: 'Electronics' },
        { id: 'CAT002', name: 'Spices & Herbs' },
        { id: 'CAT003', name: 'Vegetables' },
        { id: 'CAT004', name: 'Fruits' },
        { id: 'CAT005', name: 'Fashion' }
    ];

    const getCountByCategory = (catId) =>
        brands.filter(b => b.catId === catId).length;

    const uniqueSubCategories = Array.from(new Set(brands.map(b => b.subCategory)));

    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedData.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedData.map(item => item.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleToggleStatus = (item) => {
        const next = item.status === 'Active' ? 'Deactivated' : 'Activated';
        showToast(`${next} "${item.name}"`, 'success');
    };

    const filteredData = brands.filter(b => {
        const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || b.catId === categoryFilter;
        const matchesSubCategory = subCategoryFilter === 'All' || b.subCategory === subCategoryFilter;
        const matchesSearch =
            b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesCategory && matchesSubCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="brand-table-container">

            {/* ── Controls Bar ── */}
            <div className="brand-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

                    {/* Search */}
                    <div className="brand-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by brand name or ID..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="input-with-icon" style={{ width: '190px' }}>
                        <Layers size={15} className="field-icon" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setSubCategoryFilter('All');
                                setCurrentPage(1);
                            }}
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name} ({getCountByCategory(cat.id)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sub-Category Filter */}
                    <div className="input-with-icon" style={{ width: '190px' }}>
                        <ListTree size={15} className="field-icon" />
                        <select
                            value={subCategoryFilter}
                            onChange={(e) => { setSubCategoryFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Sub-Categories</option>
                            {uniqueSubCategories
                                .filter(sc => {
                                    if (categoryFilter === 'All') return true;
                                    const catName = categories.find(c => c.id === categoryFilter)?.name;
                                    return brands.some(b => b.subCategory === sc && b.category === catName);
                                })
                                .map(sc => (
                                    <option key={sc} value={sc}>{sc}</option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="input-with-icon" style={{ width: '150px' }}>
                        <Filter size={15} className="field-icon" />
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Export — shared component */}
                <ExportActions
                    selectedCount={selectedRows.length}
                    onExport={showToast}
                />
            </div>

            {/* ── Bulk Selection Bar ── */}
            {selectedRows.length > 0 && (
                <div className="c-bulk-bar">
                    <span>
                        {selectedRows.length} {selectedRows.length === 1 ? 'brand' : 'brands'} selected
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
                                {selectedRows.length === paginatedData.length && paginatedData.length > 0
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '60px' }}>Logo</th>
                        <th>Brand ID</th>
                        <th>Brand Name</th>
                        <th>Category</th>
                        <th>Sub Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.length === 0 ? (
                        <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                                No brands found.
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((item) => (
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

                                {/* Logo */}
                                <td>
                                    <div className="category-icon-box">{item.logo}</div>
                                </td>

                                {/* Brand ID */}
                                <td>
                                    <span className="cat-id-badge">{item.id}</span>
                                </td>

                                {/* Brand Name */}
                                <td>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {item.name}
                                    </span>
                                </td>

                                {/* Category */}
                                <td>
                                    <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.9rem' }}>
                                        {item.category}
                                    </span>
                                </td>

                                {/* Sub Category */}
                                <td>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {item.subCategory}
                                    </span>
                                </td>

                                {/* Description */}
                                <td>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        color: '#64748b',
                                        maxWidth: '200px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {item.description}
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
                                        onToggleStatus={() => handleToggleStatus(item)}
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
            <div className="c-pagination">
                <span className="c-pagination-info">
                    Showing{' '}
                    {filteredData.length === 0
                        ? 0
                        : (currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredData.length)}{' '}
                    of {filteredData.length} brands
                </span>
                <div className="c-pagination-btns">
                    <button
                        className="c-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                        className="c-page-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default BrandList;
