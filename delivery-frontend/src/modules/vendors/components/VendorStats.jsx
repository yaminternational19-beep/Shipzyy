import React from 'react';
import { Users, TrendingUp, FileText, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const VendorStats = () => {
    const stats = [
        {
            title: 'Total Vendors',
            value: '142',
            trend: '+12%',
            icon: Users,
            color: '#6366f1',
            subText: '24 new this month'
        },
        {
            title: 'Avg. Turnover',
            value: '$12.4k',
            trend: '+8.2%',
            icon: TrendingUp,
            color: '#10b981',
            subText: 'Per vendor / month'
        },
        {
            title: 'Pending Apps',
            value: '18',
            trend: '-2',
            icon: FileText,
            color: '#f59e0b',
            subText: 'Awaiting approval'
        },
        {
            title: 'KYC Verified',
            value: '94%',
            trend: '+5%',
            icon: ShieldCheck,
            color: '#06b6d4',
            subText: 'System health'
        }
    ];

    return (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <div key={idx} className="stat-card" style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px'
                    }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '14px',
                            background: `${stat.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stat.color
                        }}>
                            <Icon size={28} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>{stat.title}</span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: stat.trend.startsWith('+') ? '#ecfdf5' : '#fef2f2',
                                    padding: '2px 6px',
                                    borderRadius: '6px'
                                }}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b', marginTop: '4px' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{stat.subText}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default VendorStats;
