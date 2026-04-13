import React from 'react';
import { X, ShoppingBag, User, MapPin, CreditCard, Package, ClipboardList } from 'lucide-react';
import '../../vendor_products/product.css';

const OrderView = ({ order, onClose }) => {
    if (!order) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

    const getStatusColor = (status) => {
        const map = {
            Pending: { bg: '#fffbeb', color: '#b45309' },
            Confirmed: { bg: '#ecfdf5', color: '#059669' },
            Processing: { bg: '#e0f2fe', color: '#0284c7' },
            'Out for Delivery': { bg: '#fdf2f7', color: '#db2777' },
            Delivered: { bg: '#ecfdf5', color: '#10b981' },
            Cancelled: { bg: '#fef2f2', color: '#ef4444' },
        };
        return map[status] || { bg: '#f1f5f9', color: '#64748b' };
    };

    const { bg, color } = getStatusColor(order.status);

    return (
        <div className="product-view-overlay" onClick={onClose}>
            <div className="product-view-modal" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="view-modal-header">
                    <div className="header-left">
                        <div className="header-icon-box">
                            <ShoppingBag size={22} />
                        </div>
                        <div>
                            <h2>Order Details</h2>
                            <p className="item-id-tag">#{order.orderNumber}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            padding: '6px 16px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            background: bg,
                            color: color,
                            border: `1px solid ${color}30`
                        }}>
                            {order.status}
                        </span>
                        <button className="view-close-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="view-modal-body">

                    {/* Product Image Strip */}
                    {order.items && order.items.length > 0 && (
                        <div className="view-media-strip">
                            <div className="strip-header">
                                <Package size={16} />
                                <span>Order Items ({order.items.length})</span>
                            </div>
                            <div className="image-scroll-container">
                                {order.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                                        <div className="view-image-card" style={{ minWidth: '110px', height: '110px' }}>
                                            <img
                                                src={item.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${item.name}`}
                                                alt={item.name}
                                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.name}`; }}
                                            />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700 }}>
                                                Qty: {item.qty} × {formatCurrency(item.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="view-details-stack">

                        {/* Order Summary */}
                        <div className="view-detail-section">
                            <div className="section-title-box">
                                <ClipboardList size={20} />
                                <span>Order Summary</span>
                            </div>
                            <div className="section-content-grid">
                                <div className="view-info-item">
                                    <label>Order Number</label>
                                    <span className="info-value" style={{ color: '#4f46e5' }}>#{order.orderNumber}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Order Status</label>
                                    <span className="info-value">
                                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: bg, color: color }}>
                                            {order.status}
                                        </span>
                                    </span>
                                </div>
                                <div className="view-info-item">
                                    <label>Total Amount</label>
                                    <span className="info-value" style={{ color: '#059669', fontSize: '1.1rem' }}>{formatCurrency(order.totalAmount)}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Item Count</label>
                                    <span className="info-value">{order.productsCount} item(s)</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Placed Date</label>
                                    <span className="info-value">{order.createdDate || '—'}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Delivered Date</label>
                                    <span className="info-value">{order.deliveredDate || '—'}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Assigned Rider</label>
                                    <span className="info-value">{order.assignedRider || 'Unassigned'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="view-detail-section">
                            <div className="section-title-box">
                                <User size={20} />
                                <span>Customer Details</span>
                            </div>
                            <div className="section-content-grid">
                                <div className="view-info-item">
                                    <label>Customer Name</label>
                                    <span className="info-value">{order.customerName || '—'}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Customer ID</label>
                                    <span className="info-value" style={{ color: '#6366f1' }}>{order.customerId || '—'}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Mobile Number</label>
                                    <span className="info-value">{order.customerPhone || '—'}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Email Address</label>
                                    <span className="info-value">{order.customerEmail || '—'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="view-detail-section">
                            <div className="section-title-box">
                                <CreditCard size={20} />
                                <span>Payment Details</span>
                            </div>
                            <div className="section-content-grid">
                                <div className="view-info-item">
                                    <label>Payment Method</label>
                                    <span className="info-value">{order.paymentMethod || '—'}</span>
                                </div>
                                <div className="view-info-item">
                                    <label>Payment Status</label>
                                    <span className="info-value">
                                        <span style={{
                                            padding: '3px 10px',
                                            borderRadius: '999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: order.paymentStatus === 'Paid' ? '#ecfdf5' : '#fffbeb',
                                            color: order.paymentStatus === 'Paid' ? '#059669' : '#b45309'
                                        }}>
                                            {order.paymentStatus || 'Pending'}
                                        </span>
                                    </span>
                                </div>
                                <div className="view-info-item">
                                    <label>Total Amount</label>
                                    <span className="info-value">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="view-detail-section">
                            <div className="section-title-box">
                                <MapPin size={20} />
                                <span>Delivery Address</span>
                            </div>
                            <div className="section-content-grid" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="view-info-item">
                                    <label>Full Address</label>
                                    <span className="info-value">{order.deliveryAddress || '—'}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderView;
