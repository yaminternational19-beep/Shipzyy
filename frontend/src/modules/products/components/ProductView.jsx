import React, { useEffect, useState } from 'react';
import { X, Tag, Archive, DollarSign, FileText, CheckCircle2, Briefcase, Package, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getProductByIdApi } from '../../../api/admin_products.api';
import './ProductView.css';

const ProductView = ({ productId, onClose }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await getProductByIdApi(productId);
                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setError('Failed to fetch product details');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('An error occurred while fetching product details');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="product-view-overlay">
                <div className="product-view-modal loading">
                    <div className="loading-spinner"></div>
                    <p>Loading Product details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-view-overlay" onClick={onClose}>
                <div className="product-view-modal" onClick={e => e.stopPropagation()}>
                    <div className="view-modal-header">
                        <h2>Error</h2>
                        <button className="view-close-btn" onClick={onClose}><X size={20} /></button>
                    </div>
                    <div className="view-modal-body">
                        <p style={{ color: '#ef4444', textAlign: 'center' }}>{error || 'Product not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    const sections = [
        { 
            key: 'basicInfo', 
            label: 'Basic Information', 
            icon: <Briefcase size={20} />,
            fields: [
                { label: 'Category', value: product.category_name },
                { label: 'Sub Category', value: product.subcategory_name || 'N/A' },
                { label: 'Product Name', value: product.name },
                { label: 'Brand', value: product.brand_name || product.custom_brand || 'N/A' },
                { label: 'Description', value: product.description, fullWidth: true },
                { label: 'Specifications', value: product.specification?.details?.join(', ') || 'N/A', fullWidth: true }
            ]
        },
        { 
            key: 'pricing', 
            label: 'Pricing & Summary', 
            icon: <DollarSign size={20} />,
            fields: [
                { label: 'Base MRP', value: `₹${product.inventory_summary?.min_mrp}` },
                { label: 'Selling Price', value: `₹${product.inventory_summary?.min_price}` },
                { label: 'Total Stock', value: `${product.inventory_summary?.total_stock} Units` },
                { label: 'Max Discount', value: product.inventory_summary?.max_discount !== "0.00" ? `${product.inventory_summary?.max_discount}%` : 'None' }
            ]
        },
        { 
            key: 'vendor', 
            label: 'Vendor Details', 
            icon: <User size={20} />,
            fields: [
                { label: 'Company Name', value: product.vendor_name },
                { label: 'Owner Name', value: product.vendor_owner_name },
                { label: 'Email', value: product.vendor_email },
                { label: 'Contact', value: `${product.vendor_country_code} ${product.vendor_mobile}` }
            ]
        },
        { 
            key: 'approval', 
            label: 'Approval Status', 
            icon: product.approval_status === 'APPROVED' ? <CheckCircle size={20} /> : (product.rejection_reason ? <XCircle size={20} /> : <Clock size={20} />),
            fields: [
                { label: 'Status', value: product.approval_status },
                { label: 'Live Status', value: product.is_live ? 'LIVE' : 'HIDDEN' },
                { label: 'Approved At', value: product.approved_at || '--' },
                { label: 'Rejection Reason', value: product.rejection_reason || 'N/A', condition: !!product.rejection_reason }
            ]
        },
        { 
            key: 'manufacturing', 
            label: 'Manufacturing & Returns', 
            icon: <FileText size={20} />,
            fields: [
                { label: 'Made In', value: product.country_of_origin },
                { label: 'MFG Date', value: product.manufacture_date },
                { label: 'Expiry Date', value: product.expiry_date },
                { label: 'Return Allowed', value: product.return_allowed ? 'Yes' : 'No' },
                { label: 'Return Days', value: product.return_allowed ? `${product.return_days} Days` : 'N/A' }
            ]
        }
    ];

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
                            <p className="item-id-tag">ID: #{product.id}</p>
                        </div>
                    </div>
                    <button className="view-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="view-modal-body">
                    {/* Gallery */}
                    <div className="view-media-strip">
                        <div className="strip-header">
                            <Tag size={16} />
                            <span>Product Gallery</span>
                        </div>
                        <div className="image-scroll-container">
                            {product.images && product.images.length > 0 ? (
                                product.images.map((img) => (
                                    <div key={img.id} className="view-image-card">
                                        <img src={img.image_url} alt="Product" />
                                        {img.is_primary === 1 && <span className="primary-badge">PRIMARY</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="no-image-placeholder">
                                    <span>No Images Available</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="view-details-stack">
                        {sections.map(section => (
                            <div key={section.key} className="view-detail-section">
                                <div className="section-title-box">
                                    {section.icon}
                                    <span>{section.label}</span>
                                </div>
                                <div className="section-content-grid">
                                    {section.fields.map((field, idx) => {
                                        if (field.condition === false) return null;
                                        return (
                                            <div key={idx} className={`view-info-item ${field.fullWidth ? 'full-width' : ''}`}>
                                                <label>{field.label}</label>
                                                <span className="info-value">{field.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Variants Table */}
                        <div className="view-detail-section">
                            <div className="section-title-box">
                                <Archive size={20} />
                                <span>Product Variants</span>
                            </div>
                            <div className="variants-table-container">
                                <table className="compact-variant-table">
                                    <thead>
                                        <tr>
                                            <th>Variant</th>
                                            <th>SKU</th>
                                            <th>MRP</th>
                                            <th>Sale Price</th>
                                            <th>Stock</th>
                                            <th>Unit</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants?.map(v => (
                                            <tr key={v.id}>
                                                <td>{v.variant_name}</td>
                                                <td>{v.sku}</td>
                                                <td>₹{v.mrp}</td>
                                                <td>₹{v.sale_price}</td>
                                                <td>{v.stock}</td>
                                                <td>{v.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView;
