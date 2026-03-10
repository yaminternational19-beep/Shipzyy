import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, CheckSquare, Square, Filter } from 'lucide-react';
import ExportActions from '../../../components/common/ExportActions';
import ActionButtons from '../../../components/common/ActionButtons';

// Random real-looking store cover images (food & retail themed via picsum/unsplash topics)
const VENDOR_IMAGES = [
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=56&h=56&fit=crop',  // restaurant
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=56&h=56&fit=crop',  // grocery
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=56&h=56&fit=crop', // burger
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=56&h=56&fit=crop', // cafe
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=56&h=56&fit=crop',  // pizza
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=56&h=56&fit=crop',  // fine dining
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=56&h=56&fit=crop',  // bakery
];

const vendors = [
    {
        id: 'VND001',
        name: 'Spice Garden',
        business: 'Spice Garden Restaurants Pvt Ltd',
        address: '12, MG Road, Bengaluru, Karnataka',
        turnover: '₹3,24,500',
        status: 'Active',
        tier: 'Gold',
        kyc: 'Verified',
        img: VENDOR_IMAGES[0],
    },
    {
        id: 'VND002',
        name: 'Fresh Mart',
        business: 'Fresh Mart Retail & Grocery Ltd',
        address: '47, Linking Road, Mumbai, Maharashtra',
        turnover: '₹9,87,200',
        status: 'Active',
        tier: 'Platinum',
        kyc: 'Verified',
        img: VENDOR_IMAGES[1],
    },
    {
        id: 'VND003',
        name: 'Burger Barn',
        business: 'Burger Barn Food Chains Pvt Ltd',
        address: '5, Connaught Place, New Delhi',
        turnover: '₹6,42,000',
        status: 'Active',
        tier: 'Platinum',
        kyc: 'Verified',
        img: VENDOR_IMAGES[2],
    },
    {
        id: 'VND004',
        name: 'Local Brew Cafe',
        business: 'Local Brew Hospitality & Cafe',
        address: '9, Park Street, Kolkata, West Bengal',
        turnover: '₹98,400',
        status: 'Inactive',
        tier: 'Silver',
        kyc: 'Pending',
        img: VENDOR_IMAGES[3],
    },
    {
        id: 'VND005',
        name: 'The Pizza Co.',
        business: 'Pizza Co. Express Franchises Pvt Ltd',
        address: '33, FC Road, Pune, Maharashtra',
        turnover: '₹1,87,500',
        status: 'Active',
        tier: 'Gold',
        kyc: 'Verified',
        img: VENDOR_IMAGES[4],
    },
    {
        id: 'VND006',
        name: 'Tandoor House',
        business: 'Tandoor House Culinary Services',
        address: '21, Anna Salai, Chennai, Tamil Nadu',
        turnover: '₹4,56,000',
        status: 'Active',
        tier: 'Gold',
        kyc: 'Verified',
        img: VENDOR_IMAGES[5],
    },
    {
        id: 'VND007',
        name: 'Bakery & More',
        business: 'Bakery & More Confections Ltd',
        address: '8, MI Road, Jaipur, Rajasthan',
        turnover: '₹2,13,800',
        status: 'Active',
        tier: 'Silver',
        kyc: 'Verified',
        img: VENDOR_IMAGES[6],
    },
];

