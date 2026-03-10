import React from 'react';
import { X, Tag, Archive, DollarSign, FileText, CheckCircle2, Briefcase, Package } from 'lucide-react';
import productFields from '../config/fields';
import '../product.css';

const ProductView = ({ product, onClose }) => {
    if (!product) return null;

    const sections = [
        { key: 'basicInfo', label: 'Basic Information', icon: <Briefcase size={20} /> },
        { key: 'pricing', label: 'Pricing & Discount', icon: <DollarSign size={20} /> },
        { key: 'inventory', label: 'Inventory Details', icon: <Archive size={20} /> },
        { key: 'specifications', label: 'Specifications', icon: <Tag size={20} /> },
        { key: 'manufacturing', label: 'Manufacturing', icon: <FileText size={20} /> },
        { key: 'returnPolicy', label: 'Return Policy', icon: <CheckCircle2 size={20} /> }
    ];

    const getFieldValue = (field) => {
        const val = product[field.name];
        if (field.type === 'checkbox') return val ? 'Yes' : 'No';
        if (!val || val === '--') return 'N/A';
        return val;
    };

    return (
        <div className="product-view-overlay" onClick={onClose}>
            <div className="product-view-modal" onClick={e => e.stopPropagation()}>
                <div className="view-modal-header">
                    <div className="header-left">
                        <div className="header-icon-box">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2>Product Overview</h2>
                            <p className="item-id-tag">ID: {product.itemId || 'PENDING'}</p>
                        </div>
                    </div>
                    <button className="view-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="view-modal-body">
                    {/* Image Strip */}
                    <div className="view-media-strip">
                        <div className="strip-header">
                            <Tag size={16} />
                            <span>Product Gallery</span>
                        </div>
                        <div className="image-scroll-container">
                            {product.images && product.images.length > 0 ? (
                                product.images.map((img, idx) => (
                                    <div key={idx} className="view-image-card">
                                        <img src={img.preview || img} alt={`Product ${idx}`} />
                                    </div>
                                ))
                            ) : (
                                <div className="no-image-placeholder">
                                    <span>No Images Available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Unified Single Column Details */}
                    <div className="view-details-stack">
                        {sections.map(section => (
                            <div key={section.key} className="view-detail-section">
                                <div className="section-title-box">
                                    {section.icon}
                                    <span>{section.label}</span>
                                </div>
                                <div className="section-content-grid">
                                    {productFields[section.key]?.map(field => {
                                        if (field.condition && product[field.condition.field] !== field.condition.value) return null;

                                        return (
                                            <div key={field.name} className="view-info-item">
                                                <label>{field.label}</label>
                                                <span className="info-value">{getFieldValue(field)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView;
