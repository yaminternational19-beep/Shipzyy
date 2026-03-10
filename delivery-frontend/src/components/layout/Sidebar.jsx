import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Headphones,
    CreditCard,
    FileText,
    ShieldCheck,
    Settings,
    ChevronLeft,
    Menu,
    Truck,
    BarChart3,
    Ticket,
    Undo2,
    Receipt,
    Users2,
    Layers,
    ListTree,
    Award,
    Bike,
    Car,
    Scale,
    Navigation
} from 'lucide-react';
import { rolePermissions } from '../../utils/rolePermissions';
import { menuItems, sidebarGroups } from '../../utils/menuConfig';
import './Sidebar.css';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Update global CSS variable for layout sync
    React.useEffect(() => {
        const width = isCollapsed ? '80px' : '260px';
        document.documentElement.style.setProperty('--sidebar-width', width);
    }, [isCollapsed]);

    const userRole = localStorage.getItem('userRole') || 'SUPER_ADMIN';
    const permissions = rolePermissions[userRole] || [];

    const filteredMenu = permissions.includes("ALL")
        ? menuItems
        : menuItems.filter(item => permissions.includes(item.key));

    const groups = sidebarGroups;

    const groupedMenu = filteredMenu.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {});

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                {!isCollapsed && (
                    <div className="sidebar-logo">
                        <div className="logo-icon">
                            <Truck size={20} />
                        </div>
                        <span className="logo-text">Shipzzy</span>
                    </div>
                )}
                <button
                    className="sidebar-toggle"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <div className="sidebar-content">
                {Object.keys(groupedMenu).map(groupKey => (
                    <div key={groupKey} className="sidebar-group">
                        {!isCollapsed && (
                            <span className="sidebar-group-label">
                                {groups[groupKey]}
                            </span>
                        )}
                        <div className="sidebar-nav-list">
                            {groupedMenu[groupKey].map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.key}
                                        to={item.path}
                                        className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
                                        title={isCollapsed ? item.name : ''}
                                    >
                                        <Icon size={20} />
                                        {!isCollapsed && <span>{item.name}</span>}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
