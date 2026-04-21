import React, { useState } from 'react';
import Toast from '../../components/common/Toast/Toast';
import AboutUs from './components/AboutUs';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import PlatformLinks from './components/PlatformLinks';
import VendorAnnouncements from './components/VendorAnnouncements';
import './VendorSettings.css';

const VendorSettingsPage = ({ type }) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const getPageContent = () => {
        switch (type) {
            case 'about-us':
                return {
                    title: 'About shipzyy',
                    desc: 'Learn more about our mission and values',
                    component: <AboutUs showToast={showToast} />
                };
            case 'terms':
                return {
                    title: 'Terms & Conditions',
                    desc: 'Review the legal agreement for using our platform',
                    component: <TermsAndConditions showToast={showToast} />
                };
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    desc: 'How we handle and protect your data',
                    component: <PrivacyPolicy showToast={showToast} />
                };
            case 'platform-links':
                return {
                    title: 'App & Website Links',
                    desc: 'Quick access to our Android app and website platform',
                    component: <PlatformLinks showToast={showToast} />
                };
            case 'announcements':
                return {
                    title: 'System Announcements',
                    desc: 'Stay updated with the latest news and platform changes',
                    component: <VendorAnnouncements showToast={showToast} />
                };
            default:
                return {
                    title: 'Vendor Settings',
                    desc: 'Manage your store information and legal docs',
                    component: (
                        <div className="empty-settings-state">
                             <h2 style={{ marginBottom: '16px' }}>Vendor Settings</h2>
                             <p style={{ color: '#64748b' }}>Select a category from the sidebar to view details.</p>
                        </div>
                    )
                };
        }
    };

    const currentPage = getPageContent();

    return (
        <div className="vendor-settings-module management-module" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            <div className="module-intro">
                <div className="intro-content">
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{currentPage.title}</h1>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>{currentPage.desc}</p>
                </div>
            </div>

            <div className="vendor-settings-content">
                {currentPage.component}
            </div>
        </div>
    );
};

export default VendorSettingsPage;
