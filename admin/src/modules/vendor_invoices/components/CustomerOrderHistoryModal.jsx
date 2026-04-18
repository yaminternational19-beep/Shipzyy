import React, { useState } from 'react';
import { X, ShoppingBag, Package, Receipt, Eye, Download, X as CloseIcon } from 'lucide-react';
import './CustomerOrderHistoryModal.css';

const CustomerOrderHistoryModal = ({ customerId, customerName, customerPhone, customerAvatar, allInvoices, onClose }) => {
    const [viewInvoice, setViewInvoice] = useState(null);

    // Filter all invoices for this specific customer
    const customerInvoices = allInvoices.filter(i => i.customerId === customerId);

    const handleDownload = (inv) => {
        const content = `
            PAYSLIP / INVOICE
            -----------------
            Invoice ID  : ${inv.id}
            Order ID    : ${inv.orderId}
            Customer    : ${customerName} (${customerId})
            Phone       : ${customerPhone}
            Amount      : ₹${inv.amount?.toFixed(2)}
            Products    : ${inv.itemCount}
            Method      : ${inv.paymentMethod}
            Date        : ${inv.date}
            Status      : ${inv.status}
        `;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Payslip-${inv.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const stats = {
        totalOrders: [...new Set(customerInvoices.map(i => i.orderId))].length,
        totalInvoices: customerInvoices.length,
        totalProducts: customerInvoices.reduce((sum, i) => sum + (i.itemCount || 0), 0),
        totalSpent: customerInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.amount || 0), 0),
        paid: customerInvoices.filter(i => i.status === 'Paid').length,
        pending: customerInvoices.filter(i => i.status === 'Pending').length,
    };

    return (
        <>
        <div className="modal-overlay">
            <div className="customer-view-modal" style={{ width: '85%', maxWidth: '1100px', height: '88vh', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-profile">
                        <div className="modal-header-avatar">
                            <img src={customerAvatar} alt={customerName} />
                        </div>
                        <div className="modal-header-info">
                            <h2>{customerName}</h2>
                            <div className="modal-header-details">
                                <span className="inv-badge-purple">{customerId}</span>
                                <span className="inv-val-phone">{customerPhone}</span>
                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>· Orders from this vendor</span>
                            </div>
                        </div>
                    </div>
                    <button className="icon-btn-sm" onClick={onClose} style={{ width: '40px', height: '40px' }}><X size={22} /></button>
                </div>

                {/* Stats */}
                <div className="modal-stats-bar">
                    {[
                        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: '#4f46e5', bg: '#eef2ff' },
                        { label: 'Total Invoices', value: stats.totalInvoices, icon: Receipt, color: '#e11d48', bg: '#fff1f2' },
                        { label: 'Products Bought', value: stats.totalProducts, icon: Package, color: '#0d9488', bg: '#f0fdfa' },
                        { label: 'Amount Paid (₹)', value: `₹${stats.totalSpent.toLocaleString()}`, icon: Receipt, color: '#16a34a', bg: '#f0fdf4' },
                    ].map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="modal-stat-card">
                                <div className="modal-stat-icon-wrap" style={{ background: stat.bg }}>
                                    <Icon size={20} color={stat.color} />
                                </div>
                                <div>
                                    <p className="inv-stat-label">{stat.label}</p>
                                    <h3 className="inv-stat-value" style={{ fontSize: '1.2rem' }}>{stat.value}</h3>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Invoice List */}
                <div className="modal-content-area">
                    <h3 className="modal-title-small">All Invoices from This Customer</h3>
                    <div className="inv-list-wrapper">
                        <table className="inv-table" style={{ minWidth: '100%' }}>
                            <thead className="inv-thead">
                                <tr>
                                    <th className="inv-th">ORDER ID</th>
                                    <th className="inv-th">INVOICE ID</th>
                                    <th className="inv-th">PRODUCTS</th>
                                    <th className="inv-th">AMOUNT</th>
                                    <th className="inv-th">DATE</th>
                                    <th className="inv-th-center">STATUS</th>
                                    <th className="inv-th-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="inv-tbody">
                                {customerInvoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="inv-empty-cell" style={{ padding: '40px' }}>No invoices found for this customer.</td>
                                    </tr>
                                ) : customerInvoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td className="inv-td">
                                            <span className="inv-val-order">{inv.orderId}</span>
                                        </td>
                                        <td className="inv-td">
                                            <span className="inv-val-invoice">{inv.id}</span>
                                        </td>
                                        <td className="inv-td">
                                            <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>
                                                {inv.itemCount} Product{inv.itemCount > 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="inv-td">
                                            <span className="inv-val-amount" style={{ fontSize: '0.92rem' }}>₹{inv.amount?.toFixed(2)}</span>
                                        </td>
                                        <td className="inv-td">{inv.date}</td>
                                        <td className="inv-td-center">
                                            <span className={`inv-status-badge ${inv.status.toLowerCase()}`}>
                                                {inv.status === 'Pending' ? 'Payout Pending' : inv.status}
                                            </span>
                                        </td>
                                        <td className="inv-td-right">
                                            <div className="inv-actions">
                                                <button
                                                    onClick={() => setViewInvoice(inv)}
                                                    title="View Payslip"
                                                    className="inv-btn inv-btn-view"
                                                >
                                                    <Eye size={14} /> View
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(inv)}
                                                    title="Download Payslip PDF"
                                                    className="inv-btn inv-btn-download"
                                                >
                                                    <Download size={14} /> Download
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* Payslip Preview Overlay */}
        {viewInvoice && (
            <div className="payslip-overlay">
                <div className="payslip-card">
                    {/* Payslip Header */}
                    <div className="payslip-header">
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8, fontWeight: 600, letterSpacing: '1px' }}>PAYSLIP / INVOICE</p>
                            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.4rem', fontWeight: 800 }}>{viewInvoice.id}</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Order: {viewInvoice.orderId}</p>
                        </div>
                        <button onClick={() => setViewInvoice(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', color: 'white', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Payslip Body */}
                    <div className="payslip-body">
                        {/* Customer Info */}
                        <div className="payslip-cust-info">
                            <img src={customerAvatar} alt={customerName} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e2e8f0' }} />
                            <div>
                                <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{customerName}</p>
                                <p className="inv-val-phone" style={{ fontSize: '0.82rem' }}>{customerPhone}</p>
                                <span className="inv-badge-purple" style={{ fontSize: '0.72rem' }}>{customerId}</span>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        {[
                            { label: 'Invoice ID', value: viewInvoice.id, color: '#e11d48' },
                            { label: 'Order ID', value: viewInvoice.orderId, color: '#0d9488' },
                            { label: 'Products', value: `${viewInvoice.itemCount} Product${viewInvoice.itemCount > 1 ? 's' : ''}` },
                            { label: 'Payment Method', value: viewInvoice.paymentMethod },
                            { label: 'Invoice Date', value: viewInvoice.date },
                        ].map((row, idx) => (
                            <div key={idx} className="payslip-row">
                                <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{row.label}</span>
                                <span style={{ color: row.color || '#1e293b', fontWeight: 700, fontSize: '0.88rem' }}>{row.value}</span>
                            </div>
                        ))}

                        {/* Amount + Status */}
                        <div className="payslip-footer-box" style={{ background: viewInvoice.status === 'Paid' ? '#f0fdf4' : '#fefce8', border: `1px solid ${viewInvoice.status === 'Paid' ? '#bbf7d0' : '#fef08a'}` }}>
                            <div>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem', fontWeight: 600 }}>TOTAL AMOUNT</p>
                                <h2 className="inv-val-amount" style={{ fontSize: '1.6rem' }}>₹{viewInvoice.amount?.toFixed(2)}</h2>
                            </div>
                            <span className={`inv-status-badge ${viewInvoice.status.toLowerCase()}`}>
                                {viewInvoice.status === 'Pending' ? '⏳ Payout Pending' : '✓ Paid'}
                            </span>
                        </div>

                        {/* Download Button */}
                        <button
                            onClick={() => handleDownload(viewInvoice)}
                            className="payslip-download-btn"
                        >
                            <Download size={16} /> Download Payslip
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
    );
};

export default CustomerOrderHistoryModal;
