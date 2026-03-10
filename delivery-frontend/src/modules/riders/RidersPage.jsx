import React, { useState, useMemo } from 'react';
import RiderStats from './components/RiderStats';
import RiderList from './components/RiderList';
import RiderKYC from './components/RiderKYC';
import RiderProfileModal from './components/RiderProfileModal';
import Toast from '../../components/common/Toast/Toast';
import './Riders.css';

const LOCATION_DATA = {
    "India": {
        "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
        "Delhi": ["New Delhi", "North Delhi"],
        "Karnataka": ["Bangalore", "Mysore"]
    },
    "USA": {
        "California": ["Los Angeles", "San Francisco"],
        "New York": ["New York City", "Buffalo"]
    }
};

const RidersPage = () => {
    const [riders, setRiders] = useState([
        { id: 'RID-1001', name: 'Alex Thompson', email: 'alex.t@delivery.com', phone: '+91 98765 43210', country: 'India', state: 'Maharashtra', city: 'Mumbai', joinedDate: '12 Feb 2026', kycStatus: 'Pending', vehicle: 'Electric Scooty', vehicleNumber: 'MH-01-AB-1234', riderStatus: 'Active' },
        { id: 'RID-1002', name: 'Suresh Raina', email: 'suresh.r@delivery.com', phone: '+91 88765 43210', country: 'India', state: 'Delhi', city: 'New Delhi', joinedDate: '10 Feb 2026', kycStatus: 'Verified', vehicle: 'Royal Enfield', vehicleNumber: 'DL-3C-DE-5678', riderStatus: 'Active' },
        { id: 'RID-1003', name: 'Mark Wood', email: 'mark.w@delivery.com', phone: '+91 78765 43210', country: 'USA', state: 'New York', city: 'New York City', joinedDate: '08 Feb 2026', kycStatus: 'Pending', vehicle: 'Splendor Plus', vehicleNumber: 'NY-88-FK-9900', riderStatus: 'Inactive' },
        { id: 'RID-1004', name: 'James Anderson', email: 'james.a@delivery.com', phone: '+91 68765 43210', country: 'USA', state: 'California', city: 'Los Angeles', joinedDate: '05 Feb 2026', kycStatus: 'Rejected', vehicle: 'TVS Apache', vehicleNumber: 'CA-22-LK-1122', riderStatus: 'Active' },
        { id: 'RID-1005', name: 'Rohit Sharma', email: 'rohit.s@delivery.com', phone: '+91 58765 43210', country: 'India', state: 'Maharashtra', city: 'Mumbai', joinedDate: '01 Feb 2026', kycStatus: 'Verified', vehicle: 'Activa 6G', vehicleNumber: 'MH-02-XY-4321', riderStatus: 'Active' },
        { id: 'RID-1006', name: 'Virat Kohli', email: 'virat.k@delivery.com', phone: '+91 48765 43210', country: 'India', state: 'Delhi', city: 'New Delhi', joinedDate: '15 Feb 2026', kycStatus: 'Verified', vehicle: 'BMW Bike', vehicleNumber: 'DL-4C-VK-1818', riderStatus: 'Active' },
        { id: 'RID-1007', name: 'KL Rahul', email: 'kl.rahul@delivery.com', phone: '+91 38765 43210', country: 'India', state: 'Karnataka', city: 'Bangalore', joinedDate: '14 Feb 2026', kycStatus: 'Pending', vehicle: 'Pulsar 220', vehicleNumber: 'KA-01-KL-0001', riderStatus: 'Active' },
        { id: 'RID-1008', name: 'Hardik Pandya', email: 'hardik.p@delivery.com', phone: '+91 28765 43210', country: 'India', state: 'Maharashtra', city: 'Mumbai', joinedDate: '13 Feb 2026', kycStatus: 'Verified', vehicle: 'Hayabusa', vehicleNumber: 'MH-04-HP-3333', riderStatus: 'Active' },
    ]);

    const [filters, setFilters] = useState({
        search: '',
        kycStatus: 'All',
        country: 'All',
        state: 'All',
        city: 'All'
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 5
    });

    const [selectedRider, setSelectedRider] = useState(null);
    const [viewingRider, setViewingRider] = useState(null);
    const [isKycModalOpen, setIsKycModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedRiderIds, setSelectedRiderIds] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleVerify = (rider) => {
        setSelectedRider(rider);
        setIsKycModalOpen(true);
    };

    const handleApprove = (rider) => {
        setRiders(riders.map(r => r.id === rider.id ? { ...r, kycStatus: 'Verified' } : r));
        setIsKycModalOpen(false);
        showToast(`Rider ${rider.name} verified successfully!`, 'success');
    };

    const handleReject = (rider, reason) => {
        setRiders(riders.map(r => r.id === rider.id ? { ...r, kycStatus: 'Rejected' } : r));
        setIsKycModalOpen(false);
        showToast(`KYC rejected for ${rider.name}.`, 'error');
    };

    const handleTerminate = (id) => {
        setRiders(riders.map(r => r.id === id ? { ...r, riderStatus: 'Terminated' } : r));
        showToast(`Rider terminated.`, 'error');
    };

    const handleToggleStatus = (id) => {
        setRiders(riders.map(r => {
            if (r.id === id) {
                const newStatus = r.riderStatus === 'Active' ? 'Inactive' : 'Active';
                showToast(`Rider is now ${newStatus}`, 'info');
                return { ...r, riderStatus: newStatus };
            }
            return r;
        }));
    };

    const handleView = (rider) => {
        setViewingRider(rider);
        setIsViewModalOpen(true);
    };

    const filteredRiders = useMemo(() => {
        return riders.filter(rider => {
            const matchesSearch = !filters.search ||
                rider.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                rider.id.toLowerCase().includes(filters.search.toLowerCase());

            const matchesKyc = filters.kycStatus === 'All' || rider.kycStatus === filters.kycStatus;
            const matchesCountry = filters.country === 'All' || rider.country === filters.country;
            const matchesState = filters.state === 'All' || rider.state === filters.state;
            const matchesCity = filters.city === 'All' || rider.city === filters.city;

            return matchesSearch && matchesKyc && matchesCountry && matchesState && matchesCity;
        });
    }, [riders, filters]);

    const paginatedRiders = useMemo(() => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
        return filteredRiders.slice(startIndex, startIndex + pagination.itemsPerPage);
    }, [filteredRiders, pagination]);

    const stats = {
        total: riders.length,
        verified: riders.filter(r => r.kycStatus === 'Verified').length,
        pending: riders.filter(r => r.kycStatus === 'Pending').length,
        rejected: riders.filter(r => r.kycStatus === 'Rejected').length
    };

    return (
        <div className="riders-module management-module">
            <header className="riders-header">
                <div>
                    <h1>Rider Management</h1>
                    <p>Onboard delivery heroes and verify KYC documents</p>
                </div>
            </header>

            <RiderStats stats={stats} />

            <div style={{ marginTop: '24px' }}>
                <RiderList
                    riders={paginatedRiders}
                    totalCount={filteredRiders.length}
                    filters={filters}
                    setFilters={handleFilterChange}
                    pagination={pagination}
                    setPagination={setPagination}
                    locationData={LOCATION_DATA}
                    selectedRiderIds={selectedRiderIds}
                    setSelectedRiderIds={setSelectedRiderIds}
                    onVerify={handleVerify}
                    onView={handleView}
                    onTerminate={handleTerminate}
                    onActivate={handleToggleStatus}
                    showToast={showToast}
                />
            </div>

            {isKycModalOpen && (
                <RiderKYC
                    rider={selectedRider}
                    onClose={() => setIsKycModalOpen(false)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                />
            )}

            {isViewModalOpen && (
                <RiderProfileModal
                    rider={viewingRider}
                    onClose={() => setIsViewModalOpen(false)}
                    onTerminate={handleTerminate}
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

export default RidersPage;
