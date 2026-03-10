import React from 'react';
import { ShoppingBag, Users, Package, Headphones, AlertCircle, ArrowUpRight, TrendingUp, Zap } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="dash-stat-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div style={{ background: `${color}15`, color: color, padding: '8px', borderRadius: '10px' }}>
                <Icon size={18} />
            </div>
            {trend && (
                <span className="dash-stat-trend trend-up">
                    {trend} <ArrowUpRight size={12} />
                </span>
            )}
        </div>
        <span className="dash-stat-label">{title}</span>
        <h3 className="dash-stat-value">{value}</h3>
    </div>
);

const AdminDashboard = () => (
    <div className="dashboard-content">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <StatCard title="Active Vendors" value="48" icon={ShoppingBag} color="#6366f1" trend="+4" />
            <StatCard title="Total Customers" value="1,240" icon={Users} color="#10b981" trend="+12%" />
            <StatCard title="Pending Approvals" value="12" icon={Package} color="#f59e0b" />
            <StatCard title="Open Tickets" value="5" icon={Headphones} color="#ef4444" />
        </div>

        <div className="content-grid-1-1" style={{ marginTop: '24px' }}>
            <div className="dash-card">
                <div className="dash-card-header">
                    <h4>Regional Performance</h4>
                    <TrendingUp size={18} color="#94a3b8" />
                </div>
                <div className="dash-card-body">
                    <div style={{ height: '200px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontWeight: 500 }}>
                        Performance Metrics Visual
                    </div>
                </div>
            </div>

            <div className="dash-card">
                <div className="dash-card-header">
                    <h4>Admin Quick Actions</h4>
                    <Zap size={18} color="#f59e0b" />
                </div>
                <div className="dash-card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button className="action-btn primary" style={{ width: '100%', justifyContent: 'center' }}>Add New Vendor</button>
                    <button className="action-btn secondary" style={{ width: '100%', justifyContent: 'center' }}>Broadcast Message</button>
                    <button className="action-btn secondary" style={{ width: '100%', justifyContent: 'center' }}>Configure SLAs</button>
                    <button className="action-btn secondary" style={{ width: '100%', justifyContent: 'center' }}>System Audit</button>
                </div>
            </div>
        </div>
    </div>
);

export default AdminDashboard;
