import React from 'react';
import { Scale, CheckCircle, Clock, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const QuantityStats = () => {
    const stats = [
        {
            title: 'Total Units',
            value: '7',
            trend: '+1',
            icon: Scale,
            color: '#6366f1',
            subText: 'Measurement systems'
        },
        {
            title: 'Active Units',
            value: '6',
            trend: '+2',
            icon: CheckCircle,
            color: '#10b981',
            subText: 'Currently available'
        },
        {
            title: 'Categories',
            value: '6',
            trend: 'Stable',
            icon: Package,
            color: '#f59e0b',
            subText: 'Using units'
        },
        {
            title: 'Recent Additions',
            value: '2',
            trend: 'New',
            icon: Clock,
            color: '#06b6d4',
            subText: 'Last 7 days'
        }
    ];

    return (
        <div className="quantity-stats-panel">
            {stats.map((stat, i) => (
                <div key={i} className="stat-q-card">
                    <div className="stat-q-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <stat.icon size={24} />
                    </div>
                    <div className="stat-q-info">
                        <p>{stat.title}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h3>{stat.value}</h3>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: stat.trend.startsWith('+') ? '#10b981' : (stat.trend === 'Stable' ? '#64748b' : '#06b6d4'),
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {stat.trend}
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : null}
                            </span>
                        </div>
                        <p>{stat.subText}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuantityStats;
