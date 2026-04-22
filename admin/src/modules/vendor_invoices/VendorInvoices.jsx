import React, { useState, useEffect, use } from 'react';
import { Loader2 } from 'lucide-react';
import VendorInvoiceList from './components/VendorInvoiceList';
import InvoiceStats from '../invoices/components/InvoiceStats';
import CustomerOrderHistoryModal from './components/CustomerOrderHistoryModal';
import { getVendorInvoicesApi } from '../../api/vendor_invoices.api';






// Mock Data strictly specific to the currently logged in vendor
const MOCK_DATA = Array.from({ length: 25 }, (_, i) => {
    const isPaid = Math.random() > 0.4;
    const isCancelled = Math.random() > 0.9;
    const paymentMethod = Math.random() > 0.5 ? 'Bank Transfer' : 'Platform Wallet';
    let status = isCancelled ? 'Cancelled' : isPaid ? 'Paid' : 'Pending';

    return {
        id: `INV-V-${2000 + i}`,
        orderId: `ORD-${8800 + Math.floor(i / 2)}`,
        customerId: `CUST-${200 + (i % 12)}`,
        customerName: `Customer ${1 + (i % 12)}`,
        customerPhone: `+91 ${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        customerAvatar: `https://ui-avatars.com/api/?name=Customer+${1 + (i % 12)}&background=random`,
        amount: Math.floor(Math.random() * 5000) + 100,
        paymentMethod: paymentMethod,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
        status: status,
        itemCount: Math.floor(Math.random() * 4) + 1
    };
});


const VendorInvoices = () => {
    const [allFilteredInvoices, setAllFilteredInvoices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [historyModal, setHistoryModal] = useState({ open: false, customer: null });

    const handleViewHistory = (invoice) => {
        setHistoryModal({ open: true, customer: invoice });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                 const res = await getVendorInvoicesApi();
                 const data = res.data; // Assuming API returns { data: [...] }
                 console.log("Fetched invoices:", data);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchInvoices = () => {
        setLoading(true);
        setTimeout(() => {
            let filtered = MOCK_DATA;
            if (filters.search) filtered = filtered.filter(i => 
                i.id.toLowerCase().includes(filters.search.toLowerCase()) || 
                i.orderId.toLowerCase().includes(filters.search.toLowerCase()) ||
                i.customerId.toLowerCase().includes(filters.search.toLowerCase()) ||
                i.customerName.toLowerCase().includes(filters.search.toLowerCase())
            );
            if (filters.status !== 'All') filtered = filtered.filter(i => i.status === filters.status);
            if (filters.fromDate) filtered = filtered.filter(i => new Date(i.date) >= new Date(filters.fromDate));
            if (filters.toDate) filtered = filtered.filter(i => new Date(i.date) <= new Date(filters.toDate));
            
            const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
            const end = start + pagination.itemsPerPage;
            
            setAllFilteredInvoices(filtered);
            setInvoices(filtered.slice(start, end));
            setPagination(prev => ({ ...prev, totalRecords: filtered.length }));
            setLoading(false);
        }, 300);
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
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>My Invoices</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track your completed payouts and generated payout invoices for fulfilled orders.
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
                    invoices={invoices}
                    totalCount={pagination.totalRecords}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onSelectAll={(select) => setSelectedIds(select ? allFilteredInvoices.map(i => i.id) : [])}
                    onView={() => {}}
                    onExport={() => {}}
                    onViewHistory={handleViewHistory}
                />
            </div>

            {historyModal.open && historyModal.customer && (
                <CustomerOrderHistoryModal
                    customerId={historyModal.customer.customerId}
                    customerName={historyModal.customer.customerName}
                    customerPhone={historyModal.customer.customerPhone}
                    customerAvatar={historyModal.customer.customerAvatar}
                    allInvoices={MOCK_DATA}
                    onClose={() => setHistoryModal({ open: false, customer: null })}
                />
            )}
        </div>
    );
};

export default VendorInvoices;
