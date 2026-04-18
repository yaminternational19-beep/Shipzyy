import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import CustomerInvoiceList from './components/CustomerInvoiceList';
import InvoiceStats from './components/InvoiceStats';

const CustomerInvoiceHistory = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', month: 'All', year: 'All' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({});

    // Generate Mock Data specific to this customer
    const generateHistoryData = () => {
        return Array.from({ length: 15 }, (_, i) => {
            const isPaid = Math.random() > 0.3;
            const paymentMethod = Math.random() > 0.5 ? 'Credit Card' : 'Cash on Delivery (COD)';
            let status = isPaid ? 'Paid' : 'Pending';

            return {
                id: `INV-C-${8000 + i}`,
                orderId: `ORD-${5000 + i}`,
                customerId: customerId,
                customerName: `Customer ${customerId.split('-')[1] || 'Unknown'}`,
                customerEmail: `customer${customerId.split('-')[1] || '00'}@example.com`,
                customerAvatar: `https://ui-avatars.com/api/?name=Customer+History&background=random`,
                amount: Math.floor(Math.random() * 300) + 15,
                paymentMethod: paymentMethod,
                date: new Date(Date.now() - Math.floor(Math.random() * 20000000000)).toISOString().split('T')[0],
                status: status,
                itemCount: Math.floor(Math.random() * 3) + 1
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const [allHistoryMock] = useState(generateHistoryData());

    useEffect(() => {
        if (allHistoryMock.length > 0) {
            setCustomerInfo({
                name: allHistoryMock[0].customerName,
                email: allHistoryMock[0].customerEmail,
                avatar: allHistoryMock[0].customerAvatar
            });
        }
    }, [allHistoryMock]);

    const fetchInvoices = () => {
        setLoading(true);
        setTimeout(() => {
            let filtered = allHistoryMock;
            
            if (filters.search) filtered = filtered.filter(i => 
                i.id.toLowerCase().includes(filters.search.toLowerCase()) || 
                i.orderId.toLowerCase().includes(filters.search.toLowerCase())
            );
            if (filters.status !== 'All') filtered = filtered.filter(i => i.status === filters.status);
            if (filters.month !== 'All') filtered = filtered.filter(i => i.date.split('-')[1] === filters.month);
            if (filters.year !== 'All') filtered = filtered.filter(i => i.date.split('-')[0] === filters.year);
            
            const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
            const end = start + pagination.itemsPerPage;
            
            setInvoices(filtered.slice(start, end));
            setPagination(prev => ({ ...prev, totalRecords: filtered.length }));
            setLoading(false);
        }, 400);
    };

    useEffect(() => {
        fetchInvoices();
    }, [pagination.currentPage, pagination.itemsPerPage, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const stats = {
        total: allHistoryMock.length,
        paid: allHistoryMock.filter(i => i.status === 'Paid').length,
        pending: allHistoryMock.filter(i => i.status === 'Pending').length,
        overdue: allHistoryMock.filter(i => i.status === 'Cancelled').length
    };

    return (
        <div className="management-module">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <button 
                    onClick={() => navigate('/invoices/customer')}
                    style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Invoice History</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        All historical invoices for <strong style={{ color: '#1e293b' }}>{customerInfo.name || customerId}</strong>
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
                    invoices={invoices}
                    totalCount={pagination.totalRecords}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    onSelectAll={(select) => setSelectedIds(select ? invoices.map(i => i.id) : [])}
                    onView={() => {}}
                    onExport={() => {}}
                />
            </div>
        </div>
    );
};

export default CustomerInvoiceHistory;
