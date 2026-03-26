import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowRight, Loader2, Calendar, LogIn, ShieldAlert } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

// DUMMY ACCESS LOG DATA
const DUMMY_ACCESS_LOGS = [
    { id: 1, user_id: 201, user: 'Vendor Staff A', email: 'staffa@vendor.com', user_type: 'VENDOR_STAFF', login_status: 'SUCCESS', description: 'Successful login', ip_address: '10.10.0.11', user_agent: 'Chrome / Android', created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
    { id: 2, user_id: 202, user: 'Vendor Staff B', email: 'staffb@vendor.com', user_type: 'VENDOR_STAFF', login_status: 'SUCCESS', description: 'Successful login', ip_address: '10.10.0.12', user_agent: 'Safari / iPhone', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 3, user_id: 203, user: 'Vendor Staff C', email: 'staffc@vendor.com', user_type: 'VENDOR_STAFF', login_status: 'FAILED',  description: 'Invalid password',  ip_address: '10.10.0.13', user_agent: 'Firefox / Windows', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { id: 4, user_id: 204, user: 'Vendor Staff D', email: 'staffd@vendor.com', user_type: 'VENDOR_STAFF', login_status: 'FAILED',  description: 'Account inactive', ip_address: '10.10.0.14', user_agent: 'Chrome / MacOS', created_at: new Date(Date.now() - 1000 * 60 * 260).toISOString() },
    { id: 5, user_id: 201, user: 'Vendor Staff A', email: 'staffa@vendor.com', user_type: 'VENDOR_STAFF', login_status: 'SUCCESS', description: 'Successful login', ip_address: '10.10.0.11', user_agent: 'Chrome / Android', created_at: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
];

const AccessLogs = ({ onShowToast }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pagination, setPagination] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);

    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        fromDate: '',
        toDate: ''
    });

    const fetchLogs = () => {
        setIsLoading(true);
        setTimeout(() => {
            try {
                let filtered = DUMMY_ACCESS_LOGS.filter(log => {
                    const matchesSearch =
                        log.user?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        log.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        log.ip_address?.includes(filters.search);
                    const matchesStatus = filters.status === 'All' || log.login_status === filters.status;
                    return matchesSearch && matchesStatus;
                });

                const limit = 10;
                const total = filtered.length;
                const totalPages = Math.ceil(total / limit);
                const startIndex = (currentPage - 1) * limit;
                const paginated = filtered.slice(startIndex, startIndex + limit);

                setLogs(paginated);
                setTotalRecords(total);
                setPagination({ hasNextPage: currentPage < totalPages, hasPrevPage: currentPage > 1 });
            } finally {
                setIsLoading(false);
            }
        }, 300);
    };

    React.useEffect(() => {
        const timer = setTimeout(fetchLogs, 500);
        return () => clearTimeout(timer);
    }, [currentPage, filters]);

    const handleSelectAll = (e) => setSelectedRows(e.target.checked ? logs.map(l => l.id) : []);
    const handleSelectOne = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    return (
        <div className="c-table-container">
            {/* Filter Bar */}
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="c-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search user, email or IP..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    <div className="input-with-icon" style={{ width: '150px' }}>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="SUCCESS">Success</option>
                            <option value="FAILED">Failed</option>
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
                    <ExportActions selectedCount={selectedRows.length} onExport={onShowToast} />
                </div>
            </div>

            {/* Table */}
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
                            <th>Profile</th>
                            <th>Email</th>
                            <th>User Type</th>
                            <th>Login Status</th>
                            <th>Description</th>
                            <th>IP Address</th>
                            <th>Device / Browser</th>
                            <th>Timestamp</th>
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
                                    <input type="checkbox" checked={selectedRows.includes(log.id)} onChange={() => handleSelectOne(log.id)} />
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#4f46e5' }}>#{log.id}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img
                                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${log.user}`}
                                                alt={log.user}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>{log.user}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{log.email}</span>
                                </td>
                                <td>
                                    <span className="status-badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '10px' }}>{log.user_type}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${log.login_status === 'SUCCESS' ? 'status-live' : 'status-blocked'}`}>
                                        {log.login_status === 'SUCCESS' ? <LogIn size={10} style={{ marginRight: 3 }} /> : <ShieldAlert size={10} style={{ marginRight: 3 }} />}
                                        {log.login_status}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{log.description}</span>
                                </td>
                                <td>
                                    <code style={{ fontSize: '12px', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>{log.ip_address}</code>
                                </td>
                                <td>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{log.user_agent}</span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                        {new Date(log.created_at).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && logs.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center p-4" style={{ color: '#94a3b8' }}>
                                    No access logs found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="c-pagination-info">Showing {logs.length} of {totalRecords} results</span>
                <div className="c-pagination-btns">
                    <button className="c-page-btn" disabled={!pagination?.hasPrevPage || isLoading} onClick={() => setCurrentPage(p => p - 1)}>
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button className="c-page-btn" disabled={!pagination?.hasNextPage || isLoading} onClick={() => setCurrentPage(p => p + 1)}>
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessLogs;
