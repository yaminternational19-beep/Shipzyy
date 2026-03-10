import React, { useState } from 'react';
import {
    Search, Filter, ChevronLeft, ChevronRight,
    CheckSquare, Square, Bike, Truck, Car, ShoppingBag, Info
} from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';

const VehicleList = ({ onEdit, onToggleStatus, showToast }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const vehicleTypes = [
        { id: 1, name: 'Bicycle', icon: ShoppingBag, description: 'Eco-friendly short distance delivery for small packages and documents.', status: 'Active', iconType: 'ShoppingBag' },
        { id: 2, name: 'Motorbike', icon: Bike, description: 'Standard quick delivery vehicle for most food and small grocery orders.', status: 'Active', iconType: 'Bike' },
        { id: 3, name: 'Sedan Car', icon: Car, description: 'Secure delivery for fragile items, catering orders, and medium-sized boxes.', status: 'Active', iconType: 'Car' },
        { id: 4, name: 'Mini Truck', icon: Truck, description: 'High-capacity vehicle for furniture, bulk orders, and oversized items.', status: 'Inactive', iconType: 'Truck' }
    ];

    const toggleSelectAll = () => {
        if (selectedRows.length === paginatedVehicles.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedVehicles.map(v => v.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const filteredVehicles = vehicleTypes.filter(v => {
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
        const matchesSearch =
            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    const paginatedVehicles = filteredVehicles.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const iconMap = { Bike, Truck, Car, ShoppingBag };

    return (
        <div className="v-table-container">

            {/* ── Controls Bar ── */}
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

                    {/* Search */}
                    <div className="v-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search vehicles..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="input-with-icon" style={{ width: '160px' }}>
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
                <div className="v-bulk-bar">
                    <span>
                        {selectedRows.length} {selectedRows.length === 1 ? 'vehicle type' : 'vehicle types'} selected
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
                                {selectedRows.length === paginatedVehicles.length && paginatedVehicles.length > 0
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '60px' }}>Icon</th>
                        <th>Vehicle ID</th>
                        <th>Type Name</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedVehicles.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                                No vehicle types found.
                            </td>
                        </tr>
                    ) : (
                        paginatedVehicles.map((type) => {
                            const IconComp = iconMap[type.iconType] || ShoppingBag;
                            return (
                                <tr
                                    key={type.id}
                                    className={selectedRows.includes(type.id) ? 'selected-row' : ''}
                                >
                                    {/* Checkbox */}
                                    <td>
                                        <div
                                            onClick={() => toggleSelectRow(type.id)}
                                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                        >
                                            {selectedRows.includes(type.id)
                                                ? <CheckSquare size={17} color="var(--primary-color)" />
                                                : <Square size={17} color="#94a3b8" />
                                            }
                                        </div>
                                    </td>

                                    {/* Icon */}
                                    <td>
                                        <div className="vehicle-icon-box">
                                            <IconComp size={20} />
                                        </div>
                                    </td>

                                    {/* ID */}
                                    <td>
                                        <span className="veh-id-badge">VHT-00{type.id}</span>
                                    </td>

                                    {/* Name */}
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {type.name}
                                        </span>
                                    </td>

                                    {/* Description */}
                                    <td style={{ maxWidth: '300px', color: '#64748b', fontSize: '0.88rem' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <Info size={14} style={{ flexShrink: 0, marginTop: '3px', opacity: 0.6 }} />
                                            <span>{type.description}</span>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td>
                                        <span className={`badge ${type.status === 'Active' ? 'success' : 'error'}`}>
                                            {type.status}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td>
                                        <ActionButtons
                                            onEdit={() => onEdit?.(type)}
                                            onToggleStatus={() => onToggleStatus?.(type.id)}
                                            isActive={type.status === 'Active'}
                                        />
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {/* ── Pagination ── */}
            <div className="v-pagination">
                <span className="v-pagination-info">
                    Showing{' '}
                    {filteredVehicles.length === 0
                        ? 0
                        : (currentPage - 1) * itemsPerPage + 1}–
                    {Math.min(currentPage * itemsPerPage, filteredVehicles.length)}{' '}
                    of {filteredVehicles.length} vehicle types
                </span>
                <div className="v-pagination-btns">
                    <button
                        className="v-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <button
                        className="v-page-btn"
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

export default VehicleList;
