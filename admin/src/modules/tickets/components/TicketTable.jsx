import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MessageSquare, X, ChevronLeft, ChevronRight, Square, CheckSquare, Calendar, Loader2 } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import { getTicketsApi, replyToTicketApi } from '../../../api/admin_tickets.api';
import * as exportService from '../services/export.service';
import { getSafeImage } from '../../../utils/imageUtils';

const TicketTable = ({ type = 'all', title, onShowToast }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [replyModal, setReplyModal] = useState({ open: false, ticket: null });
    const [replyText, setReplyText] = useState('');

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedTickets, setSelectedTickets] = useState([]);
    const itemsPerPage = 10;

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: itemsPerPage,
                type: type,
                status: statusFilter,
                search: searchQuery,
                from_date: fromDate,
                to_date: toDate
            };
            const response = await getTicketsApi(params);
            const { records, pagination } = response.data.data;
            setTickets(records);
            setTotalRecords(pagination.totalRecords);
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to fetch tickets', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, type, statusFilter, searchQuery, fromDate, toDate, onShowToast]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Pagination logic
    const totalPages = Math.ceil(totalRecords / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= (totalPages || 1)) {
            setCurrentPage(page);
        }
    };

    // Selection logic
    const allSelectedInCurrentPage = tickets.length > 0 && tickets.every(t => selectedTickets.includes(t.id));

    const handleSelectAll = async () => {
        if (selectedTickets.length > 0 && selectedTickets.length >= totalRecords) {
            setSelectedTickets([]);
        } else {
            setLoading(true);
            try {
                const params = {
                    page: 1,
                    limit: totalRecords || 1000,
                    type: type,
                    status: statusFilter,
                    search: searchQuery,
                    from_date: fromDate,
                    to_date: toDate
                };
                const response = await getTicketsApi(params);
                const { records } = response.data.data;
                const allIds = records.map(t => t.id);
                setSelectedTickets(allIds);
            } catch (error) {
                onShowToast('Failed to select all tickets', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSelectOne = (id) => {
        setSelectedTickets(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleReply = (ticket) => {
        setReplyModal({ open: true, ticket });
        setReplyText('');
    };

    const submitReply = async () => {
        if (!replyText.trim()) {
            onShowToast('Please enter a reply text', 'warning');
            return;
        }

        try {
            await replyToTicketApi(replyModal.ticket.id, {
                userType: replyModal.ticket.userType,
                reply: replyText,
                status: 'Closed'
            });
            onShowToast(`Reply sent successfully!`, 'success');
            setReplyModal({ open: false, ticket: null });
            fetchTickets();
        } catch (error) {
            onShowToast(error.response?.data?.message || 'Failed to send reply', 'error');
        }
    };

    const handleExport = (message, type) => {
        onShowToast(message, type);
    };

    const handleDownload = async (exportType) => {
        try {
            if (selectedTickets.length === 0) {
                onShowToast("Please select at least one ticket to export", "error");
                return;
            }

            setLoading(true);
            let dataToExport = [];

            // Fetch all selected records if they span multiple pages or are not all in current local state
            if (selectedTickets.length > tickets.length || !selectedTickets.every(id => tickets.find(t => t.id === id))) {
                const params = {
                    page: 1,
                    limit: selectedTickets.length,
                    type: type,
                    status: statusFilter,
                    search: searchQuery,
                    from_date: fromDate,
                    to_date: toDate,
                    ids: selectedTickets.join(',')
                };
                const res = await getTicketsApi(params);
                dataToExport = res.data?.data?.records || [];
            } else {
                dataToExport = tickets.filter(t => selectedTickets.includes(t.id));
            }

            if (exportType === 'pdf') {
                exportService.exportTicketsToPDF(dataToExport);
            } else {
                exportService.exportTicketsToExcel(dataToExport);
            }
            onShowToast(`Exported ${dataToExport.length} tickets successfully!`);
        } catch (error) {
            onShowToast("Failed to export tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="c-table-container">
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="c-search">
                            <Search className="search-icon" size={16} />
                            <input
                                type="text"
                                placeholder="Search Tickets..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="input-with-icon" style={{ width: '150px' }}>
                            <Filter size={15} className="field-icon" />
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="filter-select"
                                style={{ width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px', border: '1px solid var(--border-color)', background: '#f8fafc', fontSize: '0.9rem' }}
                            >
                                <option value="">All Status</option>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>

                        <div className="date-filter-group" style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)', height: '42px' }}>
                            <Calendar size={15} color="#94a3b8" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', color: '#475569', outline: 'none' }}
                            />
                            <span style={{ color: '#cbd5e1' }}>-</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                                style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', color: '#475569', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <ExportActions
                            selectedCount={selectedTickets.length}
                            onExport={handleExport}
                            onDownload={handleDownload}
                        />
                    </div>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table" style={{ minWidth: '1400px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '48px', textAlign: 'center' }}>
                                <div onClick={handleSelectAll} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                    {selectedTickets.length > 0 && selectedTickets.length >= totalRecords ? <CheckSquare size={18} color="var(--primary-color)" /> : <Square size={18} color="#94a3b8" />}
                                </div>
                            </th>
                            <th>Ticket ID</th>
                            <th style={{ textAlign: 'center' }}>User Info</th>
                            <th>User Type</th>
                            <th>User Contact</th>
                            <th>Recipient Name</th>
                            <th>Recipient Contact</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Date Raised</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="12" style={{ textAlign: 'center', padding: '80px' }}>
                                    <Loader2 className="animate-spin" size={40} color="var(--primary-color)" style={{ margin: '0 auto' }} />
                                    <p style={{ marginTop: '12px', color: '#64748b', fontWeight: 500 }}>Loading tickets...</p>
                                </td>
                            </tr>
                        ) : tickets.length > 0 ? (
                            tickets.map(ticket => (
                                <tr key={ticket.id} className={selectedTickets.includes(ticket.id) ? 'selected-row' : ''}>
                                    <td style={{ textAlign: 'center' }}>
                                        <div onClick={() => handleSelectOne(ticket.id)} style={{ cursor: 'pointer', display: 'inline-flex' }}>
                                            {selectedTickets.includes(ticket.id) ? <CheckSquare size={18} color="var(--primary-color)" /> : <Square size={18} color="#94a3b8" />}
                                        </div>
                                    </td>
                                    <td><span style={{ fontWeight: 700, color: '#1e293b' }}>{ticket.id}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                                <img 
                                                    src={getSafeImage(ticket.userImage, ticket.userType === 'VENDOR' ? 'BRAND' : 'USER')} 
                                                    alt={ticket.userName} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{ticket.userName}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginTop: '2px' }}>{ticket.userId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '5px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                                            background: ticket.userType === 'VENDOR' ? '#eff6ff' : ticket.userType === 'RIDER' ? '#f0fdf4' : '#fdf2f8',
                                            color: ticket.userType === 'VENDOR' ? '#2563eb' : ticket.userType === 'RIDER' ? '#166534' : '#db2777',
                                            border: `1px solid ${ticket.userType === 'VENDOR' ? '#dbeafe' : ticket.userType === 'RIDER' ? '#dcfce7' : '#fce7f3'}`
                                        }}>
                                            {ticket.userType}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#111827', fontSize: '0.82rem' }}>{ticket.userPhone}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1px' }}>{ticket.userEmail}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#374151', fontSize: '0.88rem' }}>{ticket.recipientName}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.82rem' }}>{ticket.recipientPhone}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '1px' }}>{ticket.recipientEmail}</div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }} title={ticket.subject}>
                                            {ticket.subject}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#64748b' }} title={ticket.description}>
                                            {ticket.description}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${ticket.status === 'Closed' ? 'status-approved' : 'status-blocked'}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{ticket.created_at?.date || "--"}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{ticket.created_at?.time || "--"}</div>
                                    </td>
                                    <td className="col-actions">
                                        <button
                                            onClick={() => handleReply(ticket)}
                                            style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                                        >
                                            <MessageSquare size={14} /> {ticket.status === 'Closed' ? 'View' : 'Reply'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="text-center p-4" style={{ color: '#94a3b8', textAlign: 'center', padding: '60px' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>No Tickets Found</div>
                                    <p style={{ fontSize: '0.9rem' }}>Try adjusting your filters or search terms.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="c-pagination">
                <span className="c-pagination-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} entries
                </span>
                <div className="c-pagination-btns">
                    <button
                        className="c-page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={14} /> Prev
                    </button>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                    backgroundColor: currentPage === i + 1 ? 'var(--primary-color)' : 'white',
                                    color: currentPage === i + 1 ? 'white' : '#64748b',
                                    fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </span>

                    <button
                        className="c-page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Reply Modal */}
            {replyModal.open && replyModal.ticket && (
                <div className="modal-overlay">
                    <div className="modal-content admin-form-modal" style={{ maxWidth: '600px', width: '90%' }}>
                        <div className="modal-header">
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Ticket details: {replyModal.ticket.id}</h2>
                            <button className="close-btn" onClick={() => setReplyModal({ open: false, ticket: null })}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img 
                                                src={getSafeImage(replyModal.ticket.userImage, replyModal.ticket.userType === 'VENDOR' ? 'BRAND' : 'USER')} 
                                                alt={replyModal.ticket.userName} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div>
                                            <strong style={{ fontSize: '15px', display: 'block' }}>{replyModal.ticket.userName}</strong>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{replyModal.ticket.userId} | {replyModal.ticket.userPhone}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{replyModal.ticket.created_at?.date} {replyModal.ticket.created_at?.time}</span>
                                </div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#0f172a' }}>{replyModal.ticket.subject}</h4>
                                <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{replyModal.ticket.description}</p>
                                
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '12px' }}>
                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Recipient Details</span>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Department / Name</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{replyModal.ticket.recipientName}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Working Hours</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{replyModal.ticket.recipientWorkingHours}</span>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Contact Information</span>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{replyModal.ticket.recipientPhone}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>{replyModal.ticket.recipientEmail}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {replyModal.ticket.replies.length > 0 && (
                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ marginBottom: '12px', fontSize: '14px', color: '#475569', fontWeight: 600 }}>Thread</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {replyModal.ticket.replies.map((reply, idx) => (
                                            <div key={idx} style={{ padding: '12px', backgroundColor: reply.sender === 'Admin' ? '#eff6ff' : '#f1f5f9', borderRadius: '8px', border: `1px solid ${reply.sender === 'Admin' ? '#bfdbfe' : '#e2e8f0'}`, alignSelf: reply.sender === 'Admin' ? 'flex-end' : 'flex-start', width: '85%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{reply.sender}</strong>
                                                    <span style={{ color: '#64748b', fontSize: '12px' }}>{reply.date?.date} {reply.date?.time}</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: '1.4' }}>{reply.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {replyModal.ticket.status !== 'Closed' && (
                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Your Reply</label>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply here..."
                                        style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical', fontFamily: 'inherit', fontSize: '14px' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #e2e8f0' }}>
                            <button className="btn btn-secondary" onClick={() => setReplyModal({ open: false, ticket: null })}>Close</button>
                            {replyModal.ticket.status !== 'Closed' && (
                                <button className="btn btn-primary" onClick={submitReply}>Send Reply</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketTable;
