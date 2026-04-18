import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import VendorInvoiceList from './VendorInvoiceList';
import InvoiceStats from './InvoiceStats';

const VendorInvoiceHistoryModal = ({ vendorId, onClose }) => {
    const [allFilteredInvoices, setAllFilteredInvoices] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', status: 'All', fromDate: '', toDate: '' });
    const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 5, totalRecords: 0 });
    const [selectedIds, setSelectedIds] = useState([]);
    const [vendorInfo, setVendorInfo] = useState({});

    const generateHistoryData = () => {
        return Array.from({ length: 15 }, (_, i) => {
            const isPaid = Math.random() > 0.3;
            const paymentMethod = Math.random() > 0.5 ? 'Bank Transfer' : 'Platform Wallet';
            let status = isPaid ? 'Paid' : 'Pending';

            return {
                id: `INV-V-${8000 + i}`,
                orderId: `ORD-${5000 + Math.floor(i / 2)}`, // Multiple invoices sharing one orderID per vendor constraint
                vendorId: vendorId,
                vendorName: `Vendor Company ${vendorId?.split('-')[1] || 'Unknown'}`,
                vendorPhone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
                vendorEmail: `contact${vendorId?.split('-')[1] || 'Unknown'}@vendorcompany.com`,
                vendorAvatar: `https://ui-avatars.com/api/?name=Company+History&background=random`,
                amount: Math.floor(Math.random() * 3000) + 150,
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
            setVendorInfo({
                name: allHistoryMock[0].vendorName,
                avatar: allHistoryMock[0].vendorAvatar
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
            if (filters.fromDate) filtered = filtered.filter(i => new Date(i.date) >= new Date(filters.fromDate));
            if (filters.toDate) filtered = filtered.filter(i => new Date(i.date) <= new Date(filters.toDate));
            
            const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
            const end = start + pagination.itemsPerPage;
            
            setAllFilteredInvoices(filtered);
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
        refunded: allHistoryMock.filter(i => i.status === 'Cancelled').length
    };

    return (
        <div className="modal-overlay">
            <div className="customer-view-modal" style={{ width: '90%', maxWidth: '1400px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src={vendorInfo.avatar} alt="Profile" style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>{vendorInfo.name || 'Anonymous Vendor'}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                <span className="cust-id-badge" style={{ margin: 0, background: '#fff7ed', color: '#ea580c', borderColor: '#ffedd5' }}>{vendorId}</span>
                                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Invoice History Overview</span>
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
                            isModal={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorInvoiceHistoryModal;
