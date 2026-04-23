import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import VendorInvoiceList from './components/VendorInvoiceList';
import InvoiceStats from './components/InvoiceStats';
import VendorInvoiceHistoryModal from './components/VendorInvoiceHistoryModal';

import { getAdminVendorInvoicesApi } from '../../api/admin_invoices.api';
import Toast from '../../components/common/Toast/Toast';
import { exportVendorSummariesToExcel, exportVendorSummariesToPDF } from './services/invoiceExport.service';

const VendorInvoices = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0, totalPages: 1 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyVendorId, setHistoryVendorId] = useState(null);
    const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, refunded: 0 });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleViewHistory = (id) => {
        setHistoryVendorId(id);
        setIsHistoryModalOpen(true);
    };

    const fetchVendorSummaries = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                ...filters
            };
            
            const res = await getAdminVendorInvoicesApi(params);
            if (res.data.success) {
                const { records, pagination: pg, stats: apiStats } = res.data.data;
                setVendors(records);
                setPagination(prev => ({
                    ...prev,
                    totalRecords: pg.totalRecords,
                    totalPages: pg.totalPages
                }));
                setStats({
                    total: apiStats.total,
                    paid: apiStats.paid,
                    pending: apiStats.pending,
                    refunded: apiStats.refunded
                });
            }
        } catch (err) {
            console.error("Error fetching vendor summaries:", err);
            showToast("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleBulkExport = async (type) => {
        if (selectedIds.length === 0) {
            return showToast('Please select vendors to export', 'error');
        }
        
        setLoading(true);
        try {
            let dataToExport;
            
            // If we have more selected than current page items, fetch all selected data
            if (selectedIds.length > vendors.length) {
                const res = await getAdminVendorInvoicesApi({ 
                    limit: pagination.totalRecords,
                    ...filters 
                });
                dataToExport = (res.data.data.records || []).filter(v => selectedIds.includes(v.vendorId));
            } else {
                dataToExport = vendors.filter(v => selectedIds.includes(v.vendorId));
            }

            if (type === 'excel') {
                exportVendorSummariesToExcel(dataToExport);
                showToast('Excel report generated successfully');
            } else {
                exportVendorSummariesToPDF(dataToExport);
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
            // Fetch all records with current filters to get all IDs
            const params = {
                limit: pagination.totalRecords,
                ...filters
            };
            
            const res = await getAdminVendorInvoicesApi(params);
            if (res.data.success) {
                const allIds = (res.data.data.records || []).map(v => v.vendorId);
                setSelectedIds(allIds);
            }
        } catch (error) {
            console.error('Select All Error:', error);
            showToast('Failed to select all vendors', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchVendorSummaries();
        }, 300);
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
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Vendor Invoice Summary</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Overview of vendor payouts and invoice history.
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
                
                <VendorInvoiceList
                    invoices={vendors} // Reusing the prop name for now
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
                <VendorInvoiceHistoryModal 
                    vendorId={historyVendorId} 
                    onClose={() => setIsHistoryModalOpen(false)} 
                    showToast={showToast}
                />
            )}
        </div>
    );
};
export default VendorInvoices;
