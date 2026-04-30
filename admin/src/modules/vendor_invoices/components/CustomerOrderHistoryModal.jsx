import React, { useState, useEffect } from 'react';
import { X, Receipt, Package, Eye, Download, ChevronLeft, ChevronRight, Loader2, Square, CheckSquare } from 'lucide-react';
import { getVendorInvoicesApi } from '../../../api/vendor_invoices.api';
import ExportActions from '../../../components/common/ExportActions';
import { exportInvoicesToPDF, exportInvoicesToExcel } from '../services/export.service';
import { getSafeImage } from '../../../utils/imageUtils';
import './CustomerOrderHistoryModal.css';

const CustomerOrderHistoryModal = ({ customerId, customerName, customerPhone, customerAvatar, onDownload, onClose, showToast }) => {
    const [viewInvoice, setViewInvoice] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 7, totalRecords: 0, totalAmount: 0, totalItems: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isGlobalSelected, setIsGlobalSelected] = useState(false);
    const [stats, setStats] = useState({ totalInvoices: 0, totalItems: 0, totalAmount: 0 });

    const fetchCustomerHistory = async () => {
        setLoading(true);
        try {
            const params = {
                customerId: customerId,
                page: pagination.currentPage,
                limit: pagination.itemsPerPage
            };
            const response = await getVendorInvoicesApi(params);
            if (response.data.success) {
                const records = response.data.data.records.map(r => ({
                    id: r.invoice_id,
                    dbId: r.dbId,
                    orderId: r.orderId,
                    amount: r.amount,
                    date: r.date,
                    status: r.status,
                    itemCount: r.itemCount,
                    paymentMethod: r.paymentMethod,
                    invoiceUrl: r.invoiceUrl
                }));
                setInvoices(records);
                const apiPagination = response.data.data.pagination;
                const apiStats = response.data.data.stats;
                setPagination(prev => ({ 
                    ...prev, 
                    totalRecords: apiPagination.totalRecords
                }));
                setStats({
                    totalInvoices: apiStats.total,
                    totalItems: apiStats.totalItems,
                    totalAmount: apiStats.lifetimeEarnings
                });
                setSelectedIds([]); 
                setIsGlobalSelected(false);
            }
        } catch (error) {
            console.error("Error fetching customer history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerHistory();
    }, [pagination.currentPage]);

    const totalPages = Math.ceil(pagination.totalRecords / pagination.itemsPerPage) || 1;

    const handleDownload = async (inv) => {
        if (onDownload) {
            onDownload(inv);
        }
    };

    const toggleSelectRow = (id) => {
        setIsGlobalSelected(false);
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const handleSelectAll = (checking) => {
        setIsGlobalSelected(checking && pagination.totalRecords > invoices.length);
        setSelectedIds(checking ? invoices.map(i => i.id) : []);
    };

    const handleExport = async (type) => {
        if (!isGlobalSelected && selectedIds.length === 0) {
            showToast('Please select at least one invoice to export', 'warning');
            return;
        }

        let invoicesToExport = [];
        if (isGlobalSelected) {
            setLoading(true);
            try {
                const response = await getVendorInvoicesApi({ 
                    customerId, 
                    limit: pagination.totalRecords 
                });
                if (response.data.success) {
                    invoicesToExport = response.data.data.records.map(r => ({
                        id: r.invoice_id,
                        orderId: r.orderId,
                        amount: r.amount,
                        date: r.date,
                        status: r.status,
                        itemCount: r.itemCount,
                        paymentMethod: r.paymentMethod,
                        customerId,
                        customerName,
                        customerPhone
                    }));
                }
            } catch (error) {
                showToast("Failed to fetch all history for export", "error");
                return;
            } finally {
                setLoading(false);
            }
        } else {
            invoicesToExport = invoices.filter(inv => selectedIds.includes(inv.id)).map(inv => ({
                ...inv,
                customerId,
                customerName,
                customerPhone
            }));
        }

        if (type === 'pdf') {
            exportInvoicesToPDF(invoicesToExport);
        } else {
            exportInvoicesToExcel(invoicesToExport);
        }

        showToast(`Exported ${invoicesToExport.length} invoices to ${type === 'pdf' ? 'PDF' : 'Excel'}`, 'success');
        setSelectedIds([]);
        setIsGlobalSelected(false);
    };


    return (
        <>
        <div className="modal-overlay">
            <div className="customer-view-modal" style={{ width: '85%', maxWidth: '1100px', height: '88vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {loading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                    </div>
                )}
                
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-header-profile">
                        <div className="modal-header-avatar">
                            <img src={getSafeImage(customerAvatar, 'USER')} alt={customerName} />
                        </div>
                        <div className="modal-header-info">
                            <h2>{customerName}</h2>
                            <div className="modal-header-details">
                                <span className="inv-badge-purple">{customerId}</span>
                                <span className="inv-val-phone">{customerPhone}</span>
                                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>· Full History</span>
                            </div>
                        </div>
                    </div>
                    <button className="icon-btn-sm" onClick={onClose} style={{ width: '40px', height: '40px' }}><X size={22} /></button>
                </div>

                {/* Stats */}
                <div className="modal-stats-bar">
                    {[
                        { label: 'Total Invoices', value: stats.totalInvoices, icon: Receipt, color: '#e11d48', bg: '#fff1f2' },
                        { label: 'Total Items (Lifetime)', value: stats.totalItems, icon: Package, color: '#0d9488', bg: '#f0fdfa' },
                        { label: 'Amount Total (Lifetime)', value: `₹${stats.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: Receipt, color: '#16a34a', bg: '#f0fdf4' },
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
                <div className="modal-content-area" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 className="modal-title-small" style={{ margin: 0 }}>All Recorded Invoices for {customerName}</h3>
                        <ExportActions 
                            selectedCount={isGlobalSelected ? pagination.totalRecords : selectedIds.length}
                            onExport={(msg, type) => showToast(msg, type)}
                            onDownload={handleExport}
                        />
                    </div>

                    {selectedIds.length === invoices.length && invoices.length > 0 && (
                        <div style={{ background: isGlobalSelected ? 'var(--primary-light)' : '#f1f5f9', padding: '8px 24px', fontSize: '0.82rem', color: isGlobalSelected ? 'var(--primary-color)' : '#475569', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: 500, marginBottom: '8px', borderRadius: '8px' }}>
                            {isGlobalSelected ? (
                                <>All {pagination.totalRecords} history records are selected. <span style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: '8px' }} onClick={() => { setIsGlobalSelected(false); setSelectedIds([]); }}>Clear selection</span></>
                            ) : (
                                <>All {invoices.length} invoices on this page are selected. <span style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: '8px' }} onClick={() => setIsGlobalSelected(true)}>Select entire customer history ({pagination.totalRecords} records)</span></>
                            )}
                        </div>
                    )}

                    <div className="inv-list-wrapper" style={{ flex: 1 }}>
                        <table className="inv-table" style={{ minWidth: '100%' }}>
                            <thead className="inv-thead">
                                <tr>
                                    <th className="inv-th-check" style={{ width: '50px' }}>
                                        <div onClick={() => handleSelectAll(selectedIds.length !== invoices.length)} className="inv-check-trigger">
                                            {(isGlobalSelected || (selectedIds.length === invoices.length && invoices.length > 0)) ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                        </div>
                                    </th>
                                    <th className="inv-th" style={{ textAlign: 'center' }}>ORDER ID</th>
                                    <th className="inv-th" style={{ textAlign: 'center' }}>INVOICE ID</th>
                                    <th className="inv-th" style={{ textAlign: 'center' }}>PRODUCTS</th>
                                    <th className="inv-th" style={{ textAlign: 'center' }}>AMOUNT</th>
                                    <th className="inv-th" style={{ textAlign: 'center' }}>DATE</th>
                                    <th className="inv-th-center" style={{ textAlign: 'center' }}>STATUS</th>
                                    <th className="inv-th-right" style={{ textAlign: 'center' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="inv-tbody">
                                {invoices.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={8} className="inv-empty-cell" style={{ padding: '40px' }}>No invoices found for this customer.</td>
                                    </tr>
                                ) : invoices.map((inv) => (
                                    <tr key={inv.id} className={selectedIds.includes(inv.id) ? 'selected' : ''}>
                                        <td className="inv-check-cell">
                                            <div onClick={() => toggleSelectRow(inv.id)} className="inv-check-trigger">
                                                {selectedIds.includes(inv.id) ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                            </div>
                                        </td>
                                        <td className="inv-td" style={{ textAlign: 'center' }}>
                                            <span className="inv-val-order">{inv.orderId}</span>
                                        </td>
                                        <td className="inv-td" style={{ textAlign: 'center' }}>
                                            <span className="inv-val-invoice">{inv.id}</span>
                                        </td>
                                        <td className="inv-td" style={{ textAlign: 'center' }}>
                                            <span style={{ background: '#ede9fe', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>
                                                {inv.itemCount} Product{inv.itemCount > 1 ? 's' : ''}
                                            </span>
                                        </td>
                                        <td className="inv-td" style={{ textAlign: 'center' }}>
                                            <span className="inv-val-amount" style={{ fontSize: '0.92rem' }}>₹{inv.amount?.toFixed(2)}</span>
                                        </td>
                                        <td className="inv-td" style={{ textAlign: 'center' }}>{inv.date}</td>
                                        <td className="inv-td-center" style={{ textAlign: 'center' }}>
                                            <span className={`inv-status-badge ${inv.status.toLowerCase()}`}>
                                                {inv.status === 'Pending' ? 'Payout Pending' : inv.status}
                                            </span>
                                        </td>
                                        <td className="inv-td-right">
                                            <div className="inv-actions">
                                                <button
                                                    onClick={() => inv.invoiceUrl ? window.open(inv.invoiceUrl, '_blank') : setViewInvoice(inv)}
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

                    {/* Pagination for Modal */}
                    <div className="inv-pagination" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', background: 'white', marginTop: 'auto' }}>
                        <span className="inv-pagination-info">
                            Showing {Math.min(pagination.itemsPerPage * (pagination.currentPage - 1) + 1, pagination.totalRecords)}–{Math.min(pagination.itemsPerPage * pagination.currentPage, pagination.totalRecords)} of {pagination.totalRecords} records
                        </span>
                        <div className="inv-pagination-btns">
                            <button
                                disabled={pagination.currentPage === 1 || loading}
                                className="inv-page-btn"
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <span className="inv-page-label">
                                {pagination.currentPage} / {totalPages}
                            </span>
                            <button
                                disabled={pagination.currentPage === totalPages || totalPages === 0 || loading}
                                className="inv-page-btn"
                                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
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
                            <img src={getSafeImage(customerAvatar, 'USER')} alt={customerName} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #e2e8f0' }} />
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
