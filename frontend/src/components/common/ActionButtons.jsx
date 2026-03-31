import React from 'react';
import { Eye, ShieldCheck, Edit3, Trash2, Power, Zap, ZapOff, Package, CheckCircle, XCircle } from 'lucide-react';

const ActionButtons = ({ onView, onPermissions, onEdit, onDelete, onStock, onToggleStatus, onToggleAutoApprove, onApprove, onReject, isAutoApprove, isActive, type }) => {
    const isCustomer = type === 'customer';

    return (
        <div className="action-buttons">
            {onView && (
                <button
                    className="action-btn action-view"
                    onClick={onView}
                    type="button"
                    title={isCustomer ? "View Profile" : "View Dashboard"}
                >
                    <Eye size={16} strokeWidth={2} />
                </button>
            )}

            {onPermissions && (
                <button
                    className="action-btn action-permissions"
                    onClick={onPermissions}
                    type="button"
                    title="Edit Permissions"
                >
                    <ShieldCheck size={18} strokeWidth={2} />
                </button>
            )}

            {onToggleStatus && (
                <button
                    className={`action-btn ${isActive ? 'action-deactivate' : 'action-activate'}`}
                    onClick={onToggleStatus}
                    type="button"
                    title={isActive ? (isCustomer ? 'Block User' : 'Deactivate') : (isCustomer ? 'Activate User' : 'Activate')}
                    style={{ color: isActive ? '#f59e0b' : '#10b981' }}
                >
                    <Power size={18} strokeWidth={2} />
                </button>
            )}

            {onToggleAutoApprove && (
                <button
                    className={`action-btn ${isAutoApprove ? 'action-auto-on' : 'action-auto-off'}`}
                    onClick={onToggleAutoApprove}
                    type="button"
                    title={isAutoApprove ? 'Disable Auto Approval' : 'Enable Auto Approval'}
                    style={{ color: isAutoApprove ? '#8b5cf6' : '#94a3b8' }}
                >
                    {isAutoApprove ? <Zap size={18} strokeWidth={2} fill="#8b5cf6" /> : <ZapOff size={18} strokeWidth={2} />}
                </button>
            )}

            {onStock && (
                <button
                    className="action-btn action-stock"
                    onClick={onStock}
                    type="button"
                    title="Manage Stock"
                    style={{ color: '#0ea5e9' }}
                >
                    <Package size={18} strokeWidth={2} />
                </button>
            )}

            {onEdit && (
                <button
                    className="action-btn action-edit"
                    onClick={onEdit}
                    type="button"
                    title="Edit"
                >
                    <Edit3 size={18} strokeWidth={2} />
                </button>
            )}

            {onApprove && (
                <button
                    className="action-btn action-permissions"
                    onClick={onApprove}
                    type="button"
                    title="Approve"
                >
                    <CheckCircle size={18} strokeWidth={2} />
                </button>
            )}

            {onReject && (
                <button
                    className="action-btn action-delete"
                    onClick={onReject}
                    type="button"
                    title="Reject"
                >
                    <XCircle size={18} strokeWidth={2} />
                </button>
            )}

            {onDelete && (
                <button
                    className="action-btn action-delete"
                    onClick={onDelete}
                    type="button"
                    title={isCustomer ? "Terminate Account" : (isActive ? 'Deactivate before deleting' : 'Delete')}
                    disabled={!isCustomer && isActive}
                    style={{
                        opacity: (!isCustomer && isActive) ? 0.4 : 1,
                        cursor: (!isCustomer && isActive) ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Trash2 size={18} strokeWidth={2} />
                </button>
            )}
        </div>
    );
};

export default ActionButtons;
