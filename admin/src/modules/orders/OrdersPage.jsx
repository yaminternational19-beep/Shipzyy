import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Clock, MapPin, Package, Loader2 } from 'lucide-react';
import OrderStats from './components/OrderStats';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import Toast from '../../components/common/Toast/Toast';
import { getAdminOrdersApi, getAdminOrderByIdApi } from '../../api/admin_orders.api';
import { getVendorsApi } from '../../api/vendor.api';
import { getSafeImage } from '../../utils/imageUtils';
import './Orders.css';

const OrdersPage = () => {
    // ─── State ────────────────────────────────────────────────────
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0, delivered: 0, onTheWay: 0, pending: 0
    });
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        payment_status: '',
        vendor: '',
        fromDate: '',
        toDate: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [selectedRows, setSelectedRows] = useState([]);
    const [vendorOptions, setVendorOptions] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // View modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // ─── Toast helper ─────────────────────────────────────────────
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // ─── Fetch orders ─────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search || undefined,
                status: filters.status || undefined,
                payment_status: filters.payment_status || undefined,
                vendor: filters.vendor || undefined,
                fromDate: filters.fromDate || undefined,
                toDate: filters.toDate || undefined
            };

            const res = await getAdminOrdersApi(params);
            const result = res.data;

            if (result.success) {
                const data = result.data;
                setOrders(data.records || []);
                setPagination(prev => ({
                    ...prev,
                    total: data.pagination?.totalRecords || 0,
                    totalPages: data.pagination?.totalPages || 0
                }));
                setStats({
                    total:    data.stats?.total     || 0,
                    delivered: data.stats?.delivered || 0,
                    onTheWay: data.stats?.outForDelivery || 0,
                    pending:  data.stats?.pending    || 0
                });
            }
        } catch (error) {
            console.error("Admin Orders API Error:", error);
            showToast(error.response?.data?.message || 'Failed to fetch orders', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filters]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await getVendorsApi({ limit: 1000 });
                if (response.data && response.data.data) {
                    setVendorOptions(response.data.data.records || response.data.data);
                }
            } catch (error) {
                console.error("Failed to load vendors for filter:", error);
            }
        };
        fetchVendors();
    }, []);

    // ─── View order detail ────────────────────────────────────────
    const handleAction = async (action, order) => {
        if (action === 'view') {
            setSelectedOrder(order);
            setOrderDetail(null);
            setDetailLoading(true);
            try {
                const res = await getAdminOrderByIdApi(order.id);
                if (res.data.success) {
                    setOrderDetail(res.data.data);
                }
            } catch (err) {
                showToast('Failed to load order details', 'error');
                setSelectedOrder(null);
            } finally {
                setDetailLoading(false);
            }
        }
    };

    // ─── Filter change ────────────────────────────────────────────
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // ─── Row selection ────────────────────────────────────────────
    const handleSelectRow = (id, checked) => {
        setSelectedRows(prev =>
            checked ? [...prev, id] : prev.filter(rowId => rowId !== id)
        );
    };

    const handleSelectAll = (checked) => {
        setSelectedRows(checked ? orders.map(o => o.id) : []);
    };

    const handleExport = (message, type = 'info') => {
        showToast(message, type);
    };

    // ─── Status badge helper ──────────────────────────────────────
    const getStatusClass = (status = '') =>
        status.toLowerCase().replace(/\s+/g, '-');

    // ─── Render ───────────────────────────────────────────────────
    return (
        <div className="orders-module management-module">
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Order Management
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track all customer orders, delivery status and payment details
                    </p>
                </div>
            </div>

            {/* Stats */}
            <OrderStats stats={stats} />

            {/* Table Section */}
            <div className="orders-table-section" style={{ position: 'relative' }}>
                {loading && (
                    <div className="table-loader-overlay">
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                    </div>
                )}

                <div className="orders-data-wrapper">
                    <OrderFilters
                        filters={filters}
                        setFilters={handleFilterChange}
                        vendorOptions={vendorOptions}
                        selectedCount={selectedRows.length}
                        onExport={handleExport}
                        onClear={() => handleFilterChange({
                            search: '', status: '', payment_status: '', vendor: '', fromDate: '', toDate: ''
                        })}
                    />

                    <OrderList
                        orders={orders}
                        selectedRows={selectedRows}
                        onAction={handleAction}
                        onSelectRow={handleSelectRow}
                        onSelectAll={handleSelectAll}
                    />
                </div>

                {/* Pagination */}
                <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                    <span className="c-pagination-info">
                        {pagination.total === 0
                            ? 'No orders found'
                            : `Showing ${Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} – ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} orders`
                        }
                    </span>
                    <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page === 1}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        >
                            <ChevronLeft size={14} /> Prev
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                            {pagination.page} / {pagination.totalPages || 1}
                        </span>
                        <button
                            className="c-page-btn"
                            disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Order Detail Modal ──────────────────────────────── */}
            {selectedOrder && (
                <div className="rider-modal-overlay">
                    <div className="rider-modal-content" style={{ maxWidth: '960px', width: '95%' }}>
                        <button
                            className="icon-btn close-modal"
                            style={{ position: 'absolute', top: '20px', right: '20px' }}
                            onClick={() => { setSelectedOrder(null); setOrderDetail(null); }}
                        >
                            <X size={24} />
                        </button>

                        {detailLoading ? (
                            <div style={{ padding: '80px', textAlign: 'center' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                                <p style={{ marginTop: '16px', color: '#64748b' }}>Loading order details…</p>
                            </div>
                        ) : orderDetail ? (
                            <>
                                {/* Modal Header */}
                                <div className="rider-dash-header">
                                    <div className="rider-profile-info">
                                        <div className="rider-avatar-main" style={{ background: 'var(--primary-color)' }}>
                                            {orderDetail.customer.name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                                                {orderDetail.customer.name}
                                            </h2>
                                            <p style={{ color: '#64748b', margin: '4px 0', fontSize: '0.88rem' }}>
                                                {orderDetail.customer.id} · {orderDetail.customer.email}
                                            </p>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                                                {orderDetail.customer.phone}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 600, color: '#64748b', fontSize: '0.82rem' }}>
                                            #{orderDetail.orderNumber}
                                        </p>
                                        <span
                                            className={`status-badge ${getStatusClass(orderDetail.status)}`}
                                            style={{ marginTop: '8px', display: 'inline-block', fontSize: '0.88rem', padding: '6px 16px', borderRadius: '10px' }}
                                        >
                                            {orderDetail.status}
                                        </span>
                                        <p style={{ margin: '8px 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>
                                            {orderDetail.createdDate}
                                        </p>
                                    </div>
                                </div>

                                {/* Body */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '28px' }}>

                                    {/* Left — Order Items */}
                                    <div className="order-items-section">
                                        <h3 className="modal-section-title">
                                            <Package size={20} color="var(--primary-color)" /> Order Items
                                        </h3>
                                        <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                                            <table className="order-items-table">
                                                <thead>
                                                    <tr>
                                                        <th>PRODUCT</th>
                                                        <th style={{ textAlign: 'center' }}>QTY</th>
                                                        <th style={{ textAlign: 'right' }}>PRICE</th>
                                                        <th style={{ textAlign: 'right' }}>TOTAL</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderDetail.items.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    {item.productImage ? (
                                                                        <img
                                                                            src={getSafeImage(item.productImage, 'PRODUCT')}
                                                                            alt={item.productName}
                                                                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                                                        />
                                                                    ) : (
                                                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Package size={16} color="#94a3b8" />
                                                                        </div>
                                                                    )}
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1e293b' }}>{item.productName}</div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.brand}</span>
                                                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)', fontWeight: 600, background: '#f0f7ff', padding: '0 6px', borderRadius: '4px' }}>
                                                                                Vendor: {item.vendorName}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {/* Item Level Badges */}
                                                                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                                                                            <span className={`status-badge ${getStatusClass(item.status)}`} 
                                                                                style={{ fontSize: '0.62rem', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.02em' }}>
                                                                                {item.status}
                                                                            </span>
                                                                            <span 
                                                                                style={{ 
                                                                                    fontSize: '0.62rem', 
                                                                                    padding: '2px 8px', 
                                                                                    borderRadius: '4px', 
                                                                                    textTransform: 'uppercase',
                                                                                    fontWeight: 700,
                                                                                    letterSpacing: '0.02em',
                                                                                    background: (item.paymentStatus === 'Paid') ? '#dcfce7' : '#fef9c3',
                                                                                    color: (item.paymentStatus === 'Paid') ? '#15803d' : '#a16207',
                                                                                    border: `1px solid ${(item.paymentStatus === 'Paid') ? '#bbf7d0' : '#fef08a'}`,
                                                                                    minWidth: 'fit-content',
                                                                                    display: 'inline-block'
                                                                                }}>
                                                                                {item.paymentStatus || 'PENDING'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                            <td style={{ textAlign: 'right' }}>₹{item.price.toFixed(2)}</td>
                                                            <td style={{ textAlign: 'right', color: 'var(--primary-color)', fontWeight: 700 }}>
                                                                ₹{item.lineTotal.toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {/* Totals */}
                                            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '2px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {orderDetail.discountAmount > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                        <span style={{ color: '#64748b' }}>Coupon {orderDetail.couponCode ? `(${orderDetail.couponCode})` : ''}</span>
                                                        <span style={{ color: '#10b981', fontWeight: 600 }}>- ₹{orderDetail.discountAmount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#64748b' }}>Delivery Charge</span>
                                                    <span style={{ fontWeight: 600 }}>₹{orderDetail.deliveryCharge.toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', marginTop: '4px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                                                    <span style={{ color: '#64748b' }}>Total Paid</span>
                                                    <span style={{ color: 'var(--primary-color)', fontSize: '1.15rem' }}>
                                                        ₹{orderDetail.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right — Delivery & Payment */}
                                    <div className="rider-details-section">
                                        {/* Delivery Address */}
                                        <h3 className="modal-section-title">
                                            <MapPin size={20} color="#f59e0b" /> Delivery Address
                                        </h3>
                                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                                                {orderDetail.deliveryAddress.contactName}
                                            </p>
                                            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                                                {orderDetail.deliveryAddress.contactPhone}
                                            </p>
                                            <p style={{ margin: '10px 0 0', fontSize: '0.88rem', color: '#374151', lineHeight: '1.6' }}>
                                                {orderDetail.deliveryAddress.line1}
                                                {orderDetail.deliveryAddress.line2 && `, ${orderDetail.deliveryAddress.line2}`}
                                                {orderDetail.deliveryAddress.landmark && ` (${orderDetail.deliveryAddress.landmark})`}
                                                <br />
                                                {orderDetail.deliveryAddress.city}, {orderDetail.deliveryAddress.state} — {orderDetail.deliveryAddress.pincode}
                                            </p>
                                        </div>

                                        {/* Payment */}
                                        <h3 className="modal-section-title" style={{ marginTop: '20px' }}>
                                            <Clock size={20} color="#8b5cf6" /> Payment Info
                                        </h3>
                                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#64748b' }}>Method</span>
                                                    <span style={{ fontWeight: 600 }}>{orderDetail.paymentMethod || '-'}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#64748b' }}>Payment Status</span>
                                                    <span className={`status-badge ${getStatusClass(orderDetail.paymentStatus)}`}
                                                        style={{ padding: '3px 10px', fontSize: '0.75rem' }}>
                                                        {orderDetail.paymentStatus || '-'}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ color: '#64748b' }}>Ordered On</span>
                                                    <span style={{ fontWeight: 600 }}>{orderDetail.createdDate}</span>
                                                </div>
                                                {orderDetail.status === 'Delivered' && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span style={{ color: '#64748b' }}>Delivered On</span>
                                                        <span style={{ fontWeight: 600, color: '#10b981' }}>{orderDetail.updatedDate}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vendor(s) */}
                                        {orderDetail.items.length > 0 && (
                                            <>
                                                <h3 className="modal-section-title" style={{ marginTop: '20px' }}>
                                                    <Package size={20} color="#0ea5e9" /> Vendor Details
                                                </h3>
                                                {[...new Map(orderDetail.items.map(i => [i.vendorId, i])).values()].map((item, idx) => (
                                                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', marginBottom: '10px' }}>
                                                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>{item.vendorCompany}</p>
                                                        <p style={{ margin: '3px 0', fontSize: '0.8rem', color: '#64748b' }}>{item.vendorName}</p>
                                                        <p style={{ margin: '3px 0', fontSize: '0.8rem', color: '#64748b' }}>{item.vendorPhone} · {item.vendorEmail}</p>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default OrdersPage;
