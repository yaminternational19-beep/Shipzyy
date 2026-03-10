import React from 'react';
import { Truck, ShieldCheck, Clock, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const RiderStats = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Riders',
            value: stats.total,
            trend: '+4%',
            icon: Truck,
            color: '#6366f1',
            desc: 'Registered fleet'
        },
        {
            title: 'Verified Riders',
            value: stats.verified,
            trend: '+12%',
            icon: ShieldCheck,
            color: '#10b981',
            desc: 'KYC approved'
        },
        {
            title: 'Pending KYC',
            value: stats.pending,
            trend: '+2',
            icon: Clock,
            color: '#f59e0b',
            desc: 'In review'
        },
        {
            title: 'Rejected/Issues',
            value: stats.rejected,
            trend: '-1',
            icon: AlertCircle,
            color: '#ef4444',
            desc: 'Action required'
        }
    ];

    return (
        <div className="rider-stats-panel">
            {statCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="stat-rider-card">
                        <div className="stat-rider-icon" style={{ background: `${card.color}15`, color: card.color }}>
                            <Icon size={24} />
                        </div>
                        <div className="stat-rider-info">
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
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>{card.desc}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default RiderStats;
