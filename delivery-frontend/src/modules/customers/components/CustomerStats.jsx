import React from 'react';
import { Users, UserPlus, UserCheck, UserX, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CustomerStats = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Customers',
            value: stats.total,
            trend: '+5%',
            icon: Users,
            color: '#6366f1',
            subText: 'Overall user base'
        },
        {
            title: 'Active Members',
            value: stats.active,
            trend: '+12%',
            icon: UserCheck,
            color: '#10b981',
            subText: 'Verified accounts'
        },
        {
            title: 'New Onboarded',
            value: stats.new,
            trend: '+2',
            icon: UserPlus,
            color: '#f59e0b',
            subText: 'Last 7 days'
        },
        {
            title: 'Requires Attention',
            value: stats.inactive,
            trend: '-1',
            icon: UserX,
            color: '#ef4444',
            subText: 'Blocked/Inactive'
        }
    ];

    return (
        <div className="customer-stats-panel">
            {statCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="stat-cust-card">
                        <div className="stat-cust-icon" style={{ background: `${card.color}15`, color: card.color }}>
                            <Icon size={24} />
                        </div>
                        <div className="stat-cust-info">
                            <p>{card.title}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3>{card.value}</h3>
                                {card.trend && (
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        color: card.trend.startsWith('+') ? '#10b981' : '#ef4444',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        {card.trend}
                                        {card.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    </span>
                                )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{card.subText}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CustomerStats;
