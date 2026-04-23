import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import CustomerInvoiceList from './CustomerInvoiceList';
import InvoiceStats from './InvoiceStats';
import { getCustomerInvoiceHistoryApi, downloadCustomerInvoiceApi } from '../../../api/admin_invoices.api';
import { exportCustomerHistoryToExcel, exportCustomerHistoryToPDF } from '../services/invoiceExport.service';

const CustomerInvoiceHistoryModal = ({ customerId, onClose, showToast }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, refunded: 0 });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: filters.search,
                status: filters.status,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            };
            const res = await getCustomerInvoiceHistoryApi(customerId, params);
            if (res.data.success) {
                setInvoices(res.data.data.records);
                setPagination(prev => ({
                    ...prev,
                    totalRecords: res.data.data.pagination.totalRecords
                }));
                // For simplicity, we can calculate stats from the first page or pass from summary
                // If the backend doesn't provide history stats, we use a simple count
                setStats({
                    total: res.data.data.pagination.totalRecords,
                    paid: 0, // Simplified for now
                    pending: 0,
                    refunded: 0
                });
            }
        } catch (err) {
            console.error("Error fetching history:", err);
            showToast("Failed to fetch invoice history", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [pagination.currentPage, pagination.itemsPerPage, filters, customerId]);

    const handleDownload = async (item) => {
        try {
            const res = await downloadCustomerInvoiceApi(item.dbId);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            showToast("Invoice opened in new tab");
        } catch (error) {
            showToast("Failed to download invoice", "error");
        }
    };

    const handleHistoryExport = async (type) => {
        if (selectedIds.length === 0) {
            return showToast('Please select invoices to export', 'error');
        }

        try {
            let dataToExport;
            if (selectedIds.length > invoices.length) {
                const res = await getCustomerInvoiceHistoryApi(customerId, { limit: pagination.totalRecords });
                dataToExport = res.data.data.records.filter(i => selectedIds.includes(i.id));
            } else {
                dataToExport = invoices.filter(i => selectedIds.includes(i.id));
            }

            if (type === 'excel') {
                exportCustomerHistoryToExcel(dataToExport, customerId);
            } else {
                exportCustomerHistoryToPDF(dataToExport, customerId);
            }
            showToast("Export completed successfully");
        } catch (err) {
            showToast("Export failed", "error");
        }
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '260px' }}>
            <div className="customer-view-modal" style={{ width: '95%', maxWidth: '1400px', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Invoice History</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className="cust-id-badge" style={{ margin: 0 }}>CUST-ID: {customerId}</span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Full Transaction Log</span>
                            </div>
                        </div>
                    </div>
                    <button className="icon-btn-sm" onClick={onClose} style={{ width: '40px', height: '40px' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ background: '#fafbfc', flex: 1, padding: '24px', overflowY: 'auto' }}>
                    <div style={{ padding: '0 8px' }}>
                        <InvoiceStats stats={stats} />
                    </div>

                    <div style={{ marginTop: '24px', position: 'relative' }}>
                        {loading && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                            </div>
                        )}
                        
                        <CustomerInvoiceList
                            invoices={invoices}
                            totalCount={pagination.totalRecords}
                            filters={filters}
                            setFilters={handleFilterChange}
                            pagination={pagination}
                            setPagination={setPagination}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            onSelectAll={(select) => setSelectedIds(select ? invoices.map(i => i.id) : [])}
                            onView={(item) => handleDownload(item)}
                            onExport={(type, item) => item ? handleDownload(item) : handleHistoryExport(type)}
                            showToast={showToast}
                            mode="detail"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerInvoiceHistoryModal;
