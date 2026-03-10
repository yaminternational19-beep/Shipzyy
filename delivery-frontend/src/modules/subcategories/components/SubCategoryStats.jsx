import React from 'react';
import { ListTree, CheckCircle, TrendingUp, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const SubCategoryStats = ({ statsData }) => {
    const stats = [
        {
            title: 'Total Sub-Categories',
            value: statsData?.totalSubCategories || 0,
            trend: '+0', // Keep static trend or calculate if available
            icon: ListTree,
            color: '#8b5cf6',
            subText: 'Across all core categories'
        },
        {
            title: 'Active Sub-Categories',
            value: statsData?.activeSubCategories || 0,
            trend: '+0',
            icon: CheckCircle,
            color: '#10b981',
            subText: 'Currently live on site'
        },
        {
            title: 'Inactive Sub-Categories',
            value: statsData?.inactiveSubCategories || 0,
            trend: '+0',
            icon: TrendingUp,
            color: '#ef4444', // red color for inactive
            subText: 'Currently not live'
        },
        {
            title: 'Total Categories',
            value: statsData?.totalCategories || 0,
            trend: '+0',
            icon: Package,
            color: '#06b6d4',
            subText: 'Parent categories available'
        }
    ];

    return (
        <div className="subcategory-stats-panel">
            {stats.map((stat, i) => (
                <div key={i} className="stat-sc-card">
                    <div className="stat-sc-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                        <stat.icon size={24} />
                    </div>
                    <div className="stat-sc-info">
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

export default SubCategoryStats;
