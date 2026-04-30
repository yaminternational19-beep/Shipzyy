import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import VendorInvoiceList from './VendorInvoiceList';
import InvoiceStats from './InvoiceStats';
import { getVendorInvoiceHistoryApi, downloadVendorInvoiceApi } from '../../../api/admin_invoices.api';
import { exportVendorHistoryToExcel, exportVendorHistoryToPDF } from '../services/invoiceExport.service';
import { getSafeImage } from '../../../utils/imageUtils';

const VendorInvoiceHistoryModal = ({ vendorId, onClose, showToast }) => {
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
                ...filters
            };
            if (params.status === 'All') delete params.status;

            const res = await getVendorInvoiceHistoryApi(vendorId, params);
            if (res.data.success) {
                const { records, pagination: pg } = res.data.data;
                setInvoices(records);
                setPagination(prev => ({ ...prev, totalRecords: pg.totalRecords }));
                
                // Calculate local stats for this vendor's view
                // In a real scenario, the backend could return these stats as well
                if (pagination.currentPage === 1) {
                    const paid = records.filter(i => i.status === 'Paid').length;
                    const pending = records.filter(i => i.status === 'Pending').length;
                    const refunded = records.filter(i => i.status === 'Cancelled').length;
                    setStats({
                        total: pg.totalRecords,
                        paid: paid, // This is just a sample for the first page, backend should ideally provide full stats
                        pending: pending,
                        refunded: refunded
                    });
                }
            }
        } catch (err) {
            console.error("Error fetching vendor history:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [pagination.currentPage, pagination.itemsPerPage, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleView = async (invoice) => {
        // Open window immediately to avoid popup blocker
        const win = window.open('', '_blank');
        if (win) win.document.write('Loading invoice...');

        try {
            const res = await downloadVendorInvoiceApi(invoice.dbId || invoice.id);
            const blob = new Blob([res.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            
            if (win) {
                win.location.href = url;
            } else {
                // Fallback if window.open failed
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (err) {
            console.error("Error viewing invoice:", err);
            if (win) win.close();
        }
    };

    const handleHistoryExport = (type) => {
        if (invoices.length === 0) return;
        
        const dataToExport = selectedIds.length > 0 
            ? invoices.filter(i => selectedIds.includes(i.id))
            : invoices;

        if (type === 'excel') {
            exportVendorHistoryToExcel(dataToExport, vendorId);
        } else {
            exportVendorHistoryToPDF(dataToExport, vendorId);
        }
    };

    const handleDownload = async (invoice) => {
        try {
            const res = await downloadVendorInvoiceApi(invoice.dbId || invoice.id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoice.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading invoice:", err);
        }
    };

    return (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '260px' }}>
            <div className="customer-view-modal" style={{ width: '95%', maxWidth: '1400px', height: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                            <img src={getSafeImage(null, 'USER')} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>Vendor Invoice History</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className="cust-id-badge" style={{ margin: 0, background: '#fff7ed', color: '#ea580c', borderColor: '#ffedd5' }}>VND-{vendorId}</span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Detailed transaction records</span>
                            </div>
                        </div>
                    </div>
                    <button className="icon-btn-sm" onClick={onClose} style={{ width: '40px', height: '40px' }}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ background: '#fafbfc', flex: 1, padding: '24px', overflowY: 'auto' }}>
                    <InvoiceStats stats={stats} />

                    <div style={{ marginTop: '24px', position: 'relative' }}>
                        {loading && (
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                            </div>
                        )}
                        
                        <VendorInvoiceList
                            mode="detail"
                            invoices={invoices}
                            totalCount={pagination.totalRecords}
                            filters={filters}
                            setFilters={handleFilterChange}
                            pagination={pagination}
                            setPagination={setPagination}
                            selectedIds={selectedIds}
                            setSelectedIds={setSelectedIds}
                            onSelectAll={(select) => setSelectedIds(select ? invoices.map(i => i.id) : [])}
                            onView={(item) => handleView(item)}
                            onExport={(type, item) => item ? handleDownload(item) : handleHistoryExport(type)}
                            showToast={showToast}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorInvoiceHistoryModal;
