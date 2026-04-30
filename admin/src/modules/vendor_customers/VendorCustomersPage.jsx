import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, X, MapPin, Calendar, CheckCircle } from 'lucide-react';
import { getVendorCustomersApi, getVendorCustomerDetailsApi } from '../../api/vendor_customers.api';
import CustomerStats from './components/CustomerStats';
import CustomerList from './components/CustomerList';
import Toast from '../../components/common/Toast/Toast';
import ExportActions from '../../components/common/ExportActions';
import { exportCustomersToPDF, exportCustomersToExcel } from './services/export.service';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSafeImage } from '../../utils/imageUtils';

const VendorCustomersPage = () => {
    // State
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    
    const [filters, setFilters] = useState({ search: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [selectedRows, setSelectedRows] = useState([]);

    // View Modal State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Fetch List
    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search || undefined
            };

            const res = await getVendorCustomersApi(params);
            if (res.data.success) {
                setCustomers(res.data.data.records || []);
                setStats(res.data.data.stats || {});
                setPagination(prev => ({
                    ...prev,
                    total: res.data.data.pagination.totalRecords || 0,
                    totalPages: res.data.data.pagination.totalPages || 0
                }));
                setSelectedRows([]); // Reset selection when data changes
            }
        } catch (error) {
            console.error("Vendor Customers API Error:", error);
            showToast(error.response?.data?.message || 'Failed to fetch customers', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Action Handler
    const handleAction = async (action, customer) => {
        if (action === 'view') {
            setSelectedCustomer({ basic: customer });
            setDetailLoading(true);
            try {
                const res = await getVendorCustomerDetailsApi(customer.id);
                if (res.data.success) {
                    setSelectedCustomer(res.data.data);
                }
            } catch (err) {
                showToast("Failed to load customer details", "error");
                setSelectedCustomer(null);
            } finally {
                setDetailLoading(false);
            }
        }
    };

    // Selection Handlers
    const handleSelectRow = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const handleSelectAll = (selectAll) => {
        if (selectAll) {
            setSelectedRows(customers.map(c => c.id));
        } else {
            setSelectedRows([]);
        }
    };

    return (
        <div className="management-module">
            {/* Header */}
            <div className="module-header" style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                    My Customers
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                    View details and aggregated sales info for all customers who have purchased your products.
                </p>
            </div>

            {/* Stats */}
            <CustomerStats stats={stats} />

            {/* Table Section */}
            <div className="table-section" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                    </div>
                )}

                {/* Filters Row */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={filters.search}
                            onChange={(e) => {
                                setFilters({ search: e.target.value });
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            style={{
                                width: '100%', padding: '10px 16px 10px 40px',
                                border: '1px solid var(--border-color)', borderRadius: '10px',
                                background: '#f8fafc', fontSize: '0.9rem', outline: 'none'
                            }}
                        />
                    </div>
                    
                    <ExportActions 
                        selectedCount={selectedRows.length} 
                        onExport={(msg, type) => showToast(msg, type)} 
                        onDownload={(type) => {
                            const dataToExport = customers.filter(c => selectedRows.includes(c.id));
                            if (type === 'pdf') {
                                exportCustomersToPDF(dataToExport);
                            } else if (type === 'excel') {
                                exportCustomersToExcel(dataToExport);
                            }
                            setSelectedRows([]); // Clear selection after export
                        }} 
                    />
                </div>

                {/* Data List container */}
                <div style={{ overflowX: 'auto', width: '100%' }}>
                    <CustomerList 
                        customers={customers} 
                        onAction={handleAction} 
                        selectedRows={selectedRows}
                        onSelectRow={handleSelectRow}
                        onSelectAll={handleSelectAll}
                    />
                </div>

                {/* Pagination */}
                <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="c-pagination-info" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {pagination.total === 0
                            ? 'No customers found'
                            : `Showing ${Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} – ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
                        }
                    </span>
                    <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            <ChevronLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Prev
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                            {pagination.page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'white', cursor: (pagination.page >= pagination.totalPages || pagination.totalPages === 0) ? 'not-allowed' : 'pointer' }}
                        >
                            Next <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} />
                        </button>
                    </div>
                </div>

            </div>

            {/* View Modal */}
            {selectedCustomer && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '24px', width: '90%', maxWidth: '600px', padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <button 
                            onClick={() => setSelectedCustomer(null)}
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={20} />
                        </button>

                        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.4rem', color: '#1e293b' }}>Customer Profile</h2>

                        {detailLoading ? (
                            <div style={{ padding: '40px', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary-color)" style={{ margin: '0 auto' }} />
                                <p style={{ marginTop: '16px', color: '#64748b' }}>Loading profile...</p>
                            </div>
                        ) : selectedCustomer.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Header / Profile */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #e2e8f0' }}>
                                        <img src={getSafeImage(selectedCustomer.profile_image, 'USER')} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a' }}>{selectedCustomer.name}</h3>
                                        <span className={`status-badge ${selectedCustomer.status === 'active' ? 'active' : 'inactive'}`} style={{ marginTop: '10px', display: 'inline-block' }}>
                                            {selectedCustomer.status}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />

                                {/* Split Detail Blocks Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Email Address
                                        </div>
                                        <div style={{ color: '#0f172a', fontWeight: 500 }}>
                                            {selectedCustomer.email || '-'}
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                            Phone Number
                                        </div>
                                        <div style={{ color: '#0f172a', fontWeight: 500 }}>
                                            {selectedCustomer.phone || '-'}
                                        </div>
                                    </div>

                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <Calendar size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                                            Joined Date
                                        </div>
                                        <div style={{ color: '#0f172a', fontWeight: 500 }}>
                                            {new Date(selectedCustomer.joined_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                    
                                    {/* Location spans full width */}
                                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', gridColumn: '1 / -1' }}>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                                            <MapPin size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>
                                            Location (Default)
                                        </div>
                                        <div style={{ color: '#0f172a', fontWeight: 500, lineHeight: 1.5 }}>
                                            {selectedCustomer.location || 'Unknown'}
                                        </div>
                                    </div>

                                </div>

                                {/* Vendor specific split data */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', marginTop: '8px' }}>
                                    <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '20px', borderRadius: '16px' }}>
                                        <div style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                                            Orders
                                        </div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#047857' }}>
                                            {selectedCustomer.orders_count}
                                        </div>
                                    </div>

                                    <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '20px', borderRadius: '16px' }}>
                                        <div style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                                            Total Spent (Yours)
                                        </div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#047857' }}>
                                            ₹{selectedCustomer.total_spent.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
};

export default VendorCustomersPage;
