import React, { useState, useMemo, useEffect } from 'react';
import { Clock, CheckCircle, MessageSquare, AlertTriangle, ChevronLeft, ChevronRight, Eye, Hash, Search, X, User, Square, CheckSquare, Calendar, Filter } from 'lucide-react';
import '../VendorSupport.css';
import { getVendorQueriesApi } from '../../../api/vendor_support.api';
import * as exportService from '../services/query_export.service';
import Toast from '../../../components/common/Toast/Toast';






const QueryList = ({ queries: initialQueries = [] }) => {
  const [queries, setQueries] = useState(initialQueries);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleExportPDF = () => {
    try {
      if (selectedIds.length === 0) {
        showToast("Please select at least one ticket to export", "error");
        return;
      }
      const dataToExport = queries.filter(q => selectedIds.includes(q.id));
      exportService.exportQueriesToPDF(dataToExport);
      showToast(`Exported ${selectedIds.length} tickets to PDF successfully!`);
    } catch (error) {
      showToast("Failed to export PDF", "error");
    }
  };

  const handleExportExcel = () => {
    try {
      if (selectedIds.length === 0) {
        showToast("Please select at least one ticket to export", "error");
        return;
      }
      const dataToExport = queries.filter(q => selectedIds.includes(q.id));
      exportService.exportQueriesToExcel(dataToExport);
      showToast(`Exported ${selectedIds.length} tickets to Excel successfully!`);
    } catch (error) {
      showToast("Failed to export Excel", "error");
    }
  };

  // Filter queries based on status and search query
  const filteredQueries = useMemo(() => {
    let result = [...queries].reverse();

    // Status Filter
    if (filter !== 'All') {
      result = result.filter(q => q.status === filter);
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(ticket =>
        String(ticket.support_ticket_id || '').toLowerCase().includes(q) ||
        String(ticket.userName || '').toLowerCase().includes(q) ||
        String(ticket.subject || '').toLowerCase().includes(q) ||
        String(ticket.message || '').toLowerCase().includes(q)
      );
    }

    // Date Range Filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(q => {
        const ticketDate = new Date(q.raw_created_at || q.created_at);
        return ticketDate >= start && ticketDate <= end;
      });
    }

    return result;
  }, [queries, filter, searchQuery, startDate, endDate]);

  // Paginate filtered results
  const paginatedQueries = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredQueries.slice(start, end);
  }, [filteredQueries, pagination.page, pagination.limit]);

  const totalPages = Math.ceil(filteredQueries.length / pagination.limit);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await getVendorQueriesApi();
        const data =
          res.data?.records ||
          res.data?.data?.records ||
          res.data?.data ||
          [];
          
        setQueries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load vendor queries:', error);
      }
    };

    fetchQueries();
  }, []);

  const formatDate = (dateValue, rawDate) => {
    // Prioritize raw_created_at for accurate local timezone formatting
    const source = rawDate || (typeof dateValue !== 'object' ? dateValue : null);
    
    if (source) {
      const date = new Date(source);
      if (!isNaN(date.getTime())) {
        return {
          date: date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: '2-digit' 
          }),
          time: date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: true 
          })
        };
      }
    }

    // Fallback to pre-formatted object from backend if raw is missing
    if (dateValue && typeof dateValue === 'object' && dateValue.date) {
      return dateValue;
    }
    
    return { date: '--', time: '--' };
  };

  // Selection Logic (Matching TicketTable.jsx logic)
  const allSelectedInCurrentPage = paginatedQueries.length > 0 && paginatedQueries.every(q => selectedIds.includes(q.id));

  const handleSelectAll = () => {
    if (allSelectedInCurrentPage) {
      setSelectedIds(prev => prev.filter(id => !paginatedQueries.find(q => q.id === id)));
    } else {
      const currentIds = paginatedQueries.map(q => q.id);
      setSelectedIds(prev => [...new Set([...prev, ...currentIds])]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="vendor-support-container">
      {/* Table Section Wrapped in standardized container */}
      <div className="products-table-section">
        {/* Reformatted Filter Bar to match global structure */}
        <div className="product-filters-container">
          <div className="p-search" style={{ width: '240px' }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group" style={{ gap: '10px' }}>
            <select
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '130px' }}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="filter-select"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '145px', padding: '7px 10px' }}
              />
              <span style={{ color: '#cbd5e1', fontWeight: 700 }}>—</span>
              <input
                type="date"
                className="filter-select"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '145px', padding: '7px 10px' }}
              />
            </div>

            {(filter !== 'All' || searchQuery || startDate || endDate) && (
              <button 
                onClick={() => {
                  setFilter('All');
                  setSearchQuery('');
                  setStartDate('');
                  setEndDate('');
                }}
                style={{ 
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <X size={14} /> Reset
              </button>
            )}
          </div>

          <div className="filter-actions" style={{ marginLeft: 'auto' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={handleExportPDF}
                className="btn-export"
                style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="btn-export"
                style={{ backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #dcfce7', padding: '8px 14px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-table-container">
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table" style={{ minWidth: '1500px' }}>
              <thead>
                <tr>
                  <th style={{ width: '48px' }}>
                    <div onClick={handleSelectAll} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      {allSelectedInCurrentPage ? (
                        <CheckSquare size={17} color="var(--primary-color)" />
                      ) : (
                        <Square size={17} color="#94a3b8" />
                      )}
                    </div>
                  </th>
                  <th style={{ width: '100px' }}>TICKET ID</th>
                  <th style={{ width: '180px' }}>USER NAME</th>
                  <th style={{ width: '100px' }}>USER TYPE</th>
                  <th style={{ width: '200px' }}>USER CONTACT</th>
                  <th style={{ width: '180px' }}>RECIPIENT</th>
                  <th style={{ width: '200px' }}>CONTACT</th>
                  <th style={{ width: '220px' }}>SUBJECT</th>
                  <th style={{ width: '280px' }}>MESSAGE</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>STATUS</th>
                  <th style={{ width: '140px' }}>DATE RAISED</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedQueries.length === 0 ? (
                  <tr>
                    <td colSpan="12" style={{ padding: '80px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <AlertTriangle size={36} color="#94a3b8" />
                        <div style={{ fontWeight: 700, color: '#475569' }}>No Tickets Found</div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQueries.map((query) => {
                    const dateInfo = formatDate(query.created_at, query.raw_created_at);
                    const isSelected = selectedIds.includes(query.id);
                    return (
                      <tr key={query.id} className={isSelected ? 'selected-row' : ''}>
                        <td>
                          <div onClick={() => handleSelectOne(query.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            {isSelected ? (
                              <CheckSquare size={17} color="var(--primary-color)" />
                            ) : (
                              <Square size={17} color="#94a3b8" />
                            )}
                          </div>
                        </td>
                        <td>
                          <div style={{ lineHeight: '1.4' }}>
                            <div style={{ fontWeight: 700, color: '#64748b', fontSize: '10px' }}></div>
                            <div style={{ fontWeight: 800, color: 'var(--primary-color)', fontSize: '12px', letterSpacing: '0.3px' }}>
                              {query.support_ticket_id}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ 
                            fontWeight: 700, 
                            color: 'var(--text-primary)', 
                            fontSize: '0.9rem',
                            maxWidth: '180px',
                            lineHeight: '1.3',
                            wordBreak: 'break-word'
                          }}>
                            {query.userName || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 700,
                            background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0',
                            textTransform: 'uppercase'
                          }}>
                            {query.userType}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{query.userPhone}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '1px' }}>{query.userEmail}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#334155', fontSize: '14px' }}>{query.recipientName}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px' }}>{query.recipientPhone}</div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '1px' }}>{query.recipientEmail}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={query.subject}>
                            {query.subject}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#4b5563', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={query.message}>
                            {query.message}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`status-badge ${query.status === 'Closed' ? 'approved' : 'rejected'}`}>
                            {query.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{dateInfo.date}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{dateInfo.time}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button
                              onClick={() => setSelectedTicket(query)}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section matched with VendorProductsPage */}
          <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
            <span className="c-pagination-info">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, filteredQueries.length)}–{Math.min(pagination.page * pagination.limit, filteredQueries.length)} of {filteredQueries.length} tickets
            </span>
            <div className="c-pagination-btns" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="c-page-btn"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 4px' }}>
                  {pagination.page} / {totalPages || 1}
                </span>
                <button
                  className="c-page-btn"
                  disabled={pagination.page === totalPages || totalPages === 0}
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="ticket-modal-overlay">
          <div className="ticket-modal-content">
            <div className="ticket-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Hash size={20} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Ticket Details: {selectedTicket.support_ticket_id || selectedTicket.id}</h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedTicket(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="ticket-modal-body">
              <div className="ticket-detail-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="ticket-detail-row">
                  <div className="ticket-detail-col ticket-detail-item">
                    <label>Recipient Department</label>
                    <div className="value">{selectedTicket.recipientName}</div>
                  </div>
                  <div className="ticket-detail-col ticket-detail-item">
                    <label>Date Raised</label>
                    <div className="value">
                      {(() => {
                        const info = formatDate(selectedTicket.created_at, selectedTicket.raw_created_at);
                        return `${info.date} ${info.time}`;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="ticket-detail-item" style={{ marginTop: '16px' }}>
                  <label>Subject</label>
                  <div className="value" style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedTicket.subject}</div>
                </div>

                <div className="ticket-message-preview ticket-detail-item">
                  <label>Your Message</label>
                  <p>{selectedTicket.message}</p>
                </div>

                {selectedTicket.admin_reply && (
                  <div className="ticket-admin-reply">
                    <div className="reply-head">
                      <MessageSquare size={14} /> Official Response
                    </div>
                    <p>{selectedTicket.admin_reply}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="ticket-modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Close View</button>
            </div>
          </div>
        </div>
      )}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default QueryList;
