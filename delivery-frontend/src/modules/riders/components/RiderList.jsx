import React from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight, X, Shield, UserX, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import ActionButtons from '../../../components/common/ActionButtons';
import ExportActions from '../../../components/common/ExportActions';

const RiderList = ({
    riders,
    totalCount,
    filters,
    setFilters,
    pagination,
    setPagination,
    locationData,
    selectedRiderIds,
    setSelectedRiderIds,
    onVerify,
    onView,
    onTerminate,
    onActivate,
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
            kycStatus: 'All',
            country: 'All',
            state: 'All',
            city: 'All'
        });
        showToast('Filters cleared', 'info');
    };

    const toggleSelectAll = () => {
        if (selectedRiderIds.length === riders.length && riders.length > 0) {
            setSelectedRiderIds([]);
        } else {
            setSelectedRiderIds(riders.map(r => r.id));
        }
    };

    const toggleSelectRow = (id) => {
        if (selectedRiderIds.includes(id)) {
            setSelectedRiderIds(selectedRiderIds.filter(item => item !== id));
        } else {
            setSelectedRiderIds([...selectedRiderIds, id]);
        }
    };

    const getKycBadge = (status) => {
        switch (status) {
            case 'Verified':
                return <span className="status-pill status-verified"><Shield size={12} /> Verified</span>;
            case 'Pending':
                return <span className="status-pill status-wait"><Clock size={12} /> Pending</span>;
            case 'Rejected':
                return <span className="status-pill status-rejected"><AlertTriangle size={12} /> Rejected</span>;
            default:
                return <span className="status-pill">{status}</span>;
        }
    };

    const countries = Object.keys(locationData);
    const states = filters.country !== 'All' ? Object.keys(locationData[filters.country]) : [];

    return (
        <div className="rider-table-section">
            {/* ── Controls Bar ── */}
            <div className="rider-table-controls">
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                    <div className="rider-search">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or rider ID..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="rider-filters">
                        <select
                            className="rider-filter-select"
                            value={filters.country}
                            onChange={(e) => handleFilterChange('country', e.target.value)}
                        >
                            <option value="All">All Countries</option>
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <select
                            className="rider-filter-select"
                            disabled={filters.country === 'All'}
                            value={filters.state}
                            onChange={(e) => handleFilterChange('state', e.target.value)}
                        >
                            <option value="All">States</option>
                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select
                            className="rider-filter-select"
                            value={filters.kycStatus}
                            onChange={(e) => handleFilterChange('kycStatus', e.target.value)}
                        >
                            <option value="All">KYC Status</option>
                            <option value="Verified">Verified</option>
                            <option value="Pending">Pending</option>
                            <option value="Rejected">Rejected</option>
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
                    selectedCount={selectedRiderIds.length}
                    onExport={(format) => showToast(`Exporting as ${format}...`)}
                />
            </div>

            {/* ── Bulk Selection Bar ── */}
            {selectedRiderIds.length > 0 && (
                <div className="rider-bulk-bar">
                    <span>{selectedRiderIds.length} riders selected</span>
                    <button onClick={() => setSelectedRiderIds([])}>Clear Selection</button>
                </div>
            )}

            {/* ── Table ── */}
            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th style={{ width: '48px' }}>
                                <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex' }}>
                                    {selectedRiderIds.length === riders.length && riders.length > 0
                                        ? <div style={{ color: 'var(--primary-color)' }}>◉</div>
                                        : <div style={{ color: '#94a3b8' }}>○</div>
                                    }
                                </div>
                            </th>
                            <th>PROFILE</th>
                            <th>RIDER ID</th>
                            <th>NAME</th>
                            <th>CONTACT</th>
                            <th>LOCATION</th>
                            <th>VEHICLE</th>
                            <th>KYC STATUS</th>
                            <th style={{ textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riders.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                                    No riders found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            riders.map((rider) => (
                                <tr key={rider.id} className={selectedRiderIds.includes(rider.id) ? 'selected-row' : ''}>
                                    <td>
                                        <div onClick={() => toggleSelectRow(rider.id)} style={{ cursor: 'pointer', display: 'flex' }}>
                                            {selectedRiderIds.includes(rider.id)
                                                ? <div style={{ color: 'var(--primary-color)' }}>◉</div>
                                                : <div style={{ color: '#94a3b8' }}>○</div>
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <div className="profile-initials">
                                            {rider.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                    </td>
                                    <td><span className="rider-id-badge">{rider.id}</span></td>
                                    <td><span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rider.name}</span></td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{rider.email}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{rider.phone}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                                            <MapPin size={12} /> {rider.city}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{rider.vehicle}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{rider.vehicleNumber}</div>
                                    </td>
                                    <td>{getKycBadge(rider.kycStatus)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                                className="btn btn-secondary sm"
                                                onClick={() => onVerify(rider)}
                                                style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid #e2e8f0' }}
                                            >
                                                KYC
                                            </button>
                                            <ActionButtons
                                                onView={() => onView(rider)}
                                                onToggleStatus={rider.riderStatus === 'Active' ? () => onActivate(rider.id, false) : () => onActivate(rider.id, true)}
                                                onDelete={() => onTerminate(rider.id)}
                                                isActive={rider.riderStatus === 'Active'}
                                                type="customer"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="rider-pagination">
                <span className="rider-pagination-info">
                    Showing <strong>{Math.min(itemsPerPage * (currentPage - 1) + 1, totalCount)}</strong> to <strong>{Math.min(itemsPerPage * currentPage, totalCount)}</strong> of <strong>{totalCount}</strong> riders
                </span>
                <div className="rider-pagination-btns">
                    <button
                        className="rider-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                        Prev
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                            className={`rider-page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="rider-page-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RiderList;
