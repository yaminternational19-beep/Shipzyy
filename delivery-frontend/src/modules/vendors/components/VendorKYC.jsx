import React, { useState } from 'react';
import {
    FileText,
    CheckCircle,
    XCircle,
    Eye,
    ShieldCheck,
    Download,
    AlertCircle,
    Search,
    User,
    MapPin,
    CreditCard
} from 'lucide-react';

const VendorKYC = ({ showToast }) => {
    const [kycRequests, setKycRequests] = useState([
        {
            id: 'KYC-1001',
            vendorName: 'Organic Harvest Co',
            companyId: 'V-8821',
            submittedDate: '2026-02-15',
            status: 'Pending',
            ownerName: 'Rahul Sharma',
            category: 'Grocery',
            email: 'rahul@organicharvest.com',
            mobile: '+91 98765 43210',
            emergencyMobile: '+91 87654 32109',
            address: 'Plot 45, Industrial Area Phase II',
            city: 'Bangalore',
            state: 'Karnataka',
            country: 'India',
            pincode: '560001',
            bankDetails: {
                bankName: 'HDFC Bank',
                accountName: 'Organic Harvest Co',
                accountNumber: '50100223344556',
                ifsc: 'HDFC0001234'
            },
            documents: [
                { type: 'GST Certificate', id: 'GST-9921-X', file: 'gst_cert.pdf', status: 'verified' },
                { type: 'PAN Card', id: 'AYYPB1234F', file: 'pan_card.jpg', status: 'verified' },
                { type: 'Address Proof', id: 'ADD-5521', file: 'utility_bill.pdf', status: 'pending' },
                { type: 'Trade License', id: 'TL-7721', file: 'trade_license.pdf', status: 'pending' }
            ]
        },
        {
            id: 'KYC-1002',
            vendorName: 'ElectroHub Retail',
            companyId: 'V-9902',
            submittedDate: '2026-02-16',
            status: 'Pending',
            ownerName: 'Sanjay Gupta',
            category: 'Electronics',
            email: 'contact@electrohub.in',
            mobile: '+91 91234 56789',
            emergencyMobile: '+91 90000 11111',
            address: 'Shop No 12, MG Road Plaza',
            city: 'Pune',
            state: 'Maharashtra',
            country: 'India',
            pincode: '411001',
            bankDetails: {
                bankName: 'ICICI Bank',
                accountName: 'ElectroHub Retail',
                accountNumber: '100200300400',
                ifsc: 'ICIC0005566'
            },
            documents: [
                { type: 'GST Certificate', id: 'GST-7721-P', file: 'gst_cert_electro.pdf', status: 'verified' },
                { type: 'PAN Card', id: 'BPPPB5678G', file: 'pan_electro.png', status: 'verified' },
                { type: 'Address Proof', id: 'ADD-9902', file: 'rent_agreement.pdf', status: 'verified' }
            ]
        },
        {
            id: 'KYC-1003',
            vendorName: 'Fashion Forward',
            companyId: 'V-4412',
            submittedDate: '2026-02-14',
            status: 'Rejected',
            rejectionReason: 'Blurred PAN card image. Please resubmit a clearer scan.',
            ownerName: 'Anjali Verma',
            category: 'Fashion',
            email: 'admin@fashionforward.com',
            mobile: '+91 98888 77777',
            emergencyMobile: '+91 97777 66666',
            address: 'Suite 201, Crystal Tower',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            pincode: '400001',
            bankDetails: {
                bankName: 'Axis Bank',
                accountName: 'Fashion Forward',
                accountNumber: '912010055566677',
                ifsc: 'UTIB0001122'
            },
            documents: [
                { type: 'GST Certificate', id: 'GST-1102-K', file: 'fashion_gst.pdf', status: 'verified' },
                { type: 'PAN Card', id: 'CPPPC9012H', file: 'fashion_pan.jpg', status: 'rejected' }
            ]
        },
        {
            id: 'KYC-1004',
            vendorName: 'Tandoor House',
            companyId: 'V-3301',
            submittedDate: '2026-02-17',
            status: 'Approved',
            ownerName: 'Vikram Singh',
            category: 'Restaurants',
            email: 'info@tandoorhouse.com',
            mobile: '+91 93333 44444',
            emergencyMobile: '+91 92222 55555',
            address: '21, Anna Salai, Near Central Mall',
            city: 'Chennai',
            state: 'Tamil Nadu',
            country: 'India',
            pincode: '600002',
            bankDetails: {
                bankName: 'SBI Bank',
                accountName: 'Tandoor House Culinary',
                accountNumber: '312400012345',
                ifsc: 'SBIN0004567'
            },
            documents: [
                { type: 'GST Certificate', id: 'GST-3301-T', file: 'tandoor_gst.pdf', status: 'verified' },
                { type: 'PAN Card', id: 'DPPVB3301T', file: 'tandoor_pan.jpg', status: 'verified' },
                { type: 'FSSAI License', id: 'FSSAI-9900', file: 'fssai.pdf', status: 'verified' }
            ]
        }
    ]);

    const [selectedRequest, setSelectedRequest] = useState(kycRequests[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredRequests = React.useMemo(() => {
        return kycRequests.filter(req => {
            const matchesSearch =
                req.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.companyId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                req.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [kycRequests, searchQuery, statusFilter]);

    const handleApprove = (id) => {
        setKycRequests(prev => prev.map(req =>
            req.id === id ? { ...req, status: 'Approved' } : req
        ));
        showToast(`KYC for ${selectedRequest.vendorName} approved successfully!`, 'success');
        setSelectedRequest(prev => ({ ...prev, status: 'Approved' }));
    };

    const handleReject = (id) => {
        const reason = prompt('Enter rejection reason:');
        if (reason) {
            setKycRequests(prev => prev.map(req =>
                req.id === id ? { ...req, status: 'Rejected', rejectionReason: reason } : req
            ));
            showToast(`KYC for ${selectedRequest.vendorName} rejected.`, 'error');
            setSelectedRequest(prev => ({ ...prev, status: 'Rejected', rejectionReason: reason }));
        }
    };

    const statusStyle = {
        Pending: { bg: '#fffbeb', color: '#b45309', label: 'PENDING' },
        Approved: { bg: '#f0fdf4', color: '#16a34a', label: 'APPROVED' },
        Rejected: { bg: '#fef2f2', color: '#dc2626', label: 'REJECTED' },
    };

    const pendingCount = kycRequests.filter(r => r.status === 'Pending').length;

    return (
        <div className="kyc-container">
            <div className="kyc-verification-grid">

                {/* ── LEFT PANEL ── */}
                <div className="kyc-list-card">
                    {/* Card Header */}
                    <div style={{ padding: '20px 20px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>Verification Requests</h3>
                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{kycRequests.length} total applications</p>
                            </div>
                            {pendingCount > 0 && (
                                <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', fontWeight: 700 }}>
                                    {pendingCount} Pending
                                </span>
                            )}
                        </div>

                        {/* Filters */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                            <div className="filter-search" style={{ flex: 1 }}>
                                <Search className="search-icon" size={16} />
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search vendor or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ height: '38px', fontSize: '13px' }}
                                />
                            </div>
                            <select
                                className="filter-select"
                                style={{ width: '120px', fontSize: '12px' }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="kyc-list-scroll">
                        {filteredRequests.length > 0 ? filteredRequests.map((request) => {
                            const s = statusStyle[request.status] || {};
                            return (
                                <div
                                    key={request.id}
                                    className={`kyc-list-item ${selectedRequest?.id === request.id ? 'active' : ''}`}
                                    onClick={() => setSelectedRequest(request)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {/* Avatar */}
                                        <div style={{ width: '38px', height: '38px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1.5px solid #e2e8f0' }}>
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.vendorName}`}
                                                alt={request.vendorName}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {request.vendorName}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                {request.id} · {request.submittedDate}
                                            </div>
                                        </div>
                                        <span className={`status-badge ${request.status === 'Approved' ? 'status-approved' :
                                            request.status === 'Rejected' ? 'status-blocked' :
                                                'status-pending'
                                            }`} style={{ fontSize: '10px', padding: '3px 10px', flexShrink: 0 }}>
                                            {request.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
                                <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                <p style={{ fontSize: '13px', margin: 0 }}>No matching requests found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="kyc-details-panel">
                    {selectedRequest ? (
                        <div className="kyc-details-card">
                            {/* Details Header */}
                            <div className="kyc-details-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #e2e8f0', flexShrink: 0 }}>
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRequest.vendorName}`}
                                            alt={selectedRequest.vendorName}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#1e293b' }}>
                                            {selectedRequest.vendorName}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                                            <span>ID: {selectedRequest.companyId}</span>
                                            <span>·</span>
                                            <span>{selectedRequest.category}</span>
                                            <span>·</span>
                                            <span>Submitted: {selectedRequest.submittedDate}</span>
                                        </div>
                                    </div>
                                    <span style={{
                                        background: statusStyle[selectedRequest.status]?.bg,
                                        color: statusStyle[selectedRequest.status]?.color,
                                        padding: '6px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '12px'
                                    }}>
                                        {statusStyle[selectedRequest.status]?.label}
                                    </span>
                                </div>
                            </div>

                            {/* Details Body */}
                            <div className="kyc-details-body">

                                {/* Section: Business & Contact */}
                                <div className="kyc-section">
                                    <h4 className="kyc-section-header">
                                        <User size={15} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#6366f1' }} />
                                        Business & Contact Information
                                    </h4>
                                    <div className="kyc-info-grid">
                                        {[
                                            { label: 'Owner Name', value: selectedRequest.ownerName },
                                            { label: 'Email Address', value: selectedRequest.email },
                                            { label: 'Contact Number', value: selectedRequest.mobile },
                                            { label: 'Emergency Number', value: selectedRequest.emergencyMobile },
                                        ].map((item, i) => (
                                            <div key={i} className="kyc-info-item">
                                                <label>{item.label}</label>
                                                <div className="kyc-info-value">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Location */}
                                <div className="kyc-section">
                                    <h4 className="kyc-section-header">
                                        <MapPin size={15} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#6366f1' }} />
                                        Location Details
                                    </h4>
                                    <div className="kyc-info-grid">
                                        <div className="kyc-info-item span-2">
                                            <label>Street Address</label>
                                            <div className="kyc-info-value">{selectedRequest.address}</div>
                                        </div>
                                        <div className="kyc-info-item">
                                            <label>City / State</label>
                                            <div className="kyc-info-value">{selectedRequest.city}, {selectedRequest.state}</div>
                                        </div>
                                        <div className="kyc-info-item">
                                            <label>Country / Pincode</label>
                                            <div className="kyc-info-value">{selectedRequest.country} — {selectedRequest.pincode}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section: Bank */}
                                <div className="kyc-section">
                                    <h4 className="kyc-section-header">
                                        <CreditCard size={15} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#6366f1' }} />
                                        Bank Information
                                    </h4>
                                    <div className="kyc-info-grid">
                                        {[
                                            { label: 'Bank Name', value: selectedRequest.bankDetails.bankName },
                                            { label: 'Account Holder', value: selectedRequest.bankDetails.accountName },
                                            { label: 'Account Number', value: selectedRequest.bankDetails.accountNumber },
                                            { label: 'IFSC Code', value: selectedRequest.bankDetails.ifsc },
                                        ].map((item, i) => (
                                            <div key={i} className="kyc-info-item">
                                                <label>{item.label}</label>
                                                <div className="kyc-info-value">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Documents */}
                                <div className="kyc-section">
                                    <h4 className="kyc-section-header">
                                        <FileText size={15} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: '#6366f1' }} />
                                        Submitted Documents
                                    </h4>
                                    <div className="kyc-docs-list">
                                        {selectedRequest.documents.map((doc, idx) => {
                                            return (
                                                <div key={idx} className="doc-card">
                                                    <div className="doc-info">
                                                        <div className="doc-icon-box">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <div className="doc-type">{doc.type}</div>
                                                            <div className="doc-meta">ID: {doc.id}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div className="doc-actions">
                                                            <button className="icon-btn-sm" title="View Document" onClick={() => window.open('#', '_blank')}>
                                                                <Eye size={15} />
                                                            </button>
                                                            <button className="icon-btn-sm" title="Download">
                                                                <Download size={15} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Rejection Notice */}
                                    {selectedRequest.rejectionReason && (
                                        <div className="rejection-notice">
                                            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <div>
                                                <div className="rejection-title">Previous Rejection Reason</div>
                                                <div className="rejection-text">{selectedRequest.rejectionReason}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Actions */}
                            {selectedRequest.status === 'Pending' && (
                                <div className="kyc-footer">
                                    <button className="kyc-btn-approve" onClick={() => handleApprove(selectedRequest.id)}>
                                        <CheckCircle size={17} /> Approve KYC
                                    </button>
                                    <button className="kyc-btn-reject" onClick={() => handleReject(selectedRequest.id)}>
                                        <XCircle size={17} /> Reject
                                    </button>
                                </div>
                            )}

                            {selectedRequest.status !== 'Pending' && (
                                <div className={`kyc-status-banner ${selectedRequest.status === 'Approved' ? 'banner-approved' : 'banner-rejected'}`}>
                                    {selectedRequest.status === 'Approved'
                                        ? <ShieldCheck size={20} />
                                        : <XCircle size={20} />}
                                    This verification is {selectedRequest.status}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="kyc-empty-state">
                            <div className="kyc-empty-icon">
                                <ShieldCheck size={36} />
                            </div>
                            <h3 style={{ margin: '0 0 8px', fontWeight: 800, color: '#1e293b' }}>Select a Request</h3>
                            <p style={{ maxWidth: '280px', lineHeight: 1.6, margin: 0, fontSize: '14px' }}>
                                Select a vendor from the list to review their KYC documents and verify registration.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorKYC;
