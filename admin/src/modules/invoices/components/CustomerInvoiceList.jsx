import React from 'react';
import { Search, ChevronLeft, ChevronRight, Square, CheckSquare, Download, Eye } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import './InvoiceList.css';

const CustomerInvoiceList = ({
    invoices, totalCount, filters, setFilters, pagination, setPagination,
    selectedIds, setSelectedIds, onSelectAll, onExport, onViewHistory, onView,
    showToast,
    mode = 'summary' // 'summary' for customers, 'detail' for individual invoices
}) => {
    const { currentPage, itemsPerPage } = pagination;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

    const toggleSelectAll = () => {
        if (onSelectAll) onSelectAll(selectedIds.length !== totalCount);
    };

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
                            placeholder={mode === 'summary' ? "Search customer name or ID..." : "Search invoice or order ID..."}
                            className="inv-search-input"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    {mode === 'detail' && (
                        <select
                            className="inv-select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    )}

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
                <ExportActions selectedCount={selectedIds.length} onExport={showToast} onDownload={onExport} />
            </div>

            <div className="inv-table-scroll">
                <table className="inv-table">
                    <thead className="inv-thead">
                        {mode === 'summary' ? (
                            <tr>
                                <th className="inv-th-check">
                                    <div onClick={toggleSelectAll} className="inv-check-trigger">
                                        {selectedIds.length === totalCount && totalCount > 0 ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                    </div>
                                </th>
                                <th className="inv-th-center">IMAGE</th>
                                <th className="inv-th-center">CUST ID</th>
                                <th className="inv-th-center">CUSTOMER NAME</th>
                                <th className="inv-th-center">CUSTOMER DETAILS</th>
                                <th className="inv-th-center">TOTAL INVOICES</th>
                                <th className="inv-th-center">TOTAL AMOUNT</th>
                                <th className="inv-th-center">PENDING AMOUNT</th>
                                <th className="inv-th-center">LAST DATE</th>
                                <th className="inv-th-right" style={{ textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        ) : (
                            <tr>
                                <th className="inv-th-check">
                                    <div onClick={toggleSelectAll} className="inv-check-trigger">
                                        {selectedIds.length === totalCount && totalCount > 0 ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                    </div>
                                </th>
                                <th className="inv-th-center">INVOICE ID</th>
                                <th className="inv-th-center">ORDER ID</th>
                                <th className="inv-th-center">AMOUNT</th>
                                <th className="inv-th-center">ITEMS</th>
                                <th className="inv-th-center">METHOD</th>
                                <th className="inv-th-center">DATE</th>
                                <th className="inv-th-center">STATUS</th>
                                <th className="inv-th-right" style={{ textAlign: 'center' }}>ACTIONS</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="inv-tbody">
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={mode === 'summary' ? 10 : 9} className="inv-empty-cell">
                                    <div className="inv-empty-title">No {mode === 'summary' ? 'Customers' : 'Invoices'} Found</div>
                                    <p className="inv-empty-sub">Try adjusting your filters or search terms.</p>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((item) => {
                                const rowId = mode === 'summary' ? item.customerId : item.id;
                                return (
                                    <tr key={rowId} className={selectedIds.includes(rowId) ? 'selected' : ''}>
                                        <td className="inv-check-cell">
                                            <div onClick={() => toggleSelectRow(rowId)} className="inv-check-trigger">
                                                {selectedIds.includes(rowId) ? <CheckSquare size={17} color="#4f46e5" /> : <Square size={17} color="#94a3b8" />}
                                            </div>
                                        </td>

                                        {mode === 'summary' ? (
                                            <>
                                                <td className="inv-td-center">
                                                    <div className="inv-avatar" style={{ margin: '0 auto' }}>
                                                        <img src={item.customerAvatar} alt={item.customerId} title={item.customerName} />
                                                    </div>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-badge-orange" style={{ fontSize: '12px' }}>{item.customerId}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.customerName}</div>
                                                </td>
                                                <td className="inv-td-center">
                                                    <div className="inv-val-phone" style={{ fontSize: '12px' }}>{item.customerPhone}</div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.customerEmail}</div>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-order" style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.totalInvoices}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-amount" style={{ color: '#059669' }}>₹{item.totalAmount?.toLocaleString()}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-amount" style={{ color: '#dc2626' }}>₹{item.pendingAmount?.toLocaleString()}</span>
                                                </td>
                                                <td className="inv-td-center" style={{ fontSize: '13px' }}>
                                                    {item.lastInvoiceDate ? new Date(item.lastInvoiceDate).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="inv-td-right">
                                                    <div className="inv-actions">
                                                        <button 
                                                            onClick={() => onViewHistory(item.dbCustomerId || item.customerId)}
                                                            className="inv-btn-action-small history"
                                                            style={{ padding: '8px 20px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', fontWeight: 600 }}
                                                        >
                                                            History
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-invoice">{item.id}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-order">{item.orderId}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-amount">₹{item.amount?.toLocaleString()}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-order">{item.itemCount}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className="inv-val-method">{item.paymentMethod}</span>
                                                </td>
                                                <td className="inv-td-center">
                                                    <div style={{ fontSize: '13px' }}>
                                                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="inv-td-center">
                                                    <span className={`inv-status-badge ${item.status.toLowerCase()}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="inv-td-right">
                                                    <div className="inv-actions">
                                                        <button
                                                            onClick={() => onView(item)}
                                                            className="inv-btn-action-icon view"
                                                            style={{ padding: '6px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}
                                                        >
                                                            <Eye size={16} /> View
                                                        </button>
                                                        <button
                                                            onClick={() => onExport('pdf', item)}
                                                            className="inv-btn-action-icon download"
                                                            style={{ padding: '6px', borderRadius: '6px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #dcfce7' }}
                                                        >
                                                            <Download size={16} /> Download
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })
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

export default CustomerInvoiceList;
