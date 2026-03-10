import React, { useState, useEffect, useMemo } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, User, Terminal, ArrowRight, Loader2 } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import { getAccessLogsApi } from '../../../api/subadmin.api';

const AccessLogs = ({ onShowToast }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState({
        action: '',
        fromDate: '',
        toDate: ''
    });
    const [selectedLogs, setSelectedLogs] = useState([]);

    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchQuery,
                action: filter.action,
                fromDate: filter.fromDate,
                toDate: filter.toDate
            };
            const res = await getAccessLogsApi(params);
            const { records, pagination: paginData } = res.data.data;
            setLogs(records || []);
            setPagination(paginData);
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to fetch access logs', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [currentPage, searchQuery, filter]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedLogs(logs.map(l => l.id));
        } else {
            setSelectedLogs([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedLogs(prev => prev.includes(id) ? prev.filter(lId => lId !== id) : [...prev, id]);
    };

    return (
        <div className="c-table-container">
            {/* Filter Section */}
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="c-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search user or IP..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)', height: '40px' }}>
                        <Calendar size={15} color="#94a3b8" />
                        <input
                            type="date"
                            value={filter.fromDate}
                            onChange={(e) => setFilter({ ...filter, fromDate: e.target.value })}
                            style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#1e293b', outline: 'none', width: '110px' }}
                        />
                        <ArrowRight size={13} color="#cbd5e1" />
                        <input
                            type="date"
                            value={filter.toDate}
                            onChange={(e) => setFilter({ ...filter, toDate: e.target.value })}
                            style={{ border: 'none', background: 'transparent', fontSize: '13px', color: '#1e293b', outline: 'none', width: '110px' }}
                        />
                    </div>

                    <div className="input-with-icon" style={{ width: '160px' }}>
                        {/* <Terminal size={15} className="field-icon" /> */}
                        <select
                            value={filter.action}
                            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
                        >
                            <option value="">All Actions</option>
                            <option value="Login">Login</option>
                            <option value="Update Sub-Admin">Update Sub-Admin</option>
                            <option value="Export Data">Export Data</option>
                            <option value="Payout Generated">Payout Generated</option>
                            <option value="Ticket Resolved">Ticket Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="filter-controls">
                    <ExportActions
                        selectedCount={selectedLogs.length}
                        onExport={onShowToast}
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
                                    checked={logs.length > 0 && selectedLogs.length === logs.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Profile</th>
                            <th>Full Name</th>
                            <th>Contact</th>
                            <th>Operation</th>
                            <th>Details</th>
                            <th>IP Address</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="8" className="text-center p-8">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--primary-color)' }}>
                                        <Loader2 size={32} className="animate-spin" />
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>Loading logs...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : logs.map(log => (
                            <tr key={log.id} style={{ background: selectedLogs.includes(log.id) ? '#f8fafc' : 'white' }}>
                                <td style={{ width: '48px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLogs.includes(log.id)}
                                        onChange={() => handleSelectOne(log.id)}
                                    />
                                </td>
                                <td>
                                    <div className="profile-avatar" style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '50%', overflow: 'hidden' }}>
                                        <img
                                            src={log.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${log.user}`}
                                            alt={log.user}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{log.user}</span>
                                </td>
                                <td>
                                    <span style={{ color: '#64748b', fontSize: '13px' }}>{log.contactNo}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${log.action.includes('Login') ? 'status-live' :
                                        log.action.includes('Delete') ? 'status-blocked' :
                                            log.action.includes('Export') ? 'status-pending' :
                                                log.action.includes('Update') ? 'status-approved' :
                                                    'status-active'
                                        }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{log.details}</span>
                                </td>
                                <td>
                                    <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', color: '#475569', border: '1px solid #e2e8f0' }}>
                                        {log.ip}
                                    </code>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                                        {new Date(log.createdAt).toLocaleString('en-US', {
                                            month: 'short', day: 'numeric', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && logs.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center p-4" style={{ color: '#94a3b8' }}>
                                    No access logs found matching criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="c-pagination-info">
                    Showing {logs.length} of {pagination.totalRecords} entries
                </span>
                <div className="c-pagination-btns">
                    <button
                        className="c-page-btn"
                        disabled={!pagination.hasPrevPage || isLoading}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                        className="c-page-btn"
                        disabled={!pagination.hasNextPage || isLoading}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessLogs;
