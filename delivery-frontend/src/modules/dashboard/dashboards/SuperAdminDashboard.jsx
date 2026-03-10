import React from 'react';
import {
    ShoppingBag,
    Truck,
    TrendingUp,
    AlertCircle,
    CreditCard,
    BarChart3,
    CheckCircle,
    Clock,
    Search,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Target,
    Zap,
    Users
} from 'lucide-react';

const StatCard = ({ title, value, trend, color, isCurrency, trendType }) => (
    <div className="dash-stat-card">
        <span className="dash-stat-label">{title}</span>
        <div className="dash-stat-value-group">
            <h3 className="dash-stat-value">{isCurrency ? `$${value}` : value}</h3>
            <span className={`dash-stat-trend ${trendType === 'up' ? 'trend-up' : 'trend-down'}`}>
                {trend}
                {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            </span>
        </div>
        <div className="dash-stat-chart-mini">
            <svg viewBox="0 0 100 30" style={{ width: '100%', height: '100%' }}>
                <path
                    d={trendType === 'up' ? "M0 25 Q 25 20, 50 15 T 100 5" : "M0 5 Q 25 10, 50 15 T 100 25"}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    </div>
);

const FunnelStep = ({ label, value, width, color }) => (
    <div className="funnel-step">
        <div className="funnel-step-bar" style={{ width: `${width}%`, background: color }}>
            <span className="funnel-step-label">{label}</span>
            <span className="funnel-step-val">{value} Stages</span>
        </div>
    </div>
);

const SuperAdminDashboard = () => (
    <div className="dashboard-content">
        <div className="stats-grid">
            <StatCard title="Total Orders" value="8,450" trend="+12%" color="#4f46e5" trendType="up" />
            <StatCard title="Delivered" value="7,820" trend="+10%" color="#10b981" trendType="up" />
            <StatCard title="Cancelled" value="320" trend="-8%" color="#ef4444" trendType="down" />
            <StatCard title="Total GMV" value="245,830" trend="+15%" color="#8b5cf6" trendType="up" isCurrency />
            <StatCard title="Platform Rev" value="18,750" trend="+9%" color="#f59e0b" trendType="up" isCurrency />
            <StatCard title="Avg Time" value="32m" trend="-5%" color="#06b6d4" trendType="down" />
            <StatCard title="SLA Breach" value="8.2%" trend="+2%" color="#f43f5e" trendType="up" />
        </div>

        <div className="content-grid-2-1">
            <div className="dash-card">
                <div className="dash-card-header">
                    <h4>Operational Funnel</h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <select className="rider-filter-select" style={{ minWidth: '100px', height: '32px', padding: '0 10px', fontSize: '0.75rem' }}>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                        <button className="icon-btn-sm" style={{ width: '32px', height: '32px' }}><MoreHorizontal size={16} /></button>
                    </div>
                </div>
                <div className="dash-card-body">
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>Efficiency tracking across delivery lifecycle stages.</p>
                    <div className="funnel-container">
                        <FunnelStep label="Orders Placed" value="43" width={100} color="#4f46e5" />
                        <FunnelStep label="Confirmed" value="37" width={88} color="#6366f1" />
                        <FunnelStep label="Packed" value="21" width={74} color="#8b5cf6" />
                        <FunnelStep label="Out for Delivery" value="28" width={58} color="#a855f7" />
                        <FunnelStep label="Delivered" value="24" width={42} color="#d946ef" />
                        <FunnelStep label="Refunded" value="18" width={28} color="#f43f5e" />
                    </div>
                </div>
            </div>

            <div className="dash-card">
                <div className="dash-card-header">
                    <h4>System Health Alerts</h4>
                    <span className="text-btn" style={{ fontSize: '0.75rem' }}>View All</span>
                </div>
                <div className="dash-card-body">
                    <div className="alert-row">
                        <div className="alert-indicator red"><AlertCircle size={20} /></div>
                        <div className="alert-content">
                            <p>Critical: Payment Gateway Timeout</p>
                            <span>Detected in Zone A • 5m ago</span>
                        </div>
                        <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                    </div>
                    <div className="alert-row">
                        <div className="alert-indicator orange"><Zap size={20} /></div>
                        <div className="alert-content">
                            <p>High Demand: London Central</p>
                            <span>Surge pricing active • 12m ago</span>
                        </div>
                        <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                    </div>
                    <div className="alert-row">
                        <div className="alert-indicator blue"><Users size={20} /></div>
                        <div className="alert-content">
                            <p>New Vendor Applications (12)</p>
                            <span>Pending review • 1h ago</span>
                        </div>
                        <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                    </div>
                    <div className="alert-row">
                        <div className="alert-indicator blue"><Truck size={20} /></div>
                        <div className="alert-content">
                            <p>Fleet Expansion: 25 New Riders</p>
                            <span>Onboarding complete • 3h ago</span>
                        </div>
                        <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#cbd5e1' }} />
                    </div>
                </div>
            </div>
        </div>

        <div className="dash-card">
            <div className="dash-card-header">
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <h4 style={{ margin: 0 }}>Active Resolution Queue</h4>
                    <div className="dash-tabs">
                        <button className="tab-btn active">Vendors (8)</button>
                        <button className="tab-btn">Products (5)</button>
                        <button className="tab-btn">Finance (4)</button>
                    </div>
                </div>
                <button className="icon-btn-sm"><Search size={16} /></button>
            </div>
            <div style={{ padding: '0' }}>
                <table className="dash-table">
                    <thead>
                        <tr>
                            <th>Entity Name</th>
                            <th>Category</th>
                            <th>Entry Date</th>
                            <th>Priority</th>
                            <th>Reviewer</th>
                            <th>Operation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { name: 'SpiceMart Express', category: 'Grocery', date: 'Feb 18, 2026', priority: 'High', status: 'error' },
                            { name: 'HealthyBites Vendor', category: 'Restaurant', date: 'Feb 19, 2026', priority: 'Medium', status: 'warning' },
                            { name: 'UrbanFresh Co.', category: 'Grocer', date: 'Feb 20, 2026', priority: 'Low', status: 'success' },
                        ].map((item, i) => (
                            <tr key={i}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div className="entity-avatar">{item.name[0]}</div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--dash-text-main)' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: #VND-992{i}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span style={{ fontWeight: 600 }}>{item.category}</span></td>
                                <td style={{ color: '#64748b' }}>{item.date}</td>
                                <td>
                                    <span className={`badge-outline ${item.status}`}>
                                        {item.priority}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9', border: '2px solid white', boxShadow: '0 0 0 1px #e2e8f0' }}></div>
                                        <span style={{ fontSize: '0.85rem' }}>Admin</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="action-btns" style={{ gap: '12px' }}>
                                        <button className="text-btn primary" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Review</button>
                                        <button className="text-btn" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>Ignore</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center' }}>
                <button className="text-btn primary" style={{ width: '100%', fontWeight: 700 }}>Enter Full Resolution Module</button>
            </div>
        </div>
    </div>
);

export default SuperAdminDashboard;