const VendorList = ({ onEdit, onStatusToggle, onDelete, showToast, onTabChange }) => {
    const [selectedRows, setSelectedRows] = useState([]);
    const [tierFilter, setTierFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const toggleSelectAll = () => {
        if (selectedRows.length === filteredVendors.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredVendors.map(v => v.id));
        }
    };

    const toggleSelectRow = (id) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleExport = (message, type) => {
        showToast(message, type);
    };

    const filteredVendors = vendors.filter(v => {
        const matchesTier = tierFilter === 'All' || v.tier === tierFilter;
        const matchesSearch =
            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.business.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.address.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTier && matchesSearch;
    });

    const TIER_STYLE = {
        Platinum: { badge: 'status-active', bg: '#eef2ff', color: '#4f46e5' },
        Gold: { badge: 'status-pending', bg: '#fffbeb', color: '#b45309' },
        Silver: { badge: 'status-blocked', bg: '#f1f5f9', color: '#475569' },
    };

    return (
        <div className="c-table-container">
            {/* Filter Bar */}
            <div className="v-table-controls">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="c-search">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by ID, name, business, address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="input-with-icon" style={{ width: '180px' }}>
                        <Filter size={15} className="field-icon" />
                        <select
                            value={tierFilter}
                            onChange={(e) => setTierFilter(e.target.value)}
                        >
                            <option value="All">All Tiers</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                        </select>
                    </div>
                </div>

                <div className="filter-controls">
                    <ExportActions
                        selectedCount={selectedRows.length}
                        onExport={handleExport}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table className="dashboard-table">

                    <thead>
                        <tr>
                            <th style={{ width: '48px' }}>
                                <div
                                    onClick={toggleSelectAll}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {filteredVendors.length > 0 && selectedRows.length === filteredVendors.length
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </th>
                            <th>Image</th>
                            <th>Vendor ID</th>
                            <th>Vendor Name</th>
                            <th>Business</th>
                            <th>Address</th>
                            <th>Turnover</th>
                            <th>Tier</th>
                            <th>Status</th>
                            <th className="col-actions">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVendors.map((vendor) => (
                            <tr
                                key={vendor.id}
                                style={{ background: selectedRows.includes(vendor.id) ? '#f8fafc' : 'white' }}
                            >
                                {/* Checkbox */}
                                <td>
                                    <div
                                        onClick={() => toggleSelectRow(vendor.id)}
                                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    >
                                        {selectedRows.includes(vendor.id)
                                            ? <CheckSquare size={17} color="var(--primary-color)" />
                                            : <Square size={17} color="#94a3b8" />
                                        }
                                    </div>
                                </td>

                                {/* Vendor Image */}
                                <td>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0',
                                        flexShrink: 0,
                                    }}>
                                        <img
                                            src={vendor.img}
                                            alt={vendor.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${vendor.name}&backgroundColor=6366f1,4f46e5`;
                                            }}
                                        />
                                    </div>
                                </td>

                                {/* Vendor ID */}
                                <td>
                                    <span style={{ fontWeight: 700, color: '#4f46e5', fontSize: '13px' }}>
                                        {vendor.id}
                                    </span>
                                </td>

                                {/* Vendor Name */}
                                <td>
                                    <span style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                                        {vendor.name}
                                    </span>
                                </td>

                                {/* Business (separate column) */}
                                <td>
                                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                                        {vendor.business}
                                    </span>
                                </td>

                                {/* Address (separate column) */}
                                <td style={{ maxWidth: '200px' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                                        {vendor.address}
                                    </span>
                                </td>

                                {/* Turnover in INR */}
                                <td>
                                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>
                                        {vendor.turnover}
                                    </span>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>per month</div>
                                </td>

                                {/* Tier Badge */}
                                <td>
                                    <span
                                        className={`status-badge`}
                                        style={{
                                            background: TIER_STYLE[vendor.tier]?.bg,
                                            color: TIER_STYLE[vendor.tier]?.color,
                                            fontWeight: 700,
                                            fontSize: '11px',
                                        }}
                                    >
                                        {vendor.tier}
                                    </span>
                                </td>

                                {/* Status Badge */}
                                <td>
                                    <span className={`status-badge ${vendor.status === 'Active' ? 'status-live' : 'status-blocked'}`}>
                                        {vendor.status === 'Active' ? 'ACTIVE' : 'DEACTIVE'}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="col-actions">
                                    <ActionButtons
                                        onView={() => navigate(`/vendors/${vendor.id}`, { state: { vendor } })}
                                        onEdit={() => onEdit?.(vendor)}
                                        onDelete={() => onDelete?.(vendor)}
                                        onPermissions={() => onTabChange?.('kyc')}
                                        onToggleStatus={() => onStatusToggle?.(vendor)}
                                        isActive={vendor.status === 'Active'}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="c-pagination" style={{ borderTop: '1px solid var(--border-color)' }}>
                <span className="c-pagination-info">
                    Showing {filteredVendors.length} of {vendors.length} entries
                </span>
                <div className="c-pagination-btns">
                    <button className="c-page-btn" disabled>
                        <ChevronLeft size={16} /> Prev
                    </button>
                    <button className="c-page-btn">
                        Next <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorList;
