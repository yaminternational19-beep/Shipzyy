
import React from 'react';
import { Eye, UserCheck, AlertCircle } from 'lucide-react';

const VendorOrderList = ({ orders, selectedRows, onSelectRow, onSelectAll, onView, onAssignRider }) => {

    const allSelected = orders.length > 0 && selectedRows.length === orders.length;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const getStatusBadge = (status) => {
        const s = status.toLowerCase();
        return <span className={`status-badge ${s}`}>{status}</span>;
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

    if (!orders || orders.length === 0) {
        return (
            <div className="o-table-container" style={{ padding: '60px', textAlign: 'center' }}>
                <AlertCircle size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b', fontWeight: 500 }}>No orders found matching your criteria.</p>
            </div>
        );
    }

    return (
        <div className="o-table-container">
            <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1400px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '16px 12px', textAlign: 'left', width: '40px' }}>
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>IMAGE</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ORDER ID</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PRODUCT</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CUSTOMER</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CONTACT</th>
                        <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>QTY</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PAYMENT</th>
                        <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>STATUS</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>RIDER</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ADDRESS</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PLACED</th>
                        <th style={{ padding: '16px 12px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>DELIVERED</th>
                        <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} className="table-row-hover">
                            <td style={{ padding: '16px 12px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(order.id)}
                                    onChange={(e) => onSelectRow(order.id, e.target.checked)}
                                />
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                                <img
                                    src={order.productImage || order.items[0]?.image}
                                    alt="Product"
                                    style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', background: '#f1f5f9' }}
                                />
                            </td>
                            <td style={{ padding: '16px 12px', fontWeight: 700, color: '#1e293b' }}>#{order.id}</td>
                            <td style={{ padding: '16px 12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a' }}>
                                        {order.items[0]?.name}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {order.items[0]?.productId || 'SKU-N/A'}
                                        {order.items.length > 1 && (
                                            <span style={{ marginLeft: '4px' }}>(+{order.items.length - 1} more)</span>
                                        )}
                                    </span>
                                </div>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>{order.customerName}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerId || 'ID: N/A'}</span>
                                </div>
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>{order.customerPhone}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customerEmail || 'No Email'}</span>
                                </div>
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center', fontWeight: 600 }}>{order.productsCount}</td>
                            <td style={{ padding: '16px 12px', fontWeight: 700, color: '#4f46e5' }}>{formatCurrency(order.totalAmount)}</td>
                            <td style={{ padding: '16px 12px' }}>
                                {getPaymentStatusBadge(order.paymentStatus)}
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                {getStatusBadge(order.status)}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                                {order.assignedRider ? (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                            {order.assignedRider.charAt(0)}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{order.assignedRider}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                                )}
                            </td>
                            <td style={{ padding: '16px 12px' }}>
                                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={order.deliveryAddress}>
                                    {order.deliveryAddress}
                                </span>
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#64748b' }}>
                                {order.createdDate}
                            </td>
                            <td style={{ padding: '16px 12px', fontSize: '0.8rem', color: '#64748b' }}>
                                {order.deliveredDate || '-'}
                            </td>
                            <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                    <button
                                        onClick={() => onView(order)}
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    {!order.assignedRider && order.status !== 'Delivered' ? (
                                        <button
                                            onClick={() => onAssignRider(order)}
                                            style={{
                                                padding: '6px 8px',
                                                borderRadius: '8px',
                                                border: '1px solid #f59e0b',
                                                background: '#fffbeb',
                                                color: '#b45309',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                whiteSpace: 'nowrap'
                                            }}
                                            className="assign-btn-hover"
                                        >
                                            <UserCheck size={14} />
                                            Assign
                                        </button>
                                    ) : null}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                .table-row-hover:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
};

export default VendorOrderList;
