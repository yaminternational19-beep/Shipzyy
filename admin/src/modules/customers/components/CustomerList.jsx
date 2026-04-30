import React from 'react';
import { Search, MapPin, ChevronLeft, ChevronRight, X, Square, CheckSquare, Eye, Trash2, Ban, UserX } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import ExportActions from '../../../components/common/ExportActions';
import { getSafeImage } from '../../../utils/imageUtils';

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
    onChangeStatus,
    onDelete,
    onSelectAll,
    onExport,
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

    // const resetFilters = () => {
    //     setFilters({
    //         search: '',
    //         status: 'All',
    //         country: 'All',
    //         state: 'All',
    //         city: 'All'
    //     });
    //     showToast('Filters cleared', 'info');
    // };

    const toggleSelectAll = () => {
        const isCurrentlyFullySelected = selectedCustomerIds.length === totalCount && totalCount > 0;
        if (onSelectAll) {
            onSelectAll(!isCurrentlyFullySelected);
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
                <div className="cust-controls-left">
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
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="terminated">Terminated</option>
                        </select>
                    </div>
                </div>

                <ExportActions
                    selectedCount={selectedCustomerIds.length}
                    onExport={showToast}
                    onDownload={onExport}
                />
            </div>

            {/* ── Table ── */}
            <div className="p-table-container">
                <table className="dashboard-table" style={{ minWidth: '1200px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '48px', textAlign: 'center' }}>
                                <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedCustomerIds.length === totalCount && totalCount > 0
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </th>
                            <th style={{ width: '80px', textAlign: 'center' }}>PROFILE</th>
                            <th style={{ textAlign: 'center' }}>CUSTOMER ID</th>
                            <th style={{ textAlign: 'center' }}>NAME</th>
                            <th style={{ textAlign: 'center' }}>CONTACT</th>
                            <th style={{ textAlign: 'center' }}>LOCATION</th>
                            <th style={{ width: '100px', textAlign: 'center' }}>ORDERS</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>PROFILE COMPLETION</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>JOINED</th>
                            <th style={{ width: '120px', textAlign: 'center' }}>STATUS</th>
                            <th style={{ width: '180px', textAlign: 'center' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.length === 0 ? (
                            <tr>
                                <td colSpan={10} className="cust-empty-state" style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '8px' }}>No Customers Found</div>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
                                </td>
                            </tr>
                        ) : (
                            customers.map((customer) => (
                                <tr key={customer.id} className={selectedCustomerIds.includes(customer.id) ? 'selected-row' : ''}>
                                    <td style={{ textAlign: 'center' }}>
                                        <div onClick={() => toggleSelectRow(customer.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {selectedCustomerIds.includes(customer.id)
                                                ? <CheckSquare size={17} color="var(--primary-color)" />
                                                : <Square size={17} color="#94a3b8" />
                                            }
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div className="cust-profile-cell" style={{ display: 'flex', justifyContent: 'center' }}>
                                            {customer.profile_image ? (
                                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                    <img 
                                                        src={getSafeImage(customer.profile_image, 'USER')} 
                                                        alt={customer.name} 
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                    <div className="profile-initials" style={{ width: '100%', height: '100%', display: 'none', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
                                                        {customer.name ? customer.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() : '?'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="profile-initials" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.8rem', border: '1px solid #e2e8f0' }}>
                                                    {customer.name ? customer.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() : '?'}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}><span className="cust-id-badge">CUST-{customer.id}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="cust-name-text" style={{ 
                                            maxWidth: '200px', 
                                            display: 'inline-block', 
                                            wordWrap: 'break-word', 
                                            whiteSpace: 'normal',
                                            lineHeight: '1.2'
                                        }}>
                                            {customer.name || 'Anonymous'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{customer.phone || 'No Phone'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.email || 'No Email'}</div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                                {(() => {
                                                    const parts = customer.location ? customer.location.split(', ') : [];
                                                    if (parts.length > 1) {
                                                        const country = parts.pop();
                                                        return parts.join(', ');
                                                    }
                                                    return customer.location || 'Unknown';
                                                })()}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                {(() => {
                                                    const parts = customer.location ? customer.location.split(', ') : [];
                                                    return parts.length > 1 ? parts[parts.length - 1] : '';
                                                })()}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }} className="cust-orders-count">{customer.orders || 0}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 700,
                                            background: customer.profile_completion >= 80 ? '#dcfce7' : customer.profile_completion >= 50 ? '#fef9c3' : '#fee2e2',
                                            color: customer.profile_completion >= 80 ? '#166534' : customer.profile_completion >= 50 ? '#854d0e' : '#991b1b',
                                        }}>
                                            {customer.profile_completion || 0}%
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }} className="cust-joined-date">{customer.joined}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`status-badge ${customer.status?.toLowerCase() || 'active'}`}>
                                            {customer.status || 'Active'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <ActionButton
                                                icon={Eye}
                                                onClick={() => onView(customer)}
                                                variant="secondary"
                                                size={16}
                                                tooltip="View Profile"
                                            />
                                            
                                            {customer.status?.toLowerCase() !== 'terminated' && (
                                                <>
                                                    <ActionButton
                                                        icon={Ban}
                                                        onClick={() => onChangeStatus(customer.id, customer.status?.toLowerCase() === 'suspended' ? 'active' : 'suspended')}
                                                        variant="secondary"
                                                        size={16}
                                                        tooltip={customer.status?.toLowerCase() === 'suspended' ? "Activate Account" : "Suspend Account"}
                                                    />
                                                    <ActionButton
                                                        icon={UserX}
                                                        onClick={() => onChangeStatus(customer.id, 'terminated')}
                                                        variant="secondary"
                                                        size={16}
                                                        tooltip="Terminate Account"
                                                    />
                                                </>
                                            )}
                                            {customer.status?.toLowerCase() === 'terminated' && (
                                                <ActionButton
                                                    icon={Trash2}
                                                    onClick={() => onDelete(customer.id)}
                                                    variant="secondary"
                                                    size={16}
                                                    tooltip="Delete"
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="c-pagination">
                <span className="c-pagination-info">
                    Showing {Math.min(itemsPerPage * (currentPage - 1) + 1, totalCount)}–{Math.min(itemsPerPage * currentPage, totalCount)} of {totalCount} customers
                </span>
                <div className="c-pagination-btns">
                    <button
                        className="c-page-btn"
                        disabled={currentPage === 1}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>

                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px', display: 'flex', alignItems: 'center' }}>
                        {currentPage} / {totalPages || 1}
                    </span>

                    <button
                        className="c-page-btn"
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerList;
