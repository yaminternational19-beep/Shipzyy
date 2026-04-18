import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import CustomerInvoiceList from './components/CustomerInvoiceList';
import InvoiceStats from './components/InvoiceStats';
import CustomerInvoiceHistoryModal from './components/CustomerInvoiceHistoryModal';

// Mock Data
const MOCK_DATA = Array.from({ length: 45 }, (_, i) => {
    const isPaid = Math.random() > 0.4;
    const isCancelled = Math.random() > 0.9;
    const paymentMethod = Math.random() > 0.5 ? 'Credit Card' : 'Cash on Delivery (COD)';
    let status = isCancelled ? 'Cancelled' : isPaid ? 'Paid' : 'Pending';

    return {
        id: `INV-C-${2000 + i}`,
        orderId: `ORD-${8800 + i}`,
        customerId: `CUST-${100 + i % 10}`,
        customerName: `Customer ${1 + i % 10}`,
        customerEmail: `customer${1 + i % 10}@example.com`,
        customerPhone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
        customerAvatar: `https://ui-avatars.com/api/?name=Customer+${1 + i % 10}&background=random`,
        amount: Math.floor(Math.random() * 500) + 20,
        paymentMethod: paymentMethod,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
        status: status,
        itemCount: Math.floor(Math.random() * 5) + 1
    };
});

const CustomerInvoices = () => {
    const [allFilteredInvoices, setAllFilteredInvoices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [historyCustomerId, setHistoryCustomerId] = useState(null);

    const handleViewHistory = (customerId) => {
        setHistoryCustomerId(customerId);
        setIsHistoryModalOpen(true);
    };

    const fetchInvoices = () => {
        setLoading(true);
        setTimeout(() => {
            let filtered = MOCK_DATA;
            if (filters.search) filtered = filtered.filter(i => 
                i.id.toLowerCase().includes(filters.search.toLowerCase()) || 
                i.orderId.toLowerCase().includes(filters.search.toLowerCase()) || 
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
        overdue: MOCK_DATA.filter(i => i.status === 'Cancelled').length // Reusing overdue stats box for cancelled
    };

    return (
        <div className="management-module">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Customer Invoices</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage and track customer payments and billing
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
                
                <CustomerInvoiceList
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
                    onViewHistory={handleViewHistory}
                />
            </div>

            {isHistoryModalOpen && (
                <CustomerInvoiceHistoryModal 
                    customerId={historyCustomerId} 
                    onClose={() => setIsHistoryModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default CustomerInvoices;
