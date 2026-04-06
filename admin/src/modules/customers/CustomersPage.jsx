import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import CustomerStats from './components/CustomerStats';
import CustomerList from './components/CustomerList';
import CustomerProfileModal from './components/CustomerProfileModal';
import Toast from '../../components/common/Toast/Toast';
import './Customers.css';
import { getAllCustomersApi } from '../../api/customers.api';

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
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        suspended: 0,
        terminated: 0
    });

    const [filters, setFilters] = useState({
        search: '',
        status: 'All',
        country: 'All',
        state: 'All',
        city: 'All'
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalRecords: 0
    });

    const [viewingCustomer, setViewingCustomer] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage,
                search: filters.search || undefined,
                status: filters.status !== 'All' ? filters.status.toLowerCase() : undefined,
                country: filters.country !== 'All' ? filters.country : undefined,
                state: filters.state !== 'All' ? filters.state : undefined,
            };

            const res = await getAllCustomersApi(params);
            const result = res.data;
            
            if (result.success) {
                setCustomers(result.data.records || []);
                setStats(result.data.stats || {
                    total: 0,
                    active: 0,
                    suspended: 0,
                    terminated: 0
                });
                setPagination(prev => ({
                    ...prev,
                    totalRecords: result.data.pagination?.totalRecords || 0
                }));
            }
        } catch (error) {
            console.error("API Error:", error);
            showToast(error.response?.data?.message || error.message || 'Failed to fetch customers', 'error');
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.itemsPerPage, filters]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handleTerminate = (id) => {
        // API call would go here
        showToast(`Termination functionality coming soon.`, 'error');
    };

    const handleBlock = (id) => {
        // API call would go here
        showToast(`Block functionality coming soon.`, 'warning');
    };

    const handleActivate = (id) => {
        // API call would go here
        showToast(`Activation functionality coming soon.`, 'success');
    };

    const handleView = (customer) => {
        setViewingCustomer(customer);
        setIsViewModalOpen(true);
    };

    const handleSelectAll = async (checked) => {
        if (!checked) {
            setSelectedCustomerIds([]);
            return;
        }

        try {
            setLoading(true);
            const params = {
                limit: pagination.totalRecords,
                search: filters.search || undefined,
                status: filters.status !== 'All' ? filters.status.toLowerCase() : undefined,
                country: filters.country !== 'All' ? filters.country : undefined,
                state: filters.state !== 'All' ? filters.state : undefined,
            };

            const res = await getAllCustomersApi(params);
            if (res.data.success) {
                const allIds = (res.data.data.records || []).map(c => c.id);
                setSelectedCustomerIds(allIds);
            }
        } catch (error) {
            console.error("Select All Error:", error);
            showToast('Failed to select all customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Adapt stats for the CustomerStats component
    const adaptedStats = {
        total: stats.total,
        active: stats.active,
        new: 3, // Mocked for now as per design
        inactive: parseInt(stats.suspended) + parseInt(stats.terminated)
    };

    return (
        <div className="customers-module management-module">
            <div className="customers-header">
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>Customer Management</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                        Manage your user base, track orders and handle account statuses
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => showToast('Customer onboarding coming soon!', 'info')}
                    style={{ borderRadius: '10px', padding: '10px 20px' }}
                >
                    <UserPlus size={18} /> Add New Customer
                </button>
            </div>

            <CustomerStats stats={adaptedStats} />

            <div style={{ marginTop: '24px', position: 'relative' }}>
                {loading && (
                    <div className="table-loader-overlay">
                        <Loader2 className="animate-spin" size={40} color="var(--primary-color)" />
                    </div>
                )}
                
                <CustomerList
                    customers={customers}
                    totalCount={pagination.totalRecords}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    locationData={LOCATION_DATA}
                    selectedCustomerIds={selectedCustomerIds}
                    setSelectedCustomerIds={setSelectedCustomerIds}
                    onSelectAll={handleSelectAll}
                    onView={handleView}
                    onEdit={(c) => showToast(`Editing ${c.name || 'Customer'}`, 'info')}
                    onBlock={handleBlock}
                    onActivate={handleActivate}
                    onTerminate={handleTerminate}
                    showToast={showToast}
                    isLoading={loading}
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
