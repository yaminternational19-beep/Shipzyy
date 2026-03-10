import React from 'react';
import { Award, CheckCircle, TrendingUp, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const BrandStats = () => {
    const stats = [
        {
            title: 'Total Brands',
            value: '42',
            trend: '+8',
            icon: Award,
            color: '#8b5cf6',
            subText: 'Across all core categories'
        },
        {
            title: 'Active Brands',
            value: '38',
            trend: '+3',
            icon: CheckCircle,
            color: '#10b981',
            subText: 'Currently live on site'
        },
        {
            title: 'Top Brand',
            value: 'Apple',
            trend: '+18%',
            icon: TrendingUp,
            color: '#f59e0b',
            subText: 'Highest month-on-month sales'
        },
        {
            title: 'Products per Brand',
            value: '124',
            trend: '+12',
            icon: Package,
            color: '#06b6d4',
            subText: 'Average product count'
        }
    ];

    return (
        <div className="brand-stats-panel">
            {stats.map((stat, i) => (
                <div key={i} className="stat-brand-card">
                    <div className="stat-brand-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <stat.icon size={24} />
                    </div>
                    <div className="stat-brand-info">
                        <p>{stat.title}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h3>{stat.value}</h3>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: stat.trend.startsWith('+') ? '#10b981' : '#ef4444',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                {stat.trend}
                                {stat.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            </span>
                        </div>
                        <p>{stat.subText}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BrandStats;
