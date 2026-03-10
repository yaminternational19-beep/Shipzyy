import React, { useState, useMemo } from 'react';
import {
    Search,
    Calendar,
    History,
    FileEdit,
    LogIn,
    ShieldAlert,
    Package,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';

const VendorLogs = ({ showToast }) => {
    const [filters, setFilters] = useState({
        search: '',
        vendor: '',
        companyName: '',
        actionType: 'All',
        status: 'All',
        fromDate: '',
        toDate: ''
    });
    const [selectedRows, setSelectedRows] = useState([]);

    const mockLogs = [
        { id: 'LOG-8821', vendorName: 'Organic Harvest Co', companyName: 'Organic Harvest Private Limited', address: '12-B, Green Valley, Dehradun', vendorId: 'V-8821', action: 'Product Added', details: 'Added "Organic Himalayan Green Tea" to inventory', editedBy: 'Amit Kumar', timestamp: '17 Feb 26, 12:45 PM', ip: '192.168.1.45', status: 'Success' },
        { id: 'LOG-8822', vendorName: 'ElectroHub Retail', companyName: 'ElectroHub Digital Solutions', address: 'Plot 45, Tech Park, Bangalore', vendorId: 'V-9902', action: 'Login Attempt', details: 'Successful login from new device (MacBook Pro)', editedBy: 'System Auto', timestamp: '17 Feb 26, 11:30 AM', ip: '103.24.55.12', status: 'Success' },
        { id: 'LOG-8823', vendorName: 'Fashion Forward', companyName: 'FF Retail & Lifestyle', address: 'Sector 18, Noida, UP', vendorId: 'V-4412', action: 'KYC Resubmitted', details: 'Updated PAN card document after rejection', editedBy: 'Suresh Raina', timestamp: '17 Feb 26, 10:15 AM', ip: '172.16.0.101', status: 'Success' },
        { id: 'LOG-8824', vendorName: 'TechSolution Ltd', companyName: 'TechSolution Global Services', address: 'Cyber Hub, DLF Phase 3, Gurgaon', vendorId: 'V-1001', action: 'Price Update', details: 'Changed MRP of "Wireless Earbuds" from ₹1200 to ₹1500', editedBy: 'John Doe', timestamp: '16 Feb 26, 05:20 PM', ip: '192.168.1.12', status: 'Success' },
        { id: 'LOG-8825', vendorName: 'GroceryMart', companyName: 'GroceryMart Retail Chain', address: 'MG Road, Pune, Maharashtra', vendorId: 'V-1002', action: 'Unauthorized Access', details: 'Multiple failed password attempts detected', editedBy: 'Security Bot', timestamp: '16 Feb 26, 04:00 PM', ip: '45.12.33.190', status: 'Failed' },
        { id: 'LOG-8826', vendorName: 'Organic Harvest Co', companyName: 'Organic Harvest Private Limited', address: '12-B, Green Valley, Dehradun', vendorId: 'V-8821', action: 'Payout Requested', details: 'Requested payout of ₹45,000 to HDFC Bank', editedBy: 'Amit Kumar', timestamp: '16 Feb 26, 02:30 PM', ip: '192.168.1.45', status: 'Success' }
    ];

    const filteredLogs = useMemo(() => {
        return mockLogs.filter(log => {
            const searchMatch = !filters.search ||
                log.vendorName.toLowerCase().includes(filters.search.toLowerCase()) ||
                log.id.toLowerCase().includes(filters.search.toLowerCase());
            const companyMatch = !filters.companyName || log.companyName === filters.companyName;
            const statusMatch = filters.status === 'All' || log.status === filters.status;
            const typeMatch = filters.actionType === 'All' ||
                (filters.actionType === 'Product' && log.action.includes('Product')) ||
                (filters.actionType === 'Login' && log.action.includes('Login')) ||
                (filters.actionType === 'KYC' && log.action.includes('KYC')) ||
                (filters.actionType === 'Finance' && log.action.includes('Payout'));
            return searchMatch && companyMatch && typeMatch && statusMatch;
        });
    }, [filters]);

    const uniqueCompanies = useMemo(() => [...new Set(mockLogs.map(l => l.companyName))], []);

    const handleSelectAll = (e) => setSelectedRows(e.target.checked ? filteredLogs.map(l => l.id) : []);
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

                    <div className="input-with-icon" style={{ width: '170px' }}>
                        <History size={15} className="field-icon" />
                        <select
                            value={filters.companyName}
                            onChange={(e) => handleFilterChange('companyName', e.target.value)}
                        >
                            <option value="">All Companies</option>
                            {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="input-with-icon" style={{ width: '150px' }}>
                        <LogIn size={15} className="field-icon" />
                        <select
                            value={filters.actionType}
                            onChange={(e) => handleFilterChange('actionType', e.target.value)}
                        >
                            <option value="All">All Actions</option>
                            <option value="Product">Product Updates</option>
                            <option value="Login">Access Logs</option>
                            <option value="KYC">Security / KYC</option>
                            <option value="Finance">Financials</option>
                        </select>
                    </div>

                    <div className="input-with-icon" style={{ width: '130px' }}>
                        <ShieldAlert size={15} className="field-icon" />
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Success">Success</option>
                            <option value="Failed">Failed</option>
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
                        <span style={{ color: '#cbd5e1', fontSize: '12px' }}>–</span>
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
                                    checked={filteredLogs.length > 0 && selectedRows.length === filteredLogs.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Log ID</th>
                            <th>Vendor</th>
                            <th>Profile</th>
                            <th>Edited By</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                            <th>Timestamp</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log) => (
                            <tr key={log.id} style={{ background: selectedRows.includes(log.id) ? '#f8fafc' : 'white' }}>
                                <td style={{ width: '48px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(log.id)}
                                        onChange={() => handleSelectOne(log.id)}
                                    />
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#4f46e5' }}>{log.id}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>{log.vendorName}</span>
                                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>{log.companyName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="profile-avatar" style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0' }}>
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.editedBy}`}
                                            alt={log.editedBy}
                                            style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{log.editedBy}</span>
                                </td>
                                <td>
                                    <span className="status-badge" style={{ background: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '11px', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{log.details}</span>
                                </td>
                                <td>
                                    <code style={{ fontSize: '12px', color: '#4f46e5', background: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>{log.ip}</code>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{log.timestamp}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${log.status === 'Success' ? 'status-live' : 'status-blocked'}`}>
                                        {log.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Section */}
            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="c-pagination-info">
                    Showing {filteredLogs.length} of {mockLogs.length} results
                </span>
                <div className="c-pagination-btns">
                    <button className="c-page-btn" disabled>
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button className="c-page-btn">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorLogs;
