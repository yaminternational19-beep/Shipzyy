import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const userRole = localStorage.getItem('userRole') || 'SUPER_ADMIN';
    const isVendor = userRole.startsWith('VENDOR');

    return (
        <div className={`app-container ${isVendor ? 'vendor-theme' : ''}`}>
            <Sidebar />
            <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Navbar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
