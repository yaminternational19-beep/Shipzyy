import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Search, Menu, LogOut, Settings, Shield } from 'lucide-react';
import './Navbar.css';
import { logoutApi } from '../../api/auth.api';

const Navbar = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const userRole = localStorage.getItem('userRole') || 'Guest';
    const userName = "John Doe"; // Static for now

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (refreshToken) {
                await logoutApi({ refreshToken });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.clear();
            navigate('/login');
        }
    };

    const formatRole = (role) => {
        return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <header className="top-header">
            <div className="header-left">
                {/*  Title/Subtitle logic could go here if route dependent, 
                      but typically Sidebar handles Nav. 
                      Let's stick to the requested layout: Title Left, Profile Right.
                  */}
                {/* <div>
                    <h2 className="header-title">Dashboard</h2>
                    <p className="header-subtitle">Overview of your performance</p>
                </div> */}
            </div>

            <div className="header-actions">
                <button className="btn-icon" onClick={() => navigate('/notifications')}>
                    <Bell size={20} />
                </button>

                <div className="profile-menu" ref={dropdownRef} onClick={() => setShowDropdown(!showDropdown)}>
                    <div className="profile-avatar">
                        <User size={20} />
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{userName}</span>
                        <span className="profile-role">{formatRole(userRole)}</span>
                    </div>

                    {showDropdown && (
                        <div className="header-dropdown">
                            <button className="dropdown-item" onClick={() => navigate('/profile')}>
                                <User size={16} /> My Profile
                            </button>
                            <button
                                className="dropdown-item logout"
                                onClick={handleLogout}
                            >
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
