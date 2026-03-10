import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const CommonDashboard = ({ title }) => (
    <div className="dashboard-content">
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'var(--primary-color)10', color: 'var(--primary-color)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '24px'
            }}>
                <LayoutDashboard size={40} />
            </div>
            <h2>{title} Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome to your workspace. Module specific metrics will appear here.</p>
        </div>
    </div>
);

export default CommonDashboard;
