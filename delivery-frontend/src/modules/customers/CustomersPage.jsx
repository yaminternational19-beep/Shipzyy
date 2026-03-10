import React, { useState, useMemo } from 'react';
import { UserPlus } from 'lucide-react';
import CustomerStats from './components/CustomerStats';
import CustomerList from './components/CustomerList';
import CustomerProfileModal from './components/CustomerProfileModal';
import Toast from '../../components/common/Toast/Toast';
import './Customers.css';

const LOCATION_DATA = {
    "India": {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Delhi": ["New Delhi", "North Delhi"],
        "Karnataka": ["Bangalore", "Mysore"]
    },
    "UK": {
        "London": ["Central London", "Westminster"],
        "Manchester": ["Old Trafford", "City Centre"]
    },
    "USA": {
        "California": ["Los Angeles", "San Francisco"],
        "New York": ["New York City", "Buffalo"]
    }
};

const CustomersPage = () => {
    const [customers, setCustomers] = useState([
        { id: 'CUST-3001', name: 'Alice Johnson', email: 'alice@example.com', phone: '+91 98765 43210', totalOrders: 15, joined: '12 Oct 2025', country: 'India', state: 'Maharashtra', city: 'Mumbai', status: 'Active' },
        { id: 'CUST-3002', name: 'Bob Smith', email: 'bob@example.com', phone: '+91 88765 43210', totalOrders: 4, joined: '05 Jan 2026', country: 'USA', state: 'California', city: 'Los Angeles', status: 'Active' },
        { id: 'CUST-3003', name: 'Charlie Brown', email: 'charlie@example.com', phone: '+91 78765 43210', totalOrders: 0, joined: '10 Feb 2026', country: 'UK', state: 'London', city: 'Central London', status: 'Inactive' },
        { id: 'CUST-3004', name: 'David Lee', email: 'david.l@example.com', phone: '+91 68765 43210', totalOrders: 28, joined: '20 Nov 2025', country: 'USA', state: 'New York', city: 'New York City', status: 'Active' },
        { id: 'CUST-3005', name: 'Emma Watson', email: 'emma.w@example.com', phone: '+91 58765 43210', totalOrders: 12, joined: '15 Dec 2025', country: 'UK', state: 'Manchester', city: 'Old Trafford', status: 'Active' },
        { id: 'CUST-3006', name: 'Frank Miller', email: 'frank@example.com', phone: '+92 34567 11223', totalOrders: 3, joined: '01 Feb 2026', country: 'USA', state: 'California', city: 'San Francisco', status: 'Blocked' },
        { id: 'CUST-3007', name: 'Grace Hopper', email: 'grace@example.com', phone: '+91 91234 55667', totalOrders: 42, joined: '10 Aug 2025', country: 'India', state: 'Karnataka', city: 'Bangalore', status: 'Active' },
        { id: 'CUST-3008', name: 'Henry Ford', email: 'henry@example.com', phone: '+91 82233 44556', totalOrders: 1, joined: '20 Jan 2026', country: 'India', state: 'Maharashtra', city: 'Pune', status: 'Active' },
    ]);

    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        country: 'All',
        state: 'All',
        city: 'All'
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 5
    });

    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleTerminate = (id) => {
        setCustomers(customers.map(c => c.id === id ? { ...c, status: 'Terminated' } : c));
        showToast(`Customer ${id} has been terminated.`, 'error');
    };

    const handleBlock = (id) => {
        setCustomers(customers.map(c => c.id === id ? { ...c, status: 'Blocked' } : c));
        showToast(`Customer ${id} has been blocked.`, 'warning');
    };

    const handleActivate = (id) => {
        setCustomers(customers.map(c => c.id === id ? { ...c, status: 'Active' } : c));
        showToast(`Customer ${id} has been activated successfully.`, 'success');
    };

    const handleView = (customer) => {
        setViewingCustomer(customer);
        setIsViewModalOpen(true);
    };

    const filteredCustomers = useMemo(() => {
        return customers.filter(c => {
            const matchesSearch = !filters.search ||
                c.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.email.toLowerCase().includes(filters.search.toLowerCase());

            const matchesStatus = filters.status === 'All' || c.status === filters.status;
            const matchesCountry = filters.country === 'All' || c.country === filters.country;
            const matchesState = filters.state === 'All' || c.state === filters.state;
            const matchesCity = filters.city === 'All' || c.city === filters.city;

            return matchesSearch && matchesStatus && matchesCountry && matchesState && matchesCity;
        });
    }, [customers, filters]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        return filteredCustomers.slice(startIndex, startIndex + pagination.itemsPerPage);
    }, [filteredCustomers, pagination]);

    const stats = {
        total: customers.length,
        active: customers.filter(c => c.status === 'Active').length,
        new: 3,
        inactive: customers.filter(c => c.status !== 'Active').length
    };

    return (
        <div className="customers-module management-module">
            <div className="customers-header">
                <div>
                    <h1>Customer Management</h1>
                    <p>Manage your user base, track orders and handle account statuses</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => showToast('Customer onboarding coming soon!', 'info')}
                >
                    <UserPlus size={18} /> Add New Customer
                </button>
            </div>

            <CustomerStats stats={stats} />

            <div style={{ marginTop: '24px' }}>
                <CustomerList
                    customers={paginatedCustomers}
                    totalCount={filteredCustomers.length}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    locationData={LOCATION_DATA}
                    selectedCustomerIds={selectedCustomerIds}
                    setSelectedCustomerIds={setSelectedCustomerIds}
                    onView={handleView}
                    onEdit={(c) => showToast(`Editing ${c.name}`, 'info')}
                    onBlock={handleBlock}
                    onActivate={handleActivate}
                    onTerminate={handleTerminate}
                    showToast={showToast}
                />
            </div>

            {isViewModalOpen && (
                <CustomerProfileModal
                    customer={viewingCustomer}
                    onClose={() => setIsViewModalOpen(false)}
                    onTerminate={handleTerminate}
                    onBlock={handleBlock}
                    onActivate={handleActivate}
                />
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default CustomersPage;
