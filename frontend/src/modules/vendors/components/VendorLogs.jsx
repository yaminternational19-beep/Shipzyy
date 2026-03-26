import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, History, Search, ArrowRight, Loader2, Calendar } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

// DUMMY DATA FOR DEMONSTRATION
const DUMMY_VENDOR_LOGS = [
    { id: 1, user_id: 301, module: 'VENDORS', action: 'CREATE', status: 'SUCCESS', description: 'Created new vendor: Zion Supplies Pvt Ltd', ip_address: '203.0.113.1', user_agent: 'Chrome / Windows', user: 'Admin', user_type: 'SUPER_ADMIN', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
    { id: 2, user_id: 302, module: 'VENDORS', action: 'UPDATE', status: 'SUCCESS', description: 'Updated KYC details for Vendor #44', ip_address: '203.0.113.2', user_agent: 'Safari / MacOS', user: 'Jane Smith', user_type: 'SUB_ADMIN', created_at: new Date(Date.now() - 1000 * 60 * 75).toISOString() },
    { id: 3, user_id: 301, module: 'VENDORS', action: 'STATUS_CHANGE', status: 'SUCCESS', description: 'Changed Vendor #22 status to Inactive', ip_address: '203.0.113.1', user_agent: 'Chrome / Windows', user: 'Admin', user_type: 'SUPER_ADMIN', created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
    { id: 4, user_id: 303, module: 'VENDORS', action: 'DELETE', status: 'FAILED', description: 'Attempted deletion of active Vendor #7 — blocked', ip_address: '203.0.113.3', user_agent: 'Firefox / Ubuntu', user: 'Bob Wilson', user_type: 'SUB_ADMIN', created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
];

const VendorLogs = ({ showToast }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pagination, setPagination] = useState({});

    const [filters, setFilters] = useState({
        search: '',
        module: 'VENDORS',
        action: 'All',
        fromDate: '',
        toDate: ''
    });

    const [selectedRows, setSelectedRows] = useState([]);

    const fetchLogs = () => {
        setIsLoading(true);
        // SIMULATING API WITH DUMMY DATA
        setTimeout(() => {
            try {
                let filtered = DUMMY_VENDOR_LOGS.filter(log => {
                    const matchesSearch = log.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        log.user?.toLowerCase().includes(filters.search.toLowerCase());
                    const matchesAction = filters.action === 'All' || log.action === filters.action;
                    return matchesSearch && matchesAction;
                });

                const limit = 10;
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const startIndex = (currentPage - 1) * limit;
                const paginatedRecords = filtered.slice(startIndex, startIndex + limit);

                setLogs(paginatedRecords);
                setTotalRecords(total);
                setPagination({
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1
                });
            } catch (error) {
                showToast('Failed to fetch logs', 'error');
            } finally {
                setIsLoading(false);
            }
        }, 300);
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, filters]);

    const handleSelectAll = (e) => setSelectedRows(e.target.checked ? logs.map(l => l.id) : []);
    const handleSelectOne = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
    const handleExport = (message, type) => { showToast(message, type); };

    return (
        <div className="c-table-container">
            {/* Filter Bar */}
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="c-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="input-with-icon" style={{ width: '150px' }}>
                        <History size={15} className="field-icon" />
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                        >
                            <option value="All">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                            <option value="STATUS_CHANGE">Status Change</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)', height: '40px' }}>
                        <Calendar size={15} color="#94a3b8" />
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#1e293b', outline: 'none', width: '110px' }}
                        />
                        <ArrowRight size={13} color="#cbd5e1" />
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => handleFilterChange('toDate', e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#1e293b', outline: 'none', width: '110px' }}
                        />
                    </div>
                </div>

                <div className="filter-controls">
                    <ExportActions
                        selectedCount={selectedRows.length}
                        onExport={handleExport}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">
                    <thead>
                        <tr>
                            <th style={{ width: '48px' }}>
                                <input
                                    type="checkbox"
                                    checked={logs.length > 0 && selectedRows.length === logs.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Log ID</th>
                            <th>Module</th>
                            <th>Profile</th>
                            <th>User Type</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                            <th>Timestamp</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="10" className="text-center p-8">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--primary-color)' }}>
                                        <Loader2 size={32} className="animate-spin" />
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>Loading logs...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.map((log) => (
                            <tr key={log.id} style={{ background: selectedRows.includes(log.id) ? '#f8fafc' : 'white' }}>
                                <td style={{ width: '48px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(log.id)}
                                        onChange={() => handleSelectOne(log.id)}
                                    />
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{log.id}</span>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{log.module}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div className="profile-avatar" style={{ width: '28px', height: '28px', border: '1px solid #e2e8f0', borderRadius: '50%', overflow: 'hidden' }}>
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user_id}`}
                                                alt={log.user}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>{log.user}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px' }}>{log.user_type}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${log.action === 'CREATE' ? 'status-live' : log.action === 'DELETE' ? 'status-blocked' : 'status-active'}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{log.description}</span>
                                </td>
                                <td>
                                    <code style={{ fontSize: '12px', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>{log.ip_address}</code>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                        {new Date(log.created_at).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${log.status === 'SUCCESS' ? 'status-live' : 'status-blocked'}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && logs.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center p-4" style={{ color: '#94a3b8' }}>
                                    No activity logs found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="c-pagination-info">
                    Showing {logs.length} of {totalRecords} results
                </span>
                <div className="c-pagination-btns">
                    <button
                        className="c-page-btn"
                        disabled={!pagination?.hasPrevPage || isLoading}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                        className="c-page-btn"
                        disabled={!pagination?.hasNextPage || isLoading}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorLogs;
