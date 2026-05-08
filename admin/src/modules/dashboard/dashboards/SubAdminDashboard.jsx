import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, ShoppingBag, Truck, TrendingUp, AlertCircle,
    CreditCard, BarChart3, CheckCircle, Clock, Search,
    ChevronRight, ArrowUpRight, ArrowDownRight, MoreHorizontal,
    Zap, Package, Layers, Store, IndianRupee
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getAdminStats, getAdminActivities, getAdminAnalytics } from '../../../api/admin_dashboard.api';
import '../Dashboard.css';

const StatCard = ({ title, value, subText, icon: Icon, color, loading }) => (
    <div className="dash-stat-card">
        <div className="dash-stat-header">
            <div className="dash-stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={22} />
            </div>
        </div>
        <div className="dash-stat-body">
            {loading ? <div className="skeleton" style={{ height: '32px', width: '80%' }}></div> : <h3 className="dash-stat-value">{value}</h3>}
            <p className="dash-stat-subtext" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{subText}</p>
        </div>
    </div>
);

const SubAdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState({ orders: [] });
    const [analytics, setAnalytics] = useState({ revenue: [] });
    const [period, setPeriod] = useState('7days');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, activitiesRes, analyticsRes] = await Promise.all([
                getAdminStats(),
                getAdminActivities(),
                getAdminAnalytics({ period })
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (activitiesRes.success) setActivities(activitiesRes.data);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);
        } catch (error) {
            console.error("Dashboard Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    return (
        <div className="dashboard-content">
            <div className="stats-grid">
                <StatCard
                    title="Total Revenue"
                    value={`₹${parseFloat(stats.revenue?.total || 0).toLocaleString()}`}
                    subText={`Monthly: ₹${parseFloat(stats.revenue?.monthly || 0).toLocaleString()}`}
                    icon={IndianRupee}
                    color="#6366f1"
                    loading={loading}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders?.total || 0}
                    subText={`${stats.orders?.pending || 0} Pending`}
                    icon={ShoppingBag}
                    color="#10b981"
                    loading={loading}
                />
                <StatCard
                    title="Total Customers"
                    value={stats.customers?.total || 0}
                    subText={`${stats.customers?.active || 0} Active`}
                    icon={Users}
                    color="#f59e0b"
                    loading={loading}
                />
                <StatCard
                    title="Total Products"
                    value={stats.products?.total || 0}
                    subText={`${stats.products?.active || 0} Approved`}
                    icon={Package}
                    color="#8b5cf6"
                    loading={loading}
                />
            </div>

            <div className="content-grid-2-1" style={{ marginTop: '24px' }}>
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Platform Performance</h4>
                        <div className="analytics-tabs">
                            {['7days', 'monthly'].map(p => (
                                <button
                                    key={p}
                                    className={`tab-btn ${period === p ? 'active' : ''}`}
                                    onClick={() => setPeriod(p)}
                                >
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="dash-card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={analytics.revenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f133" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Recent Activity</h4>
                    </div>
                    <div className="dash-card-body" style={{ padding: 0 }}>
                        <div className="activity-list">
                            {activities.orders.slice(0, 5).map((ord, i) => (
                                <div key={i} className="activity-item" style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Order #{ord.order_number}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ord.customer_name} • ₹{parseFloat(ord.total_amount).toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubAdminDashboard;
