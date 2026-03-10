import React from 'react';
import { CheckCircle, XCircle, CheckSquare, Square } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';

const ProductList = ({ products, onAction, selectedRows, onSelectRow, onSelectAll }) => {
    const allSelected = products.length > 0 && selectedRows.length === products.length;

    const handleSelectAll = (e) => {
        if (onSelectAll) {
            onSelectAll(e.target.checked);
        }
    };

    const handleSelectRow = (id, checked) => {
        if (onSelectRow) {
            onSelectRow(id, checked);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const getStatusLabel = (product) => {
        if (product.rejectionReason) return 'Rejected';
        return product.isApproved ? 'Approved' : 'Pending';
    };

    const getStatusBadgeClass = (product) => {
        if (product.rejectionReason) return 'rejected';
        return product.isApproved ? 'approved' : 'pending';
    };

    if (!products || products.length === 0) {
        return (
            <div className="p-table-container" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '8px' }}>No Products Found</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    return (
        <div className="p-table-container">
            <table className="dashboard-table" style={{ minWidth: '1350px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '48px' }}>
                            <div
                                onClick={() => handleSelectAll({ target: { checked: !allSelected } })}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {allSelected
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '70px' }}>IMAGE</th>
                        <th>PRODUCT NAME / ID</th>
                        <th>CATEGORY</th>
                        <th>SUB CATEGORY</th>
                        <th>BRAND</th>
                        <th>VENDOR DETAILS</th>
                        <th>VENDOR CONTACT</th>
                        <th>MRP</th>
                        <th style={{ whiteSpace: 'nowrap' }}>REQ. DATE</th>
                        <th style={{ whiteSpace: 'nowrap' }}>ACTION DATE</th>
                        <th style={{ textAlign: 'center' }}>STATUS</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id} className={selectedRows.includes(product.id) ? 'selected-row' : ''}>
                            {/* Checkbox */}
                            <td>
                                <div
                                    onClick={() => handleSelectRow(product.id, !selectedRows.includes(product.id))}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {selectedRows.includes(product.id)
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </td>

                            {/* Image */}
                            <td>
                                <div className="product-img-preview" style={{
                                    backgroundImage: `url(${product.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0'
                                }} />
                            </td>

                            {/* Product Name / ID */}
                            <td>
                                <div style={{
                                    fontWeight: 700,
                                    color: 'var(--text-primary)',
                                    fontSize: '0.92rem',
                                    lineHeight: '1.3'
                                }}>
                                    {product.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                                    {product.itemId}
                                </div>
                            </td>

                            {/* Category - Updated Color */}
                            <td>
                                <span style={{
                                    background: '#fdf2f8', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#db2777', fontWeight: 700, border: '1px solid #fce7f3'
                                }}>
                                    {product.category}
                                </span>
                            </td>

                            {/* Sub Cat */}
                            <td>
                                <span style={{
                                    background: '#f0f9ff', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, border: '1px solid #e0f2fe'
                                }}>
                                    {product.subCategory || 'N/A'}
                                </span>
                            </td>

                            {/* Brand */}
                            <td>
                                <div style={{ fontWeight: 600, color: '#4b5563', fontSize: '0.88rem' }}>{product.brand}</div>
                            </td>

                            {/* Vendor Details */}
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem' }}>{product.vendorCompanyName}</span>
                                    <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{product.vendorName}</span>
                                </div>
                            </td>

                            {/* Vendor Contact */}
                            <td>
                                <div style={{ fontSize: '0.78rem' }}>
                                    <div style={{ fontWeight: 700, color: '#111827' }}>{product.vendorPhone}</div>
                                    <div style={{ color: '#9ca3af' }}>{product.vendorEmail}</div>
                                </div>
                            </td>

                            {/* MRP */}
                            <td style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.96rem' }}>
                                {formatCurrency(product.MRP)}
                            </td>

                            {/* REQ. DATE */}
                            <td>
                                <span style={{
                                    padding: '5px 10px', background: '#fff7ed', color: '#c2410c',
                                    borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #ffedd5'
                                }}>
                                    {product.raisedDate || '2024-03-01'}
                                </span>
                            </td>

                            {/* ACTION DATE */}
                            <td>
                                {product.actionDate ? (
                                    <span style={{
                                        padding: '5px 10px',
                                        background: product.rejectionReason ? '#fef2f2' : '#f0fdf4',
                                        color: product.rejectionReason ? '#ef4444' : '#15803d',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: `1px solid ${product.rejectionReason ? '#fee2e2' : '#dcfce7'}`
                                    }}>
                                        {product.actionDate}
                                    </span>
                                ) : (
                                    <span style={{ color: '#d1d5db', fontSize: '0.8rem' }}>—</span>
                                )}
                            </td>

                            {/* STATUS */}
                            <td style={{ textAlign: 'center' }}>
                                {product.isApproved || product.rejectionReason ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                        <span className={`status-badge ${getStatusBadgeClass(product)}`}>
                                            {getStatusLabel(product)}
                                        </span>
                                        {product.rejectionReason && (
                                            <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600, maxWidth: '140px' }}>
                                                {product.rejectionReason}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <ActionButton
                                            icon={CheckCircle}
                                            onClick={() => onAction('approve', product)}
                                            variant="perm"
                                            tooltip="Approve"
                                            size={16}
                                        />
                                        <ActionButton
                                            icon={XCircle}
                                            onClick={() => onAction('reject', product)}
                                            variant="delete"
                                            tooltip="Reject"
                                            size={16}
                                        />
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;
