import React from 'react';
import { Eye, Package, CheckSquare, Square } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';

const STATUS_CLASS = (status = '') => status.toLowerCase().replace(/\s+/g, '-');

const OrderList = ({ orders, onAction, selectedRows, onSelectRow, onSelectAll }) => {
    const allSelected = orders.length > 0 && selectedRows.length === orders.length;

    if (!orders || orders.length === 0) {
        return (
            <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '8px' }}>No Orders Found</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    return (
        <div>
            <table className="dashboard-table" style={{ minWidth: '1500px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '48px' }}>
                            <div
                                onClick={() => onSelectAll && onSelectAll(!allSelected)}
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
                        <th style={{ textAlign: 'center' }}>STATUS</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id} className={selectedRows.includes(order.id) ? 'selected-row' : ''}>

                            {/* ── Checkbox ── */}
                            <td>
                                <div
                                    onClick={() => onSelectRow && onSelectRow(order.id, !selectedRows.includes(order.id))}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {selectedRows.includes(order.id)
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </td>

                            {/* ── Product Image ── */}
                            <td>
                                {order.productImage ? (
                                    <div style={{
                                        backgroundImage: `url(${order.productImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        width: '46px',
                                        height: '46px',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0'
                                    }} />
                                ) : (
                                    <div style={{
                                        width: '46px', height: '46px',
                                        borderRadius: '10px',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Package size={18} color="#cbd5e1" />
                                    </div>
                                )}
                            </td>

                            {/* ── Customer Name / ID ── */}
                            <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.3' }}>
                                    {order.customerName}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                                    {order.customerId}
                                </div>
                            </td>

                            {/* ── Product Name / Item ID ── */}
                            <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.3' }}>
                                    {order.itemName}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                                        {order.itemId}
                                    </span>
                                    {order.totalItems > 1 && (
                                        <span style={{
                                            background: '#ede9fe', color: '#7c3aed',
                                            fontSize: '0.7rem', fontWeight: 700,
                                            padding: '1px 7px', borderRadius: '20px',
                                            border: '1px solid #ddd6fe'
                                        }}>
                                            +{order.totalItems - 1} more
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* ── Category ── */}
                            <td>
                                <span style={{
                                    background: '#fdf2f8', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#db2777', fontWeight: 700,
                                    border: '1px solid #fce7f3'
                                }}>
                                    {order.category}
                                </span>
                            </td>

                            {/* ── Sub Category ── */}
                            <td>
                                <span style={{
                                    background: '#f0f9ff', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#0369a1', fontWeight: 700,
                                    border: '1px solid #e0f2fe'
                                }}>
                                    {order.subCategory || 'N/A'}
                                </span>
                            </td>

                            {/* ── Brand ── */}
                            <td>
                                <div style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.88rem' }}>
                                    {order.brand}
                                </div>
                            </td>

                            {/* ── Vendor Details ── */}
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem' }}>
                                        {order.vendorCompanyName}
                                    </span>
                                    <span style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '1px' }}>
                                        {order.vendorName}
                                    </span>
                                    {order.totalVendors > 1 && (
                                        <span style={{
                                            background: '#fef3c7', color: '#b45309',
                                            fontSize: '0.7rem', fontWeight: 700,
                                            padding: '1px 7px', borderRadius: '20px',
                                            border: '1px solid #fde68a',
                                            marginTop: '4px', alignSelf: 'flex-start'
                                        }}>
                                            +{order.totalVendors - 1} vendor{order.totalVendors - 1 > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </td>

                            {/* ── Vendor Contact ── */}
                            <td>
                                <div style={{ fontSize: '0.78rem' }}>
                                    <div style={{ fontWeight: 700, color: '#111827' }}>
                                        {order.vendorPhone}
                                    </div>
                                    <div style={{ color: '#9ca3af', marginTop: '2px' }}>
                                        {order.vendorEmail}
                                    </div>
                                </div>
                            </td>

                            {/* ── Status ── */}
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                                    <span className={`status-badge ${STATUS_CLASS(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <span style={{
                                        fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500
                                    }}>
                                        {order.createdDate}
                                    </span>
                                </div>
                            </td>

                            {/* ── Actions ── */}
                            <td style={{ textAlign: 'right' }}>
                                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                    <ActionButton
                                        icon={Eye}
                                        onClick={() => onAction('view', order)}
                                        variant="secondary"
                                        tooltip="View Order Details"
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
