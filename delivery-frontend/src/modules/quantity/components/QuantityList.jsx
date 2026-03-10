import React, { useState, useMemo } from 'react';
import {
    Search, Filter, ChevronLeft, ChevronRight,
    CheckSquare, Square, Layers
} from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';

const QuantityList = ({ units, onEdit, onDelete, onToggleStatus, showToast }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const CATEGORIES = [
        'Electronics', 'Spices & Herbs', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery'
    ];

    const filteredUnits = useMemo(() => {
        return units.filter(u => {
            const matchesSearch =
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.subCategory.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = categoryFilter === 'All' || u.category === categoryFilter;
            const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [units, searchTerm, categoryFilter, statusFilter]);

    const paginatedUnits = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUnits.slice(start, start + itemsPerPage);
    }, [filteredUnits, currentPage]);

    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedUnits.length && paginatedUnits.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedUnits.map(u => u.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    return (
        <div className="q-table-container">
            {/* ── Controls Bar ── */}
            <div className="q-table-controls">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Search */}
                    <div className="q-search">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search units..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="input-with-icon" style={{ width: '180px' }}>
                        <Layers size={16} className="field-icon" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="All">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="input-with-icon" style={{ width: '140px' }}>
                        <Filter size={16} className="field-icon" />
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

                {/* Export ACTIONS */}
                <ExportActions
                    selectedCount={selectedRows.length}
                    onExport={(format) => showToast(`Exporting units as ${format}...`, 'info')}
                />
            </div>

            {/* ── Bulk Selection Bar ── */}
            {selectedRows.length > 0 && (
                <div className="q-bulk-bar">
                    <span>
                        {selectedRows.length} {selectedRows.length === 1 ? 'unit' : 'units'} selected
                    </span>
                    <button onClick={() => setSelectedRows([])}>Clear Selection</button>
                </div>
            )}

            {/* ── Table ── */}
            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>
                                <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex' }}>
                                    {selectedRows.length === paginatedUnits.length && paginatedUnits.length > 0 ? (
                                        <CheckSquare size={18} color="var(--primary-color)" />
                                    ) : (
                                        <Square size={18} color="#94a3b8" />
                                    )}
                                </div>
                            </th>
                            <th>CATEGORY</th>
                            <th>SUB CATEGORY</th>
                            <th>UNIT NAME</th>
                            <th>UNIT CODE</th>
                            <th>STATUS</th>
                            <th>CREATED DATE</th>
                            <th style={{ textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedUnits.map(unit => (
                            <tr key={unit.id} className={selectedRows.includes(unit.id) ? 'selected-row' : ''}>
                                <td>
                                    <div onClick={() => toggleSelectRow(unit.id)} style={{ cursor: 'pointer', display: 'flex' }}>
                                        {selectedRows.includes(unit.id) ? (
                                            <CheckSquare size={18} color="var(--primary-color)" />
                                        ) : (
                                            <Square size={18} color="#94a3b8" />
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#475569' }}>{unit.category}</span>
                                </td>
                                <td>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{unit.subCategory}</span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{unit.name}</div>
                                </td>
                                <td>
                                    <span className="unit-id-badge">{unit.shortCode}</span>
                                </td>
                                <td>
                                    <span className={`badge ${unit.status === 'Active' ? 'success' : 'error'}`}>
                                        {unit.status}
                                    </span>
                                </td>
                                <td>{unit.createdAt}</td>
                                <td>
                                    <ActionButtons
                                        onEdit={() => onEdit(unit)}
                                        onToggleStatus={() => onToggleStatus(unit)}
                                        onDelete={() => onDelete(unit.id)}
                                        isActive={unit.status === 'Active'}
                                    />
                                </td>
                            </tr>
                        ))}
                        {paginatedUnits.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                    No measurement units found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="q-pagination">
                <span className="q-pagination-info">
                    Showing {paginatedUnits.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredUnits.length)} of {filteredUnits.length} units
                </span>
                <div className="q-pagination-btns">
                    <button
                        className="q-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                        className="q-page-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuantityList;
