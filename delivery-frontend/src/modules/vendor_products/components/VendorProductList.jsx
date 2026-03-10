import React from 'react';
import { Eye, Edit3, Power, CheckSquare, Square, AlertCircle } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';

const VendorProductList = ({
    products,
    selectedRows,
    onSelectRow,
    onSelectAll,
    onView,
    onEdit,
    onToggleStatus
}) => {

    const allSelected =
        products.length > 0 &&
        selectedRows.length === products.length;

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const getApprovalStatus = (product) => {
        if (product.rejectionReason) return { label: 'Rejected', class: 'rejected' };
        if (product.isApproved) return { label: 'Approved', class: 'approved' };
        return { label: 'Pending', class: 'pending' };
    };

    const getStockStatus = (stock) => {
        const val = Number(stock) || 0;
        if (val === 0) return { label: 'Out of Stock', class: 'stock-out' };
        if (val <= 5) return { label: `${val} Low`, class: 'stock-low' };
        return { label: `${val} In Stock`, class: 'stock-ok' };
    };

    if (!products || products.length === 0) {
        return (
            <div className="p-table-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <div style={{
                    width: '64px', height: '64px', background: '#f1f5f9',
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 16px'
                }}>
                    <AlertCircle size={32} color="#94a3b8" />
                </div>
                <h3 style={{ color: '#475569', margin: '0 0 8px' }}>No Products Found</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>You haven't added any products yet or no results match your filters.</p>
            </div>
        );
    }

    return (
        <div className="p-table-container">
            <table className="dashboard-table" style={{ minWidth: '1400px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '48px' }}>
                            <div
                                onClick={() => onSelectAll(!allSelected)}
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
                        <th>SUB CAT.</th>
                        <th>BRAND</th>
                        <th>PRICING</th>
                        <th>STOCK</th>
                        <th>DATES (MFG/EXP)</th>
                        <th style={{ textAlign: 'center' }}>LIVE STATUS</th>
                        <th style={{ textAlign: 'center' }}>APPROVAL</th>
                        <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                </thead>

                <tbody>
                    {products.map((product) => {
                        const approval = getApprovalStatus(product);
                        const stockStatus = getStockStatus(product.stock);

                        return (
                            <tr key={product.id} className={selectedRows.includes(product.id) ? 'selected-row' : ''}>
                                <td>
                                    <div
                                        onClick={() => onSelectRow(product.id, !selectedRows.includes(product.id))}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {selectedRows.includes(product.id)
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </td>

                                <td>
                                    <div
                                        className="product-img-preview"
                                        style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '10px',
                                            backgroundImage: `url(${product.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    />
                                </td>

                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.3' }}>
                                        {product.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>
                                        #{product.itemId}
                                    </div>
                                </td>

                                <td>
                                    <span style={{
                                        background: '#fdf2f8', padding: '4px 10px', borderRadius: '6px',
                                        fontSize: '0.75rem', color: '#db2777', fontWeight: 700, border: '1px solid #fce7f3'
                                    }}>
                                        {product.category}
                                    </span>
                                </td>

                                <td>
                                    <span style={{
                                        background: '#f0f9ff', padding: '4px 10px', borderRadius: '6px',
                                        fontSize: '0.75rem', color: '#0369a1', fontWeight: 700, border: '1px solid #e0f2fe'
                                    }}>
                                        {product.subCategory || 'N/A'}
                                    </span>
                                </td>

                                <td>
                                    <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>{product.brand || '--'}</div>
                                </td>

                                <td>
                                    <div style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.9rem' }}>
                                        {formatCurrency(product.salePrice)}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                        {formatCurrency(product.MRP)}
                                    </div>
                                </td>

                                <td>
                                    <span className={`stock-status-badge ${stockStatus.class}`}>
                                        {stockStatus.label}
                                    </span>
                                </td>

                                <td>
                                    <div style={{ fontSize: '0.75rem', color: '#444' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>M:</span> {product.manufactureDate || '--'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                            <span style={{ color: '#94a3b8', fontWeight: 600 }}>E:</span> {product.expiryDate || '--'}
                                        </div>
                                    </div>
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                    <div className={`status-pill ${product.isActive ? 'active' : 'inactive'}`}>
                                        <span className="dot"></span>
                                        {product.isActive ? 'Live' : 'Hidden'}
                                    </div>
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                    <span className={`status-badge ${approval.class}`}>
                                        {approval.label}
                                    </span>
                                </td>

                                <td>
                                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                        <ActionButton
                                            icon={Eye}
                                            onClick={() => onView?.(product)}
                                            variant="secondary"
                                            size={16}
                                            tooltip="View Details"
                                        />
                                        <ActionButton
                                            icon={Edit3}
                                            onClick={() => onEdit?.(product)}
                                            variant="secondary"
                                            size={16}
                                            tooltip="Edit Product"
                                        />
                                        <ActionButton
                                            icon={Power}
                                            onClick={() => onToggleStatus?.(product.id)}
                                            variant={product.isActive ? 'perm' : 'secondary'}
                                            size={16}
                                            tooltip={product.isActive ? 'Hide from Shop' : 'Make Live'}
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default VendorProductList;
