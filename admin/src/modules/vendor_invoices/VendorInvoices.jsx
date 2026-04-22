import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import VendorInvoiceList from './components/VendorInvoiceList';
import VendorInvoiceStats from './components/VendorInvoiceStats';
import CustomerOrderHistoryModal from './components/CustomerOrderHistoryModal';
import ExportActions from '../../components/common/ExportActions';
import { getVendorInvoicesApi, downloadVendorInvoiceApi } from '../../api/vendor_invoices.api';
import { exportInvoicesToPDF, exportInvoicesToExcel } from './services/export.service';
import Toast from '../../components/common/Toast/Toast';


const VendorInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isGlobalSelected, setIsGlobalSelected] = useState(false);
    const [historyModal, setHistoryModal] = useState({ open: false, customer: null });
    const [stats, setStats] = useState({ 
        total: 0, 
        lifetimeEarnings: 0, 
        uniqueCustomers: 0, 
        avgPayout: 0 
    });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleViewHistory = (invoice) => {
        setHistoryModal({ open: true, customer: invoice });
    };

    const handleExportPDF = async () => {
        if (!isGlobalSelected && selectedIds.length === 0) {
            showToast('Please select at least one invoice to export', 'warning');
            return;
        }

        let invoicesToExport = [];
        if (isGlobalSelected) {
            setLoading(true);
            try {
                const response = await getVendorInvoicesApi({ ...filters, limit: pagination.totalRecords });
                if (response.data.success) {
                    invoicesToExport = response.data.data.records.map(record => ({
                        id: record.invoice_id,
                        orderId: record.orderId,
                        customerId: record.customerId,
                        customerPhone: record.customerPhone,
                        amount: record.amount,
                        paymentMethod: record.paymentMethod,
                        date: record.date,
                        status: record.status
                    }));
                }
            } catch (error) {
                showToast("Failed to fetch all records for export", "error");
                return;
            } finally {
                setLoading(false);
            }
        } else {
            invoicesToExport = invoices.filter(inv => selectedIds.includes(inv.id));
        }

        exportInvoicesToPDF(invoicesToExport);
        showToast(`Exporting ${invoicesToExport.length} invoices to PDF`, 'success');
        setSelectedIds([]);
        setIsGlobalSelected(false);
    };

    const handleExportExcel = async () => {
        if (!isGlobalSelected && selectedIds.length === 0) {
            showToast('Please select at least one invoice to export', 'warning');
            return;
        }

        let invoicesToExport = [];
        if (isGlobalSelected) {
            setLoading(true);
            try {
                const response = await getVendorInvoicesApi({ ...filters, limit: pagination.totalRecords });
                if (response.data.success) {
                    invoicesToExport = response.data.data.records.map(record => ({
                        id: record.invoice_id,
                        orderId: record.orderId,
                        customerId: record.customerId,
                        customerPhone: record.customerPhone,
                        amount: record.amount,
                        paymentMethod: record.paymentMethod,
                        date: record.date,
                        status: record.status,
                        itemCount: record.itemCount
                    }));
                }
            } catch (error) {
                showToast("Failed to fetch all records for export", "error");
                return;
            } finally {
                setLoading(false);
            }
        } else {
            invoicesToExport = invoices.filter(inv => selectedIds.includes(inv.id));
        }

        exportInvoicesToExcel(invoicesToExport);
        showToast(`Exporting ${invoicesToExport.length} invoices to Excel`, 'success');
        setSelectedIds([]);
        setIsGlobalSelected(false);
    };

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: filters.search,
                status: filters.status !== 'All' ? filters.status : undefined,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            };
            const response = await getVendorInvoicesApi(params);
            
            if (response.data.success) {
                const records = response.data.data.records.map(record => ({
                    id: record.invoice_id,
                    dbId: record.dbId,
                    orderId: record.orderId,
                    customerId: record.customerId,
                    customerName: record.customerId, // Falling back to customerId as name is not in API
                    customerPhone: record.customerPhone,
                    customerAvatar: record.profile,
                    amount: record.amount,
                    paymentMethod: record.paymentMethod,
                    date: record.date,
                    status: record.status,
                    itemCount: record.itemCount,
                    invoiceUrl: record.invoiceUrl
                }));
                
                setInvoices(records);
                const apiPagination = response.data.data.pagination;
                setPagination(prev => ({
                    ...prev,
                    totalRecords: apiPagination.totalRecords
                }));

                const apiStats = response.data.data.stats;
                setStats({
                    total: apiStats.total,
                    lifetimeEarnings: apiStats.lifetimeEarnings,
                    uniqueCustomers: apiStats.uniqueCustomers,
                    avgPayout: apiStats.avgPayout
                });
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [pagination.currentPage, pagination.itemsPerPage, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleViewInvoice = (invoice) => {
        if (invoice.invoiceUrl) {
            window.open(invoice.invoiceUrl, '_blank');
        } else {
            alert('Invoice URL not available');
        }
    };

    const handleDownloadInvoice = async (invoice) => {
        if (invoice.dbId) {
            setLoading(true);
            try {
                const response = await downloadVendorInvoiceApi(invoice.dbId);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `Invoice-${invoice.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Download failed:', error);
                alert('Failed to download invoice. Please try again.');
            } finally {
                setLoading(false);
            }
        } else {
            alert('Invoice ID not available for download');
        }
    };

    return (
        <div className="management-module">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>My Invoices</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track your completed payouts and generated payout invoices for fulfilled orders.
                    </p>
                </div>
            </div>

            <VendorInvoiceStats stats={stats} />

            <div style={{ marginTop: '24px', position: 'relative' }}>
                {loading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                    </div>
                )}
                
                <VendorInvoiceList
                    invoices={invoices}
                    totalCount={pagination.totalRecords}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedIds={selectedIds}
                    setSelectedIds={(ids) => {
                        setSelectedIds(ids);
                        setIsGlobalSelected(false);
                    }}
                    onSelectAll={(select) => {
                        setIsGlobalSelected(select);
                        setSelectedIds(select ? invoices.map(i => i.id) : []);
                    }}
                    isGlobalSelected={isGlobalSelected}
                    onView={handleViewInvoice}
                    onDownload={handleDownloadInvoice}
                    onViewHistory={handleViewHistory}
                    showToast={showToast}
                    onExportPDF={handleExportPDF}
                    onExportExcel={handleExportExcel}
                />
            </div>

            {historyModal.open && historyModal.customer && (
                <CustomerOrderHistoryModal
                    customerId={historyModal.customer.customerId}
                    customerName={historyModal.customer.customerName}
                    customerPhone={historyModal.customer.customerPhone}
                    customerAvatar={historyModal.customer.customerAvatar}
                    allInvoices={invoices}
                    onDownload={handleDownloadInvoice}
                    onClose={() => setHistoryModal({ open: false, customer: null })}
                    showToast={showToast}
                />
            )}

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
};

export default VendorInvoices;
