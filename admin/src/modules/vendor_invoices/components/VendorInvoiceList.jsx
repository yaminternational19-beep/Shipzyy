import React from 'react';
import { Search, ChevronLeft, ChevronRight, Square, CheckSquare, Download, Eye } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import '../../invoices/components/InvoiceList.css';

const VendorInvoiceList = ({
    invoices, totalCount, filters, setFilters, pagination, setPagination,
    selectedIds, setSelectedIds, onSelectAll, onExport, onView, onViewHistory
}) => {
    const { currentPage, itemsPerPage } = pagination;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

    const toggleSelectRow = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    return (
        <div className="inv-list-wrapper">
            <div className="inv-toolbar">
                <div className="inv-filters">
                    <div className="inv-search-wrap">
                        <Search className="inv-search-icon" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Invoice, Order ID or Customer..."
                            className="inv-search-input"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select
                        className="inv-select"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending / Unpaid</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                    <div className="inv-date-range">
                        <input
                            type="date"
                            className="inv-date-input"
                            value={filters.fromDate || ''}
                            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                        />
                        <span className="inv-date-sep">to</span>
                        <input
                            type="date"
                            className="inv-date-input"
                            value={filters.toDate || ''}
                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                        />
                    </div>
                </div>
                <ExportActions selectedCount={selectedIds.length} onExport={() => {}} onDownload={onExport} />
            </div>

            <div className="inv-table-scroll">
                <table className="inv-table">
                    <thead className="inv-thead">
                        <tr>
                            <th className="inv-th-check">
                                <div onClick={() => onSelectAll(selectedIds.length !== totalCount)} className="inv-check-trigger">
                                    {selectedIds.length === totalCount && totalCount > 0 ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                </div>
                            </th>
                            <th className="inv-th-img">CUSTOMER</th>
                            <th className="inv-th">CUST ID</th>
                            <th className="inv-th">PHONE</th>
                            <th className="inv-th">ORDER ID</th>
                            <th className="inv-th">INVOICE ID</th>
                            <th className="inv-th">ITEMS MAPPED</th>
                            <th className="inv-th">PAYOUT</th>
                            <th className="inv-th">METHOD</th>
                            <th className="inv-th">DATE</th>
                            <th className="inv-th-center">STATUS</th>
                            <th className="inv-th-right">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={12} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '8px' }}>No Invoices Found</div>
                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((invoice) => (
                                <tr key={invoice.id} className={selectedIds.includes(invoice.id) ? 'selected' : ''}>
                                    <td className="inv-check-cell">
                                        <div onClick={() => toggleSelectRow(invoice.id)} className="inv-check-trigger">
                                            {selectedIds.includes(invoice.id) ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                        </div>
                                    </td>

                                    {/* Customer avatar first */}
                                    <td className="inv-td-center">
                                        <div className="inv-avatar">
                                            <img src={invoice.customerAvatar} alt={invoice.customerId} />
                                        </div>
                                    </td>

                                    <td className="inv-td">
                                        <span className="inv-badge-purple">
                                            {invoice.customerId}
                                        </span>
                                    </td>

                                    <td className="inv-td">
                                        <span className="inv-val-phone">{invoice.customerPhone}</span>
                                    </td>

                                    <td className="inv-td">
                                        <span className="inv-val-order">{invoice.orderId}</span>
                                    </td>

                                    <td className="inv-td">
                                        <span className="inv-val-invoice">{invoice.id}</span>
                                    </td>

                                    <td className="inv-td">
                                        <span style={{
                                            background: '#ede9fe', color: '#7c3aed',
                                            fontSize: '0.7rem', fontWeight: 700,
                                            padding: '2px 8px', borderRadius: '20px',
                                            border: '1px solid #ddd6fe'
                                        }}>
                                            {invoice.itemCount} Product{invoice.itemCount > 1 ? 's' : ''}
                                        </span>
                                    </td>

                                    <td className="inv-td">
                                        <span className="inv-val-amount">₹{invoice.amount?.toFixed(2)}</span>
                                    </td>

                                    <td className="inv-td">
                                        <span className="inv-val-method">{invoice.paymentMethod}</span>
                                    </td>
                                    
                                    <td className="inv-td">{invoice.date}</td>
                                    
                                    <td className="inv-td-center">
                                        <span className={`inv-status-badge ${invoice.status.toLowerCase()}`}>
                                            {invoice.status === 'Pending' ? 'Payout Pending' : invoice.status}
                                        </span>
                                    </td>
                                    
                                    <td className="inv-td-right">
                                        <div className="inv-actions">
                                            <button
                                                onClick={() => onViewHistory(invoice)}
                                                className="inv-btn inv-btn-history"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => onView(invoice)}
                                                className="inv-btn inv-btn-view"
                                            >
                                                <Eye size={13} /> View
                                            </button>
                                            <button
                                                onClick={() => onExport('pdf')}
                                                className="inv-btn inv-btn-download"
                                            >
                                                <Download size={13} /> Download
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="inv-pagination">
                <span className="inv-pagination-info">
                    Showing {Math.min(itemsPerPage * (currentPage - 1) + 1, totalCount)}–{Math.min(itemsPerPage * currentPage, totalCount)} of {totalCount} invoices
                </span>
                <div className="inv-pagination-btns">
                    <button
                        disabled={currentPage === 1}
                        className="inv-page-btn"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>
                    <span className="inv-page-label">
                        {currentPage} / {totalPages}
                    </span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="inv-page-btn"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorInvoiceList;
