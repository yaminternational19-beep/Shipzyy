import React from 'react';
import { Layers, CheckCircle, Star, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CategoryStats = ({ statsData }) => {
    const stats = [
        {
            title: 'Total Categories',
            value: statsData?.total || '0',
            trend: '+',
            icon: Layers,
            color: '#6366f1',
            subText: 'Across the system'
        },
        {
            title: 'Active / Live',
            value: statsData?.active || '0',
            trend: '+',
            icon: CheckCircle,
            color: '#10b981',
            subText: 'Enabled items'
        },
        {
            title: 'Inactive',
            value: statsData?.inactive || '0',
            trend: '-',
            icon: Package,
            color: '#ef4444',
            subText: 'Currently disabled'
        },
        {
            title: 'Sub-Categories',
            value: statsData?.totalSubCategories || '0',
            trend: '+',
            icon: Package,
            color: '#06b6d4',
            subText: 'Child categories'
        }
    ];

    return (
        <div className="category-stats-panel">
            {stats.map((stat, i) => (
                <div key={i} className="stat-c-card">
                    <div className="stat-c-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <stat.icon size={24} />
                    </div>
                    <div className="stat-c-info">
                        <p>{stat.title}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h3>{stat.value}</h3>
                        </div>
                        <p>{stat.subText}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryStats;
