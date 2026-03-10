import React from 'react';
import { Eye, UserMinus, CheckSquare, Square } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';

const OrderList = ({ orders, onAction, selectedRows, onSelectRow, onSelectAll }) => {
    const allSelected = orders.length > 0 && selectedRows.length === orders.length;

    const handleSelectAll = (checked) => {
        if (onSelectAll) {
            onSelectAll(checked);
        }
    };

    const handleSelectRow = (id, checked) => {
        if (onSelectRow) {
            onSelectRow(id, checked);
        }
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="o-table-container" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '8px' }}>No Orders Found</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    return (
        <div className="o-table-container">
            <table className="dashboard-table" style={{ minWidth: '1400px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '48px' }}>
                            <div
                                onClick={() => handleSelectAll(!allSelected)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {allSelected
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '70px' }}>IMAGE</th>
                        <th>CUSTOMER NAME / ID</th>
                        <th>PRODUCT NAME / ID</th>
                        <th>CATEGORY</th>
                        <th>SUB CAT.</th>
                        <th>BRAND</th>
                        <th>VENDOR DETAILS</th>
                        <th>VENDOR CONTACT</th>
                        <th>RIDER DETAILS</th>
                        <th style={{ textAlign: 'center' }}>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className={selectedRows.includes(order.id) ? 'selected-row' : ''}>
                            {/* Checkbox */}
                            <td>
                                <div
                                    onClick={() => handleSelectRow(order.id, !selectedRows.includes(order.id))}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {selectedRows.includes(order.id)
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </td>

                            {/* Image */}
                            <td>
                                <div className="product-img-preview" style={{
                                    backgroundImage: `url(${order.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0'
                                }} />
                            </td>

                            {/* Customer Name / ID */}
                            <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.3' }}>
                                    {order.customerName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                                    {order.customerId}
                                </div>
                            </td>

                            {/* Product Name / ID */}
                            <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.3' }}>
                                    {order.itemName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                                    {order.itemId}
                                </div>
                            </td>

                            {/* Category */}
                            <td>
                                <span style={{
                                    background: '#fdf2f8', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#db2777', fontWeight: 700, border: '1px solid #fce7f3'
                                }}>
                                    {order.category}
                                </span>
                            </td>

                            {/* Sub Cat */}
                            <td>
                                <span style={{
                                    background: '#f0f9ff', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, border: '1px solid #e0f2fe'
                                }}>
                                    {order.subCategory || 'N/A'}
                                </span>
                            </td>

                            {/* Brand */}
                            <td>
                                <div style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.88rem' }}>{order.brand}</div>
                            </td>

                            {/* Vendor Details */}
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem' }}>{order.vendorCompanyName}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{order.vendorName}</span>
                                </div>
                            </td>

                            {/* Vendor Contact */}
                            <td>
                                <div style={{ fontSize: '0.78rem' }}>
                                    <div style={{ fontWeight: 700, color: '#111827' }}>{order.vendorPhone}</div>
                                    <div style={{ color: '#9ca3af' }}>{order.vendorEmail}</div>
                                </div>
                            </td>

                            {/* Rider Details */}
                            <td>
                                <div style={{ fontSize: '0.85rem' }}>
                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.riderName}</div>
                                    <div style={{ color: '#64748b' }}>{order.riderContact}</div>
                                </div>
                            </td>

                            {/* Status */}
                            <td style={{ textAlign: 'center' }}>
                                <span className={`status-badge ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {order.status}
                                </span>
                            </td>

                            {/* Actions */}
                            <td style={{ textAlign: 'right' }}>
                                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                    <ActionButton
                                        icon={Eye}
                                        onClick={() => onAction('view', order)}
                                        variant="secondary"
                                        tooltip="View Order Details"
                                        size={18}
                                    />
                                    <ActionButton
                                        icon={UserMinus}
                                        onClick={() => onAction('terminate', order)}
                                        variant="delete"
                                        tooltip="Report Rider"
                                        size={18}
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderList;
