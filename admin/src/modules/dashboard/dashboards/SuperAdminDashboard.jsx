import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, ShoppingBag, Truck, TrendingUp, AlertCircle,
    CreditCard, BarChart3, CheckCircle, Clock, Search,
    ChevronRight, ArrowUpRight, ArrowDownRight, MoreHorizontal,
    Zap, Package, Layers, Store, IndianRupee, Filter, Calendar
} from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from 'recharts';
import { getAdminStats, getAdminActivities, getAdminAnalytics, getAdminTopEntities } from '../../../api/admin_dashboard.api';
import '../Dashboard.css';

const StatCard = ({ title, value, subText, icon: Icon, color, loading, trend, trendType }) => (
    <div className="dash-stat-card">
        <div className="dash-stat-header">
            <div className="dash-stat-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                <Icon size={22} />
            </div>
            {trend && (
                <span className={`dash-stat-trend ${trendType === 'up' ? 'trend-up' : 'trend-down'}`}>
                    {trend} {trendType === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                </span>
            )}
        </div>
        <div className="dash-stat-body">
            {loading ? <div className="skeleton" style={{ height: '32px', width: '80%' }}></div> : <h3 className="dash-stat-value">{value}</h3>}
            <p className="dash-stat-subtext" style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{subText}</p>
        </div>
    </div>
);

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState({ orders: [], customers: [], vendors: [] });
    const [analytics, setAnalytics] = useState({ revenue: [], growth: [] });
    const [topEntities, setTopEntities] = useState({ topProducts: [], topVendors: [] });
    const [period, setPeriod] = useState('7days');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, activitiesRes, analyticsRes, topRes] = await Promise.all([
                getAdminStats(),
                getAdminActivities(),
                getAdminAnalytics({ period }),
                getAdminTopEntities()
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (activitiesRes.success) setActivities(activitiesRes.data);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);
            if (topRes.success) setTopEntities(topRes.data);
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
            {/* Primary Metrics */}
            <div className="stats-grid">
                <StatCard
                    title="Total Revenue"
                    value={`₹${parseFloat(stats.revenue?.total || 0).toLocaleString()}`}
                    subText={`Today: ₹${parseFloat(stats.revenue?.today || 0).toLocaleString()}`}
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
                    title="Total Vendors"
                    value={stats.vendors?.total || 0}
                    subText={`${stats.vendors?.pending || 0} Pending Approvals`}
                    icon={Store}
                    color="#8b5cf6"
                    loading={loading}
                />
            </div>

            {/* Secondary Metrics */}
            <div className="stats-grid" style={{ marginTop: '24px' }}>
                <StatCard
                    title="Total Riders"
                    value={stats.riders?.total || 0}
                    subText={`${stats.riders?.active || 0} Online`}
                    icon={Truck}
                    color="#06b6d4"
                    loading={loading}
                />
                <StatCard
                    title="Total Products"
                    value={stats.products?.total || 0}
                    subText={`${stats.products?.outOfStock || 0} Out of Stock`}
                    icon={Package}
                    color="#ec4899"
                    loading={loading}
                />
                <StatCard
                    title="Categories"
                    value={stats.categories?.total || 0}
                    subText={`${stats.categories?.subtotal || 0} Subcategories`}
                    icon={Layers}
                    color="#f43f5e"
                    loading={loading}
                />
                <StatCard
                    title="Active Stores"
                    value={stats.stores || 0}
                    subText="Total live branches"
                    icon={Zap}
                    color="#4f46e5"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="content-grid-2-1" style={{ marginTop: '24px' }}>
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Revenue Analytics</h4>
                        <div className="analytics-tabs">
                            {['7days', 'monthly', 'yearly'].map(p => (
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
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Order Status</h4>
                    </div>
                    <div className="dash-card-body">
                        <div className="status-analytics">
                            <div className="status-item">
                                <span>Pending</span>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stats.orders?.pending / stats.orders?.total) * 100 || 0}%`, background: '#f59e0b' }}></div></div>
                                <span>{stats.orders?.pending || 0}</span>
                            </div>
                            <div className="status-item">
                                <span>Completed</span>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stats.orders?.completed / stats.orders?.total) * 100 || 0}%`, background: '#10b981' }}></div></div>
                                <span>{stats.orders?.completed || 0}</span>
                            </div>
                            <div className="status-item">
                                <span>Cancelled</span>
                                <div className="progress-bar"><div className="progress-fill" style={{ width: `${(stats.orders?.cancelled / stats.orders?.total) * 100 || 0}%`, background: '#ef4444' }}></div></div>
                                <span>{stats.orders?.cancelled || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="content-grid-1-1" style={{ marginTop: '24px' }}>
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Recent Orders</h4>
                        <span className="text-btn" onClick={() => navigate('/admin-orders')}>View All</span>
                    </div>
                    <div className="dash-card-body" style={{ padding: 0 }}>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.orders.map((ord, i) => (
                                    <tr key={i}>
                                        <td>#{ord.order_number}</td>
                                        <td>{ord.customer_name}</td>
                                        <td>₹{parseFloat(ord.total_amount).toLocaleString()}</td>
                                        <td><span className={`status-pill ${ord.order_status.toLowerCase()}`}>{ord.order_status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Top Selling Products</h4>
                    </div>
                    <div className="dash-card-body" style={{ padding: 0 }}>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Sales</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEntities.topProducts.map((prod, i) => (
                                    <tr key={i}>
                                        <td>{prod.name}</td>
                                        <td>{prod.sales_count}</td>
                                        <td>₹{parseFloat(prod.total_revenue).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="content-grid-1-1" style={{ marginTop: '24px' }}>
                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Recent Vendors</h4>
                        <span className="text-btn" onClick={() => navigate('/vendors')}>View All</span>
                    </div>
                    <div className="dash-card-body" style={{ padding: 0 }}>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Store Name</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.vendors.map((vendor, i) => (
                                    <tr key={i}>
                                        <td>{vendor.store_name}</td>
                                        <td>{new Date(vendor.created_at).toLocaleDateString()}</td>
                                        <td><span className={`status-pill ${vendor.approval_status.toLowerCase()}`}>{vendor.approval_status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dash-card">
                    <div className="dash-card-header">
                        <h4>Top Vendors by Orders</h4>
                    </div>
                    <div className="dash-card-body" style={{ padding: 0 }}>
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>Store</th>
                                    <th>Orders</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topEntities.topVendors.map((vendor, i) => (
                                    <tr key={i}>
                                        <td>{vendor.store_name}</td>
                                        <td>{vendor.order_count}</td>
                                        <td>₹{parseFloat(vendor.total_revenue).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
