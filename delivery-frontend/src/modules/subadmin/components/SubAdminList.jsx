import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckSquare, Square, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import ActionButtons from '../../../components/common/ActionButtons';
import { getSubAdminsApi } from '../../../api/subadmin.api';
import { exportSubAdminsToPDF, exportSubAdminsToExcel } from '../services/export.service';

import { menuItems } from '../../../utils/menuConfig';

const SubAdminList = ({ onEdit, onEditPermissions, onDeactivate, onDelete, onShowToast, onFetchSuccess }) => {
    const [selectedSubAdmins, setSelectedSubAdmins] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [fromDate, setFromDate] = useState('');

    const [subAdmins, setSubAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalRecords: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });

    const roles = [
        { label: 'Sub Admin', value: 'Sub Admin' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Support', value: 'Support' },
    ];

    const fetchSubAdmins = async () => {
        setIsLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 10,
                search: searchQuery,
                role: selectedRole,
            };
            const res = await getSubAdminsApi(params);
            const data = res.data.data;
            const { records, pagination: paginData } = data;
            setSubAdmins(records || []);
            setPagination(paginData);
            if (onFetchSuccess) onFetchSuccess(data);
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to fetch sub-admins', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSubAdmins();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, selectedRole, currentPage]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedSubAdmins(subAdmins.map(u => u.id));
        } else {
            setSelectedSubAdmins([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedSubAdmins(prev => prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]);
    };

    const handleReset = () => {
        setSearchQuery('');
        setSelectedRole('');
        setFromDate('');
    };

    const handleExportDownload = (type) => {
        // filter subadmins that are currently selected
        const selectedData = subAdmins.filter(admin => selectedSubAdmins.includes(admin.id));

        if (selectedData.length === 0) {
            onShowToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportSubAdminsToPDF(selectedData);
                onShowToast(`Exported ${selectedData.length} records as PDF successfully!`, 'success');
            } else if (type === 'excel') {
                exportSubAdminsToExcel(selectedData);
                onShowToast(`Exported ${selectedData.length} records as Excel successfully!`, 'success');
            }
        } catch (error) {
            console.error('Export Error:', error);
            onShowToast('Failed to generate export file. Please try again.', 'error');
        }
    };

    return (
        <div className="c-table-container">
            {/* Filter Bar */}
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="c-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="input-with-icon" style={{ width: '180px' }}>
                        <Filter size={15} className="field-icon" />
                        <select
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Roles</option>
                            {roles.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="filter-controls">
                    <ExportActions
                        selectedCount={selectedSubAdmins.length}
                        onExport={onShowToast}
                        onDownload={handleExportDownload}
                    />
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedSubAdmins.length > 0 && (
                <div className="c-bulk-bar">
                    <span>{selectedSubAdmins.length} sub-admins selected</span>
                    <button onClick={() => setSelectedSubAdmins([])}>Clear Selection</button>
                </div>
            )}

            {/* Table Section */}
            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">

                    <thead>
                        <tr>
                            <th style={{ width: '48px' }}>
                                <div
                                    onClick={() => handleSelectAll({ target: { checked: selectedSubAdmins.length !== subAdmins.length } })}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {subAdmins.length > 0 && selectedSubAdmins.length === subAdmins.length
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </th>
                            <th>Profile</th>
                            <th>Full Name</th>
                            <th>Email Address</th>
                            <th>Contact No</th>
                            <th>Emergency No</th>
                            <th>Role</th>
                            <th>Address</th>
                            <th>Status</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="10" className="text-center p-8">
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--primary-color)' }}>
                                        <Loader2 size={32} className="animate-spin" />
                                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>Loading records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : subAdmins.map(user => (
                            <tr key={user.id} style={{ background: selectedSubAdmins.includes(user.id) ? '#f8fafc' : 'white' }}>
                                <td>
                                    <div
                                        onClick={() => handleSelectOne(user.id)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {selectedSubAdmins.includes(user.id)
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </td>
                                <td>
                                    <div className="profile-avatar" style={{ width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%', overflow: 'hidden' }}>
                                        <img
                                            src={user.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                                            alt={user.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;
                                            }}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{user.name}</span>
                                </td>
                                <td>
                                    <span style={{ color: '#475569', fontSize: '13px' }}>{user.email}</span>
                                </td>
                                <td>
                                    <span style={{ color: '#1e293b', fontWeight: 500 }}>{user.contactNo}</span>
                                </td>
                                <td>
                                    <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '13px' }}>{user.emergencyNo}</span>
                                </td>
                                <td>
                                    <span className="status-badge status-approved">{user.role?.replace('_', ' ')}</span>
                                </td>
                                <td>
                                    <div style={{ maxWidth: '200px', lineHeight: '1.4' }}>
                                        <div style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }} title={user.address}>
                                            {user.address}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                                            {user.state}{user.country ? `, ${user.country}` : ''}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${user.status === 'Active' ? 'status-live' : 'status-blocked'}`}>
                                        {(user.status === 'Pending' ? 'Inactive' : user.status)?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="col-actions">
                                    <ActionButtons
                                        onEdit={() => onEdit(user)}
                                        onDelete={() => onDelete(user)}
                                        onPermissions={() => onEditPermissions(user)}
                                        onToggleStatus={() => onDeactivate(user)}
                                        isActive={user.status === 'Active'}
                                    />
                                </td>
                            </tr>
                        ))}
                        {!isLoading && subAdmins.length === 0 && (
                            <tr>
                                <td colSpan="10" className="text-center p-4" style={{ color: '#94a3b8' }}>
                                    No sub-admins found matching criteria
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="c-pagination-info">
                    Showing {subAdmins.length} of {pagination.totalRecords} entries
                </span>
                <div className="c-pagination-btns">
                    <button
                        className="c-page-btn"
                        disabled={!pagination.hasPrevPage || isLoading}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                        className="c-page-btn"
                        disabled={!pagination.hasNextPage || isLoading}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubAdminList;
