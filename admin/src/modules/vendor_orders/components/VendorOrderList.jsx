import React, { useState, useEffect } from 'react';
import { Eye, UserCheck, AlertCircle, FileText, Search, Filter, CheckSquare, Square, ChevronLeft, ChevronRight, Loader2, Calendar, X, Package, CreditCard } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import { exportOrdersToPDF, exportOrdersToExcel } from '../services/order_export.service';
import * as ordersService from '../services/orders.service';
import OrderView from './OrderView';

const VendorOrderList = ({ onAssignRider, onUpdateStatus, onUpdatePaymentStatus, onFetchSuccess, showToast }) => {
    const [orders, setOrders] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [filters, setFilters] = useState({ search: '', status: '', paymentStatus: '', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await ordersService.fetchOrders({
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status,
                payment_status: filters.paymentStatus,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            });

            setOrders(data.records);
            setPagination(prev => ({
                ...prev,
                totalRecords: data.pagination.totalRecords,
                totalPages: data.pagination.totalPages,
                hasNextPage: data.pagination.page < data.pagination.totalPages,
                hasPrevPage: data.pagination.page > 1
            }));
            if (onFetchSuccess) onFetchSuccess(data);
        } catch (error) {
            showToast(error.message || "Failed to load orders", "error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, filters]);

    const handleSelectAll = async (checked) => {
        if (checked) {
            try {
                setIsLoading(true);
                const data = await ordersService.fetchOrders({
                    limit: pagination.totalRecords || 1000,
                    search: filters.search,
                    status: filters.status,
                    payment_status: filters.paymentStatus,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate
                });
                const allIds = (data.records || []).map(o => o.id);
                setSelectedRows(allIds);
            } catch (error) {
                showToast('Failed to select all orders', 'error');
            } finally {
                setIsLoading(false);
            }
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]);
    };

    const handleExportDownload = (type, singleOrder = null) => {
        const dataToExport = singleOrder
            ? [singleOrder]
            : orders.filter(o => selectedRows.includes(o.id));

        if (dataToExport.length === 0) {
            showToast('Please select at least one record to export', 'warning');
            return;
        }

        try {
            if (type === 'pdf') {
                exportOrdersToPDF(dataToExport);
            } else if (type === 'excel') {
                exportOrdersToExcel(dataToExport);
            }
            showToast(`${type.toUpperCase()} exported successfully!`, 'success');
        } catch (error) {
            showToast('Failed to generate export file', 'error');
        }
    };

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({ search: '', status: '', paymentStatus: '', fromDate: '', toDate: '' });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const allSelected = orders.length > 0 && selectedRows.length === pagination.totalRecords;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const getStatusBadge = (status) => {
        const s = status.toLowerCase().replace(/\s+/g, '-');
        return <span className={`status-badge ${s}`}>{status}</span>;
    };

    const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

    const getNextStatuses = (currentStatus) => {
        switch (currentStatus) {
            case 'Pending': return ['Confirmed', 'Cancelled'];
            case 'Confirmed': return ['Shipped', 'Cancelled'];
            case 'Shipped': return ['Out for Delivery', 'Cancelled'];
            case 'Out for Delivery': return ['Delivered', 'Cancelled'];
            default: return [];
        }
    };

    const getPaymentStatusBadge = (status) => {
        const s = status ? status.toLowerCase() : 'pending';
        // reusing status-badge classes or defined inline
        const color = s === 'paid' ? '#10b981' : '#f59e0b';
        const bg = s === 'paid' ? '#ecfdf5' : '#fffbeb';
        return (
            <span style={{
                padding: '4px 8px',
                borderRadius: '999px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: bg,
                color: color,
                border: `1px solid ${color}`,
                textTransform: 'uppercase'
            }}>
                {status || 'Pending'}
            </span>
        );
    };

    if (isLoading && orders.length === 0) {
        return (
            <div className="o-table-container" style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b', fontWeight: 500 }}>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="o-table-wrapper">
            {/* Filter Bar integrated like subadmin */}
            <div className="order-filters-container">
                <div className="o-search">
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Search Order ID, Customer..."
                        value={filters.search}
                        onChange={(e) => setFilter('search', e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={filters.status}
                        onChange={(e) => setFilter('status', e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        className="filter-select"
                        value={filters.paymentStatus}
                        onChange={(e) => setFilter('paymentStatus', e.target.value)}
                    >
                        <option value="">Payment Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>

                    <div className="date-inputs">
                        <Calendar size={16} color="#94a3b8" />
                        <input
                            type="date"
                            value={filters.fromDate}
                            onChange={(e) => setFilter('fromDate', e.target.value)}
                        />
                        <span style={{ color: '#cbd5e1' }}>-</span>
                        <input
                            type="date"
                            value={filters.toDate}
                            onChange={(e) => setFilter('toDate', e.target.value)}
                        />
                    </div>

                    {(filters.search || filters.status || filters.paymentStatus || filters.fromDate || filters.toDate) && (
                        <button onClick={clearFilters} className="filter-clear-btn" title="Clear Filters">
                            <X size={18} />
                        </button>
                    )}
                </div>

                <div className="filter-actions" style={{ marginLeft: 'auto' }}>
                    <ExportActions
                        selectedCount={selectedRows.length}
                        onExport={showToast}
                        onDownload={handleExportDownload}
                    />
                </div>
            </div>

            <div className="o-table-container">
                <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1400px' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 12px', textAlign: 'left', width: '40px' }}>
                                <div onClick={() => handleSelectAll(!allSelected)} style={{ cursor: 'pointer' }}>
                                    {allSelected && pagination.totalRecords > 0
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>IMAGE</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ORDER & PRODUCT</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CUSTOMER</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CONTACT</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>QTY</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PAYMENT</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>STATUS</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RIDER</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ADDRESS</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PLACED</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>STATUS DATE</th>
                            <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                                <td style={{ padding: '16px 12px' }}>
                                    <div onClick={() => handleSelectOne(order.id)} style={{ cursor: 'pointer' }}>
                                        {selectedRows.includes(order.id)
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    <img
                                        src={order.productImage || order.items[0]?.image}
                                        alt="Product"
                                        style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }}
                                    />
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '0.8rem' }}>
                                            #{order.orderNumber}
                                        </span>
                                        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.2 }}>
                                            {order.items[0]?.name}
                                        </span>
                                        {order.items.length > 1 && (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1' }}>
                                                (+{order.items.length - 1} more items)
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>{order.customerName}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerId || 'ID: N/A'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{order.customerPhone}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerEmail || 'No Email'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600 }}>{order.productsCount}</td>
                                <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 700, color: '#4f46e5' }}>{formatCurrency(order.totalAmount)}</td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    {getPaymentStatusBadge(order.paymentStatus)}
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    {getStatusBadge(order.status)}
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    {order.assignedRider ? (
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                                {order.assignedRider.charAt(0)}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{order.assignedRider}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 auto' }} title={order.deliveryAddress}>
                                        {order.deliveryAddress}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                                    {order.createdDate}
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                                    {order.statusDate || '-'}
                                </td>
                                <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div className="action-buttons-group">
                                            <div className="action-select-wrapper status-update">
                                                <Package size={14} className="select-icon" />
                                                <select
                                                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                                                    value={order.status}
                                                    className="premium-select"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for Delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            <div className="action-select-wrapper payment-update">
                                                <CreditCard size={14} className="select-icon" />
                                                <select
                                                    onChange={(e) => onUpdatePaymentStatus(order.id, e.target.value)}
                                                    className={`premium-select payment ${order.paymentStatus === 'Paid' ? 'is-paid' : ''}`}
                                                    value={order.paymentStatus || 'Pending'}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Paid">Mark as Paid</option>
                                                    <option value="Failed">Mark as Failed</option>
                                                    <option value="Refunded">Refunded</option>
                                                </select>
                                            </div>

                                            <button
                                                onClick={() => setViewingOrder(order)}
                                                className="action-view-btn"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination block inside like subadmin */}
            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                <span className="c-pagination-info">
                    Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.totalRecords)}–{Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} orders
                </span>
                <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        className="c-page-btn"
                        disabled={!pagination.hasPrevPage || isLoading}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                        {pagination.page} / {pagination.totalPages || 1}
                    </span>
                    <button
                        className="c-page-btn"
                        disabled={!pagination.hasNextPage || isLoading}
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <style>{`
                .table-row-hover:hover { background: #f8fafc; }
                .o-table-wrapper { background: white; border-radius: 16px; overflow: hidden; }
                
                .action-buttons-group {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    align-items: center;
                }

                .action-select-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .select-icon {
                    position: absolute;
                    left: 10px;
                    pointer-events: none;
                    color: #64748b;
                }

                .premium-select {
                    padding: 8px 12px 8px 30px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    outline: none;
                    background: #f8fafc;
                    color: #334155;
                    transition: all 0.2s;
                    appearance: none;
                    -webkit-appearance: none;
                    min-width: 130px;
                }

                .premium-select:hover {
                    border-color: #cbd5e1;
                    background: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .premium-select.payment {
                    color: #10b981;
                    border-color: #d1fae5;
                    background: #f0fdf4;
                }

                .premium-select.payment:hover {
                    border-color: #10b981;
                    background: white;
                }

                .premium-select.payment.is-paid {
                    background-color: #dcfce7;
                    border-color: #86efac;
                    color: #15803d;
                }

                .action-view-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #6366f1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .action-view-btn:hover {
                    background: #f5f3ff;
                    color: #4f46e5;
                    border-color: #c7d2fe;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
            `}</style>

            {viewingOrder && (
                <OrderView order={viewingOrder} onClose={() => setViewingOrder(null)} />
            )}
        </div>
    );
};

export default VendorOrderList;

