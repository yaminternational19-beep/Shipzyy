import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import VendorInvoiceList from './components/VendorInvoiceList';
import InvoiceStats from './components/InvoiceStats';
import VendorInvoiceHistoryModal from './components/VendorInvoiceHistoryModal';

// Mock Data
const MOCK_DATA = Array.from({ length: 45 }, (_, i) => {
    const isPaid = Math.random() > 0.4;
    const isCancelled = Math.random() > 0.9;
    const paymentMethod = Math.random() > 0.5 ? 'Bank Transfer' : 'Platform Wallet';
    let status = isCancelled ? 'Cancelled' : isPaid ? 'Paid' : 'Pending';

    return {
        id: `INV-V-${1000 + i}`,
        orderId: `ORD-${8800 + Math.floor(i / 2)}`, // Duplicates order IDs to show multiple products logic
        vendorId: `VND-${100 + i % 8}`,
        vendorName: `Vendor Company ${1 + i % 8}`,
        vendorPhone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        vendorEmail: `contact${1 + i % 8}@vendorcompany.com`,
        vendorAvatar: `https://ui-avatars.com/api/?name=Company+${1 + i % 8}&background=random`,
        amount: Math.floor(Math.random() * 5000) + 100,
        paymentMethod: paymentMethod,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
        status: status,
        itemCount: Math.floor(Math.random() * 3) + 1
    };
});

const uniqueVendorCompanies = [...new Set(MOCK_DATA.map(i => i.vendorName))].sort();

const VendorInvoices = () => {
    const [allFilteredInvoices, setAllFilteredInvoices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '', vendor: 'All' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyVendorId, setHistoryVendorId] = useState(null);

    const handleViewHistory = (vendorId) => {
        setHistoryVendorId(vendorId);
        setIsHistoryModalOpen(true);
    };

    const fetchInvoices = () => {
        setLoading(true);
        setTimeout(() => {
            let filtered = MOCK_DATA;
            if (filters.search) filtered = filtered.filter(i => 
                i.id.toLowerCase().includes(filters.search.toLowerCase()) || 
                i.orderId.toLowerCase().includes(filters.search.toLowerCase()) || 
                i.vendorName.toLowerCase().includes(filters.search.toLowerCase())
            );
            if (filters.status !== 'All') filtered = filtered.filter(i => i.status === filters.status);
            if (filters.vendor !== 'All') filtered = filtered.filter(i => i.vendorName === filters.vendor);
            if (filters.fromDate) filtered = filtered.filter(i => new Date(i.date) >= new Date(filters.fromDate));
            if (filters.toDate) filtered = filtered.filter(i => new Date(i.date) <= new Date(filters.toDate));
            
            const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
            const end = start + pagination.itemsPerPage;
            
            setAllFilteredInvoices(filtered);
            setInvoices(filtered.slice(start, end));
            setPagination(prev => ({ ...prev, totalRecords: filtered.length }));
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        fetchInvoices();
    }, [pagination.currentPage, pagination.itemsPerPage, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const stats = {
        total: MOCK_DATA.length,
        paid: MOCK_DATA.filter(i => i.status === 'Paid').length,
        pending: MOCK_DATA.filter(i => i.status === 'Pending').length,
        refunded: MOCK_DATA.filter(i => i.status === 'Cancelled').length
    };

    return (
        <div className="management-module">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Vendor Invoices</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage and track vendor payments, platform payouts, and bills.
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {}}
                    style={{ borderRadius: '10px', padding: '10px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}
                >
                    <Plus size={18} /> Generate Invoice
                </button>
            </div>

            <InvoiceStats stats={stats} />

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
                    vendorCompanies={uniqueVendorCompanies}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onSelectAll={(select) => setSelectedIds(select ? allFilteredInvoices.map(i => i.id) : [])}
                    onView={() => {}}
                    onViewHistory={handleViewHistory}
                    onExport={() => {}}
                />
            </div>
            
            {isHistoryModalOpen && (
                <VendorInvoiceHistoryModal 
                    vendorId={historyVendorId} 
                    onClose={() => setIsHistoryModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default VendorInvoices;
