import React from 'react';
import { Users, UserCheck, UserPlus, Shield } from 'lucide-react';

const SubAdminStats = ({ stats }) => {
    const statsData = [
        { label: 'Total Sub-Admins', value: stats?.total || '0', icon: Users, color: '#4f46e5', bg: '#eef2ff' },
        { label: 'Active Now', value: stats?.active || '0', icon: UserCheck, color: '#10b981', bg: '#ecfdf5' },
        { label: 'Inactive Admins', value: stats?.inactive || '0', icon: UserPlus, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Roles Defined', value: stats?.rolesDefined || '0', icon: Shield, color: '#6366f1', bg: '#f5f3ff' },
    ];

    return (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {statsData.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className="stat-card" style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: stat.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color
                        }}>
                            <Icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{stat.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{stat.value}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SubAdminStats;
