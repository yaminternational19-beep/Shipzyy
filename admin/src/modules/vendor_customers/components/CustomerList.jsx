import React from 'react';
import { Eye, User, CheckSquare, Square } from 'lucide-react';
import ActionButton from '../../../components/common/ActionButton/ActionButton';
import { getSafeImage } from '../../../utils/imageUtils';
// Removed invalid formatDate import

const CustomerList = ({ customers, onAction, selectedRows, onSelectRow, onSelectAll }) => {
    const allSelected = customers.length > 0 && selectedRows.length === customers.length;
    if (!customers || customers.length === 0) {
        return (
            <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '8px' }}>No Customers Found</div>
                <p style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>No customers have purchased your products yet or match filters.</p>
            </div>
        );
    }

    const getStatusClass = (status) => {
        if (!status) return 'active';
        return status.toLowerCase() === 'active' ? 'active' : 'inactive';
    };

    return (
        <div>
            <table className="dashboard-table" style={{ minWidth: '1100px' }}>
                <thead>
                    <tr>
                        <th style={{ width: '48px', paddingLeft: '24px' }}>
                            <div
                                onClick={() => onSelectAll && onSelectAll(!allSelected)}
                                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                {allSelected
                                    ? <CheckSquare size={17} color="var(--primary-color)" />
                                    : <Square size={17} color="#94a3b8" />
                                }
                            </div>
                        </th>
                        <th style={{ width: '70px', paddingLeft: '16px' }}>PROFILE</th>
                        <th>CUST ID</th>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>JOINED DATE</th>
                        <th style={{ textAlign: 'center' }}>ORDERS</th>
                        <th>SPENT (Yours)</th>
                        <th style={{ textAlign: 'center' }}>STATUS</th>
                        <th style={{ textAlign: 'right', paddingRight: '24px' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((c) => (
                        <tr key={c.id}>
                            <td style={{ paddingLeft: '24px' }}>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectRow && onSelectRow(c.id);
                                    }}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    {selectedRows.includes(c.id)
                                        ? <CheckSquare size={17} color="var(--primary-color)" />
                                        : <Square size={17} color="#94a3b8" />
                                    }
                                </div>
                            </td>
                            <td style={{ paddingLeft: '16px' }}>
                                <div style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img 
                                        src={getSafeImage(c.profile_image, 'USER')} 
                                        alt={c.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                                    {c.customer_code}
                                </div>
                            </td>
                            <td>
                                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                    {c.name}
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                                    {c.email}
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 500 }}>
                                    {c.phone || '-'}
                                </div>
                            </td>
                            <td>
                                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                                    {new Date(c.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span style={{
                                    background: '#f1f5f9', padding: '4px 12px', borderRadius: '12px',
                                    fontSize: '0.8rem', fontWeight: 600, color: '#334155'
                                }}>
                                    {c.orders}
                                </span>
                            </td>
                            <td>
                                <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.9rem' }}>
                                    ₹{c.total_spent ? c.total_spent.toFixed(2) : "0.00"}
                                </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <span className={`status-badge ${getStatusClass(c.status)}`}>
                                    {c.status}
                                </span>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                    <ActionButton
                                        icon={Eye}
                                        onClick={() => onAction('view', c)}
                                        variant="secondary"
                                        tooltip="View Details"
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CustomerList;
