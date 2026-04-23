import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import CustomerInvoiceList from './components/CustomerInvoiceList';
import InvoiceStats from './components/InvoiceStats';
import CustomerInvoiceHistoryModal from './components/CustomerInvoiceHistoryModal';
import { getAdminCustomerInvoicesApi } from '../../api/admin_invoices.api';
import Toast from '../../components/common/Toast/Toast';
import { exportCustomerSummariesToExcel, exportCustomerSummariesToPDF } from './services/invoiceExport.service';

const CustomerInvoices = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyCustomerId, setHistoryCustomerId] = useState(null);
    const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, refunded: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleViewHistory = (customerId) => {
        setHistoryCustomerId(customerId);
        setIsHistoryModalOpen(true);
    };

    const fetchCustomerSummaries = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: filters.search,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            };
            const res = await getAdminCustomerInvoicesApi(params);
            if (res.data.success) {
                setCustomers(res.data.data.records);
                setPagination(prev => ({
                    ...prev,
                    totalRecords: res.data.data.pagination.totalRecords
                }));
                setStats(res.data.data.stats);
            }
        } catch (err) {
            console.error("Error fetching customer invoices:", err);
            showToast("Failed to fetch customer invoices", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkExport = async (type) => {
        if (selectedIds.length === 0) {
            return showToast('Please select customers to export', 'error');
        }

        setLoading(true);
        try {
            let dataToExport;
            if (selectedIds.length > customers.length) {
                const res = await getAdminCustomerInvoicesApi({
                    limit: pagination.totalRecords,
                    ...filters
                });
                dataToExport = (res.data.data.records || []).filter(c => selectedIds.includes(c.customerId));
            } else {
                dataToExport = customers.filter(c => selectedIds.includes(c.customerId));
            }

            if (type === 'excel') {
                exportCustomerSummariesToExcel(dataToExport);
                showToast('Excel report generated successfully');
            } else {
                exportCustomerSummariesToPDF(dataToExport);
                showToast('PDF report generated successfully');
            }
        } catch (error) {
            showToast('Failed to generate report', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = async (select) => {
        if (!select) {
            setSelectedIds([]);
            return;
        }

        setLoading(true);
        try {
            const params = { limit: pagination.totalRecords, ...filters };
            const res = await getAdminCustomerInvoicesApi(params);
            if (res.data.success) {
                const allIds = (res.data.data.records || []).map(c => c.customerId);
                setSelectedIds(allIds);
            }
        } catch (error) {
            showToast('Failed to select all customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCustomerSummaries();
        }, 500);
        return () => clearTimeout(debounce);
    }, [pagination.currentPage, pagination.itemsPerPage, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    return (
        <div className="management-module">
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Customer Invoice Summary</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Overview of customer billing and invoice history.
                    </p>
                </div>
            </div>

            <InvoiceStats stats={stats} />

            <div style={{ marginTop: '24px', position: 'relative' }}>
                {loading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                    </div>
                )}

                <CustomerInvoiceList
                    invoices={customers}
                    totalCount={pagination.totalRecords}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onSelectAll={handleSelectAll}
                    onViewHistory={handleViewHistory}
                    onExport={handleBulkExport}
                    showToast={showToast}
                />
            </div>

            {isHistoryModalOpen && (
                <CustomerInvoiceHistoryModal
                    customerId={historyCustomerId}
                    onClose={() => setIsHistoryModalOpen(false)}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export default CustomerInvoices;
