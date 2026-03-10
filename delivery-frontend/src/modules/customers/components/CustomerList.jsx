import React from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';

const CustomerList = ({
    customers,
    totalCount,
    filters,
    setFilters,
    pagination,
    setPagination,
    locationData,
    selectedCustomerIds,
    setSelectedCustomerIds,
    onView,
    onEdit,
    onBlock,
    onActivate,
    onTerminate,
    showToast
}) => {
    const { currentPage, itemsPerPage } = pagination;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };

        if (key === 'country') {
            newFilters.state = 'All';
            newFilters.city = 'All';
        } else if (key === 'state') {
            newFilters.city = 'All';
        }

        setFilters(newFilters);
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            status: 'All',
            country: 'All',
            state: 'All',
            city: 'All'
        });
        showToast('Filters cleared', 'info');
    };

    const toggleSelectAll = () => {
        if (selectedCustomerIds.length === customers.length && customers.length > 0) {
            setSelectedCustomerIds([]);
        } else {
            setSelectedCustomerIds(customers.map(c => c.id));
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedCustomerIds.includes(id)) {
            setSelectedCustomerIds(selectedCustomerIds.filter(item => item !== id));
        } else {
            setSelectedCustomerIds([...selectedCustomerIds, id]);
        }
    };

    const countries = Object.keys(locationData);
    const states = filters.country !== 'All' ? Object.keys(locationData[filters.country]) : [];
    const cities = (filters.country !== 'All' && filters.state !== 'All') ? locationData[filters.country][filters.state] : [];

    return (
        <div className="cust-table-section">
            {/* ── Controls Bar ── */}
            <div className="cust-table-controls">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                    <div className="cust-search">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or customer ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="cust-filters">
                        <select
                            className="cust-filter-select"
                            value={filters.country}
                            onChange={(e) => handleFilterChange('country', e.target.value)}
                        >
                            <option value="All">All Countries</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            className="cust-filter-select"
                            disabled={filters.country === 'All'}
                            value={filters.state}
                            onChange={(e) => handleFilterChange('state', e.target.value)}
                        >
                            <option value="All">States</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select
                            className="cust-filter-select"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Blocked">Blocked</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Terminated">Terminated</option>
                        </select>

                        <button
                            className="filter-clear-btn"
                            onClick={resetFilters}
                            title="Clear Filters"
                            style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <ExportActions
                    selectedCount={selectedCustomerIds.length}
                    onExport={(format) => showToast(`Exporting as ${format}...`)}
                />
            </div>

            {/* ── Bulk Selection Bar ── */}
            {selectedCustomerIds.length > 0 && (
                <div className="cust-bulk-bar">
                    <span>{selectedCustomerIds.length} {selectedCustomerIds.length === 1 ? 'customer' : 'customers'} selected</span>
                    <button onClick={() => setSelectedCustomerIds([])}>Clear Selection</button>
                </div>
            )}

            {/* ── Table ── */}
            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th style={{ width: '48px' }}>
                                <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex' }}>
                                    {selectedCustomerIds.length === customers.length && customers.length > 0
                                        ? <div style={{ color: 'var(--primary-color)' }}>◉</div>
                                        : <div style={{ color: '#94a3b8' }}>○</div>
                                    }
                                </div>
                            </th>
                            <th>PROFILE</th>
                            <th>CUSTOMER ID</th>
                            <th>NAME</th>
                            <th>CONTACT</th>
                            <th>LOCATION</th>
                            <th style={{ textAlign: 'center' }}>ORDERS</th>
                            <th>JOINED</th>
                            <th>STATUS</th>
                            <th style={{ textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                                    No customers found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.id} className={selectedCustomerIds.includes(customer.id) ? 'selected-row' : ''}>
                                    <td>
                                        <div onClick={() => toggleSelectRow(customer.id)} style={{ cursor: 'pointer', display: 'flex' }}>
                                            {selectedCustomerIds.includes(customer.id)
                                                ? <div style={{ color: 'var(--primary-color)' }}>◉</div>
                                                : <div style={{ color: '#94a3b8' }}>○</div>
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <div className="profile-initials">
                                            {customer.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    </td>
                                    <td><span className="cust-id-badge">{customer.id}</span></td>
                                    <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{customer.name}</span></td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{customer.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <MapPin size={12} /> {customer.city}, {customer.country}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{customer.totalOrders}</td>
                                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{customer.joined}</td>
                                    <td>
                                        <span className={`badge ${customer.status === 'Active' ? 'success' : customer.status === 'Terminated' ? 'error' : 'warning'}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <ActionButtons
                                            onView={() => onView(customer)}
                                            onEdit={() => onEdit(customer)}
                                            onToggleStatus={customer.status === 'Active' ? () => onBlock(customer.id) : () => onActivate(customer.id)}
                                            onDelete={() => onTerminate(customer.id)}
                                            isActive={customer.status === 'Active'}
                                            type="customer"
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="cust-pagination">
                <span className="cust-pagination-info">
                    Showing <strong>{Math.min(itemsPerPage * (currentPage - 1) + 1, totalCount)}</strong> to <strong>{Math.min(itemsPerPage * currentPage, totalCount)}</strong> of <strong>{totalCount}</strong> customers
                </span>
                <div className="cust-pagination-btns">
                    <button
                        className="cust-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                            className={`cust-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="cust-page-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
