import React from 'react';
import { CheckCircle, XCircle, CheckSquare, Square, Eye } from 'lucide-react';
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
                        <th style={{ width: '48px', textAlign: 'center' }}>
                            <div
                                onClick={() => handleSelectAll({ target: { checked: !allSelected } })}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {allSelected
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '70px', textAlign: 'center' }}>IMAGE</th>
                        <th style={{ textAlign: 'center' }}>PRODUCT NAME / ID</th>
                        <th style={{ textAlign: 'center' }}>CATEGORY</th>
                        <th style={{ textAlign: 'center' }}>SUB CAT.</th>
                        <th style={{ textAlign: 'center' }}>BRAND</th>
                        <th style={{ textAlign: 'center' }}>VENDOR DETAILS</th>
                        <th style={{ textAlign: 'center' }}>VENDOR CONTACT</th>
                        <th style={{ textAlign: 'center' }}>PRICING</th>
                        <th style={{ textAlign: 'center' }}>STOCK</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>REQUEST DATE</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>APPROVAL DATE</th>
                        <th style={{ textAlign: 'center' }}>APPROVAL</th>
                        <th style={{ width: '80px', textAlign: 'center' }}>ACTIONS</th>
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
                            <td style={{ textAlign: 'center' }}>
                                <div className="product-img-preview" style={{
                                    backgroundImage: `url(${product.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    margin: '0 auto'
                                }} />
                            </td>

                            {/* Product Name / ID */}
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{
                                        fontWeight: 700,
                                        color: 'var(--text-primary)',
                                        fontSize: '0.92rem',
                                        lineHeight: '1.3',
                                        maxWidth: '220px',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        textAlign: 'center'
                                    }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                                        #{product.itemId}
                                    </div>
                                </div>
                            </td>

                            {/* Category */}
                            <td style={{ textAlign: 'center' }}>
                                <span style={{
                                    background: '#fdf2f8', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#db2777', fontWeight: 700, border: '1px solid #fce7f3',
                                    display: 'inline-block', maxWidth: '100px', wordWrap: 'break-word', whiteSpace: 'normal'
                                }}>
                                    {product.category}
                                </span>
                            </td>

                            {/* Sub Cat */}
                            <td style={{ textAlign: 'center' }}>
                                <span style={{
                                    background: '#f0f9ff', padding: '5px 12px', borderRadius: '8px',
                                    fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, border: '1px solid #e0f2fe',
                                    display: 'inline-block', maxWidth: '100px', wordWrap: 'break-word', whiteSpace: 'normal'
                                }}>
                                    {product.subCategory || 'N/A'}
                                </span>
                            </td>

                            {/* Brand */}
                            <td style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontWeight: 600, color: '#4b5563', fontSize: '0.88rem',
                                    maxWidth: '120px', wordWrap: 'break-word', whiteSpace: 'normal', margin: '0 auto'
                                }}>{product.brand}</div>
                            </td>

                            {/* Vendor Details */}
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '180px', margin: '0 auto' }}>
                                    <span style={{
                                        fontWeight: 700,
                                        color: '#374151',
                                        fontSize: '0.88rem',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        textAlign: 'center'
                                    }}>{product.vendorCompanyName}</span>
                                    <span style={{
                                        fontSize: '0.78rem',
                                        color: '#6b7280',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                        textAlign: 'center'
                                    }}>{product.vendorName}</span>
                                </div>
                            </td>

                            {/* Vendor Contact */}
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontWeight: 700, color: '#111827' }}>{product.vendorPhone}</div>
                                    <div style={{ color: '#9ca3af', wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '150px' }}>{product.vendorEmail}</div>
                                </div>
                            </td>

                            {/* PRICING */}
                            <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                    <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.98rem' }}>
                                        {formatCurrency(product.Sale)}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        fontWeight: 600,
                                        textDecoration: 'line-through'
                                    }}>
                                        {formatCurrency(product.MRP)}
                                    </span>
                                </div>
                            </td>

                            <td style={{ textAlign: 'center' }}>
                                <span style={{
                                    padding: '5px 12px',
                                    background: product.stockQuantity > 5 ? '#f0fdf4' : '#fff7ed',
                                    color: product.stockQuantity > 5 ? '#15803d' : '#c2410c',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: `1px solid ${product.stockQuantity > 5 ? '#dcfce7' : '#ffedd5'}`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}>
                                    {product.stockQuantity} {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </td>

                            {/* REQ. DATE */}
                            <td style={{ textAlign: 'center' }}>
                                <span style={{
                                    padding: '5px 10px', background: '#fff7ed', color: '#c2410c',
                                    borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #ffedd5',
                                    display: 'inline-block'
                                }}>
                                    {product.raisedDate || '2024-03-01'}
                                </span>
                            </td>

                            {/* APPROVAL DATE */}
                            <td style={{ textAlign: 'center' }}>
                                {product.actionDate ? (
                                    <span style={{
                                        padding: '5px 10px',
                                        background: product.rejectionReason ? '#fef2f2' : '#f0fdf4',
                                        color: product.rejectionReason ? '#ef4444' : '#15803d',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: `1px solid ${product.rejectionReason ? '#fee2e2' : '#dcfce7'}`,
                                        display: 'inline-block'
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
                                            variant="secondary"
                                            size={16}
                                            tooltip="Approve"
                                        />
                                        <ActionButton 
                                            icon={XCircle}
                                            onClick={() => onAction('reject', product)}
                                            variant="secondary"
                                            size={16}
                                            tooltip="Reject"
                                        />
                                    </div>
                                )}
                            </td>

                            <td style={{ width: '80px', textAlign: 'center' }}>
                                <ActionButton
                                    icon={Eye}
                                    onClick={() => onAction('view', product)}
                                    variant="secondary"
                                    size={16}
                                    tooltip="View Details"
                                />
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductList;
