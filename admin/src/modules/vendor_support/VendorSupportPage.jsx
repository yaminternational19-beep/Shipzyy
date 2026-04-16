import React, { useState } from 'react';
import Toast from '../../components/common/Toast/Toast';
import RaiseQueryForm from './components/RaiseQueryForm';
import QueryList from './components/QueryList';
import FAQSection from './components/FAQSection';

import VendorSupportTabs from './components/VendorSupportTabs';
import './VendorSupport.css';

const VendorSupportPage = ({ activeTab }) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [queries, setQueries] = useState([]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const handleAddQuery = (newQuery) => {
        setQueries([newQuery, ...queries]);
        showToast('Your query has been raised successfully!');
    };

    const getTabContent = () => {
        switch (activeTab) {
            case 'raise-query':
                return {
                    title: 'Raise New Query',
                    desc: 'Submit a new ticket to our support team',
                    component: <RaiseQueryForm onAddQuery={handleAddQuery} />
                };
            case 'history':
                return {
                    title: 'Ticket History',
                    desc: 'Track and view your previous support requests',
                    component: <QueryList queries={queries} />
                };
            case 'faq':
                return {
                    title: 'Common FAQs',
                    desc: 'Quick answers to frequently asked questions',
                    component: <FAQSection />
                };
            default:
                return {
                    title: 'Support Center',
                    desc: 'Need assistance? Reach out to us or check FAQs',
                    component: (
                        <div className="vendor-support-section">
                             <h2 style={{ marginBottom: '16px' }}>Welcome to Support</h2>
                             <p style={{ color: '#64748b' }}>Select a category from the sidebar to get started.</p>
                        </div>
                    )
                };
        }
    };

    const currentTab = getTabContent();

    return (
        <div className="vendor-support-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div className="module-intro">
                <div className="intro-content">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{currentTab.title}</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>{currentTab.desc}</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <VendorSupportTabs activeTab={activeTab} />
            </div>

            <div className="vendor-support-content">
                {currentTab.component}
            </div>
        </div>
    );
};


export default VendorSupportPage;
