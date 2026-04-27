import React, { useState, useEffect } from 'react';
import { Ticket, Users, Bike, Truck } from 'lucide-react';
import Toast from '../../components/common/Toast/Toast';
import AllTickets from './components/AllTickets';
import CustomerTickets from './components/CustomerTickets';
import RiderTickets from './components/RiderTickets';
import VendorTickets from './components/VendorTickets';
import './Tickets.css';

import { getTicketsApi, replyToTicketApi } from '../../api/admin_tickets.api';




const TicketsPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };


    return (
        <div className="tickets-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div className="module-intro">
                <div className="intro-content">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Support Tickets</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>Manage support requests across all users and vendors</p>
                </div>
            </div>

            <div className="tab-group-pills">
                <button
                    className={activeTab === 'all' ? 'active' : ''}
                    onClick={() => setActiveTab('all')}
                >
                    <Ticket size={14} />
                    All Tickets
                </button>
                <button
                    className={activeTab === 'customer' ? 'active' : ''}
                    onClick={() => setActiveTab('customer')}
                >
                    <Users size={14} />
                    Customers
                </button>
                {/* <button
                    className={activeTab === 'rider' ? 'active' : ''}
                    onClick={() => setActiveTab('rider')}
                >
                    <Bike size={14} />
                    Riders
                </button> */}
                <button
                    className={activeTab === 'vendor' ? 'active' : ''}
                    onClick={() => setActiveTab('vendor')}
                >
                    <Truck size={14} />
                    Vendors
                </button>
            </div>

            {activeTab === 'all' && <AllTickets onShowToast={showToast} />}
            {activeTab === 'customer' && <CustomerTickets onShowToast={showToast} />}
            {activeTab === 'rider' && <RiderTickets onShowToast={showToast} />}
            {activeTab === 'vendor' && <VendorTickets onShowToast={showToast} />}
        </div>
    );
};

export default TicketsPage;
