import React, { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, X, Clock, MapPin, UserMinus } from 'lucide-react';
import OrderStats from './components/OrderStats';
import OrderFilters from './components/OrderFilters';
import OrderList from './components/OrderList';
import Toast from '../../components/common/Toast/Toast';
import './Orders.css';

// Mock Data Generation
const MOCK_ORDERS = Array.from({ length: 50 }, (_, i) => {
    const statuses = ['Delivered', 'On the Way', 'Pending', 'Cancelled'];
    const status = statuses[i % 4];
    return {
        id: `ORD-${2000 + i}`,
        customerId: `CUST-${100 + i}`,
        customerName: i % 3 === 0 ? 'John Wick' : i % 3 === 1 ? 'Bruce Wayne' : 'Clark Kent',
        customerEmail: i % 3 === 0 ? 'wick@example.com' : i % 3 === 1 ? 'wayne@enterprises.com' : 'kent@dailyplanet.com',
        customerPhone: i % 2 === 0 ? '+91 99999 88888' : '+91 77777 66666',
        riderId: `RID-${500 + i}`,
        riderName: i % 3 === 0 ? 'Alex Rider' : i % 3 === 1 ? 'Sam Smith' : 'Jordan Lee',
        itemId: `ITEM-${1000 + i}`,
        itemName: i % 3 === 0 ? 'Laptop Charger' : i % 3 === 1 ? 'Leather Jacket' : 'Smartphone Case',
        brand: i % 4 === 0 ? 'Samsung' : i % 4 === 1 ? 'Nike' : i % 4 === 2 ? 'Sony' : 'Apple',
        vendorCompanyName: i % 4 === 0 ? 'Tech Mart' : i % 4 === 1 ? 'Fashion Ave' : 'Global Electronics',
        vendorName: i % 2 === 0 ? 'John Doe' : 'Jane Smith',
        vendorPhone: i % 2 === 0 ? '+91 91234 56789' : '+91 82345 67890',
        vendorEmail: i % 2 === 0 ? 'john.doe@techmart.com' : 'jane.smith@fashionave.com',
        category: i % 3 === 0 ? 'Electronics' : i % 3 === 1 ? 'Fashion' : 'Accessories',
        subCategory: i % 3 === 0 ? (i % 2 === 0 ? 'Mobile' : 'Laptop') : 'Footwear',
        productName: i % 3 === 0 ? 'Laptop Charger' : i % 3 === 1 ? 'Leather Jacket' : 'Smartphone Case',
        image: i % 2 === 0 ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop' : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
        status: status,
        riderContact: `+1 555-0${100 + i}`,
        riderEmail: `rider${500 + i}@delivery.com`,
        orderedDate: new Date(Date.now() - (i * 86400000 + Math.random() * 43200000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/,/g, ''),
        deliveredDate: status === 'Delivered' ? new Date(Date.now() - (i * 86400000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/,/g, '') : '---',
        createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
        orderItems: [
            { name: i % 3 === 0 ? 'Laptop Charger' : i % 3 === 1 ? 'Leather Jacket' : 'Smartphone Case', qty: 1, price: '$45.00' },
            { name: 'Priority Delivery', qty: 1, price: '$5.00' }
        ],
        riderStats: {
            totalOrders: 120 + i,
            avgTimePerOrder: `${25 + (i % 15)} mins`,
            successRate: '98%',
            activeSince: 'Jan 2024'
        }
    };
});

const OrdersPage = () => {
    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        brand: '',
        vendor: '',
        category: '',
        subCategory: '',
        status: '',
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
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [selectedRider, setSelectedRider] = useState(null);

    // Simulate Fetching Data
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setOrders(MOCK_ORDERS);
            setLoading(false);
        }, 800);
    }, []);

    // Filtering Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const searchMatch = !filters.search ||
                order.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                order.customerId.toLowerCase().includes(filters.search.toLowerCase()) ||
                order.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
                order.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
                order.vendorCompanyName.toLowerCase().includes(filters.search.toLowerCase());

            const vendorMatch = !filters.vendor || order.vendorCompanyName.includes(filters.vendor);
            const brandMatch = !filters.brand || order.brand === filters.brand;
            const categoryMatch = !filters.category || order.category === filters.category;
            const subCategoryMatch = !filters.subCategory || order.subCategory === filters.subCategory;
            const statusMatch = !filters.status || order.status.toLowerCase() === filters.status.toLowerCase();

            let dateMatch = true;
            if (filters.fromDate) {
                dateMatch = dateMatch && new Date(order.createdAt) >= new Date(filters.fromDate);
            }
            if (filters.toDate) {
                dateMatch = dateMatch && new Date(order.createdAt) <= new Date(filters.toDate);
            }

            return searchMatch && vendorMatch && brandMatch && categoryMatch && subCategoryMatch && statusMatch && dateMatch;
        });
    }, [orders, filters]);

    // Pagination Logic
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        const end = start + pagination.limit;
        return filteredOrders.slice(start, end);
    }, [filteredOrders, pagination.page, pagination.limit]);

    // Update Pagination Stats
    useEffect(() => {
        const total = filteredOrders.length;
        const totalPages = Math.ceil(total / pagination.limit);
        setPagination(prev => ({
            ...prev,
            total,
            totalPages
        }));
    }, [filteredOrders.length, pagination.limit]);

    // Handlers
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleAction = (action, order) => {
        if (action === 'view') {
            setSelectedRider(order);
        } else if (action === 'terminate') {
            if (window.confirm(`Are you sure you want to report rider ${order.riderName}?`)) {
                showToast(`Report filed for rider ${order.riderName}.`, 'error');
            }
        }
    };

    const handleSelectRow = (id, checked) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedRows(paginatedData.map(o => o.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleExport = (message, type = 'info') => {
        showToast(message, type);
    };

    const stats = {
        total: orders.length,
        delivered: orders.filter(o => o.status === 'Delivered').length,
        onTheWay: orders.filter(o => o.status === 'On the Way').length,
        pending: orders.filter(o => o.status === 'Pending').length
    };

    return (
        <div className="orders-module management-module">
            {/* Header */}
            <div className="orders-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Order Management
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track deliveries, manage riders, and monitor real-time order status
                    </p>
                </div>
            </div>

            {/* Stats */}
            <OrderStats stats={stats} />

            {/* Unified Table Section */}
            <div className="orders-table-section">
                <div className="orders-data-wrapper">
                    <OrderFilters
                        filters={filters}
                        setFilters={setFilters}
                        selectedCount={selectedRows.length}
                        onExport={handleExport}
                        onClear={() => setFilters({
                            search: '', brand: '', vendor: '', category: '', subCategory: '', status: '', fromDate: '', toDate: ''
                        })}
                    />

                    {loading ? (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
                            <div className="loading-spinner"></div>
                            <p style={{ marginTop: '16px' }}>Fetching latest orders...</p>
                        </div>
                    ) : (
                        <OrderList
                            orders={paginatedData}
                            selectedRows={selectedRows}
                            onAction={handleAction}
                            onSelectRow={handleSelectRow}
                            onSelectAll={handleSelectAll}
                        />
                    )}
                </div>

                {/* Unified Pagination */}
                <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
                    <span className="c-pagination-info">
                        Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} – {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
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
                            disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        >
                            Next <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Rider Dashboard Modal */}
            {selectedRider && (
                <div className="rider-modal-overlay">
                    <div className="rider-modal-content" style={{ maxWidth: '900px', width: '95%' }}>
                        <button className="icon-btn close-modal" style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={() => setSelectedRider(null)}>
                            <X size={24} />
                        </button>

                        <div className="rider-dash-header">
                            <div className="rider-profile-info">
                                <div className="rider-avatar-main" style={{ background: 'var(--primary-color)' }}>
                                    {selectedRider.customerName.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Customer: {selectedRider.customerName}</h2>
                                    <p style={{ color: '#64748b', margin: '4px 0', fontSize: '0.9rem' }}>{selectedRider.customerId} | {selectedRider.customerEmail}</p>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-color)' }}>Contact: {selectedRider.customerPhone}</span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ margin: 0, fontWeight: 600, color: '#64748b', fontSize: '0.85rem' }}>Order Status</p>
                                <span className={`status-badge ${selectedRider.status.toLowerCase().replace(/\s+/g, '-')}`} style={{ marginTop: '8px', fontSize: '0.9rem', padding: '6px 16px', borderRadius: '10px' }}>
                                    {selectedRider.status}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                            {/* Left Column: Customer Order Items */}
                            <div className="order-items-section">
                                <h3 className="modal-section-title">
                                    <Clock size={20} color="var(--primary-color)" /> Order Products
                                </h3>
                                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                                    <table className="order-items-table">
                                        <thead>
                                            <tr>
                                                <th>PRODUCT NAME</th>
                                                <th style={{ textAlign: 'center' }}>QTY</th>
                                                <th style={{ textAlign: 'right' }}>PRICE</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedRider.orderItems.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                                    <td style={{ textAlign: 'center' }}>{item.qty}</td>
                                                    <td style={{ textAlign: 'right', color: 'var(--primary-color)', fontWeight: 700 }}>{item.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '2px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                        <span style={{ color: '#64748b' }}>Total Amount Paid</span>
                                        <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>$50.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Rider Details */}
                            <div className="rider-details-section">
                                <h3 className="modal-section-title">
                                    <MapPin size={20} color="#f59e0b" /> Assigned Rider Details
                                </h3>
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.4rem' }}>
                                            {selectedRider.riderName.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{selectedRider.riderName}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{selectedRider.riderId}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b' }}>Phone</span>
                                            <span style={{ fontWeight: 600 }}>{selectedRider.riderContact}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b' }}>Email</span>
                                            <span style={{ fontWeight: 600 }}>{selectedRider.riderEmail}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#64748b' }}>Success Rate</span>
                                            <span style={{ fontWeight: 700, color: '#10b981' }}>{selectedRider.riderStats.successRate}</span>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                        <div className="rider-stat-mini" style={{ display: 'flex', justifyContent: 'space-around' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedRider.riderStats.totalOrders}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TRIPS</div>
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{selectedRider.riderStats.activeSince}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>TENURE</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="modal-footer-btn btn-report"
                                    onClick={() => handleAction('terminate', selectedRider)}
                                >
                                    <UserMinus size={18} /> Report / Deactivate Assigned Rider
                                </button>
                            </div>
                        </div>
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
