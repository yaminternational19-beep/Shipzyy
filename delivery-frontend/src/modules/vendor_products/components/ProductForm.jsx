import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Briefcase, Tag, Archive, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import productFields from '../config/fields';
import '../product.css';

const ProductForm = ({ onSave, showToast, categories = {}, brands = [], initialData = null }) => {
    // Initialize state dynamically from fields.js
    const getInitialState = () => {
        if (initialData) return { images: [], ...initialData };

        const state = { images: [] };
        Object.values(productFields).forEach(section => {
            section.forEach(field => {
                state[field.name] = field.type === 'checkbox' ? false : '';
            });
        });
        return state;
    };

    const [formData, setFormData] = useState(getInitialState());
    const [errors, setErrors] = useState({});

    // Sync state if initialData changes (for editing)
    useEffect(() => {
        if (initialData) {
            setFormData({ images: [], ...initialData });
        }
    }, [initialData]);

    // Handle Image upload (Max 5 as requested by USER)
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const currentImages = formData.images || [];
        if (currentImages.length + files.length > 10) {
            showToast('Maximum 10 images allowed', 'error');
            return;
        }

        const newImages = files.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file: file,
            preview: URL.createObjectURL(file)
        }));

        setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...newImages] }));
    };

    const removeImage = (id) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).filter(img => img.id !== id)
        }));
    };

    // Auto-calculation logic for Selling Price
    useEffect(() => {
        const { price, discountType, discountValue } = formData;
        if (!price) return;

        let sellingPrice = Number(price);
        if (discountType === 'Percentage' && discountValue) {
            sellingPrice = price - (price * Number(discountValue) / 100);
        } else if (discountType === 'Flat' && discountValue) {
            sellingPrice = price - Number(discountValue);
        }

        if (sellingPrice !== Number(formData.salePrice)) {
            setFormData(prev => ({ ...prev, salePrice: Math.max(0, sellingPrice).toFixed(2) }));
        }
    }, [formData.price, formData.discountType, formData.discountValue]);

    const handleChange = (name, value) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            // Auto-clear subcategory if category changes
            if (name === 'category') updated.subCategory = '';
            return updated;
        });

        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const validate = () => {
        const newErrors = {};
        Object.values(productFields).forEach(section => {
            section.forEach(field => {
                if (field.required && !formData[field.name]) {
                    newErrors[field.name] = `${field.label} is required`;
                }
            });
        });

        if ((formData.images || []).length === 0) {
            showToast('Please upload at least one image', 'error');
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
            showToast('Product saved successfully!', 'success');
        } else {
            showToast('Please fix the errors in the form', 'error');
        }
    };

    // Get specific options for selects
    const getOptions = (fieldName) => {
        if (fieldName === 'category') return Object.keys(categories);
        if (fieldName === 'subCategory') return categories[formData.category] || [];
        if (fieldName === 'brand') return brands;

        const field = Object.values(productFields).flat().find(f => f.name === fieldName);
        return field?.options || [];
    };

    const renderField = (field) => {
        // Condition check
        if (field.condition) {
            const dependVal = formData[field.condition.field];
            if (dependVal !== field.condition.value) return null;
        }

        const commonProps = {
            id: field.name,
            name: field.name,
            value: formData[field.name],
            onChange: (e) => handleChange(field.name, field.type === 'checkbox' ? e.target.checked : e.target.value),
            placeholder: field.placeholder,
            className: `dynamic-input ${errors[field.name] ? 'error-border' : ''}`,
            disabled: field.readOnly || (field.name === 'subCategory' && !formData.category)
        };

        switch (field.type) {
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {getOptions(field.name).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                );
            case 'textarea':
                return <textarea {...commonProps} rows="4" />;
            case 'checkbox':
                return (
                    <label className="checkbox-field">
                        <input type="checkbox" checked={formData[field.name]} onChange={commonProps.onChange} />
                        <span>{field.label}</span>
                    </label>
                );
            default:
                return <input type={field.type} {...commonProps} />;
        }
    };

    const sectionIcons = {
        basicInfo: <Briefcase size={20} />,
        pricing: <DollarSign size={20} />,
        inventory: <Archive size={20} />,
        specifications: <Tag size={20} />,
        manufacturing: <FileText size={20} />,
        returnPolicy: <CheckCircle2 size={20} />,
        visibility: <Tag size={20} />,
        seo: <FileText size={20} />
    };

    return (
        <div className="product-form-wrapper">
            <form onSubmit={handleSubmit}>
                {/* Image Upload Section - Always first */}
                <div className="form-section-container">
                    <div className="section-header">
                        <ImageIcon size={20} />
                        <span>Product Images (Max 10)</span>
                    </div>
                    <div className="media-section">
                        <div className="image-preview-grid">
                            {(formData.images || []).length < 10 && (
                                <label className="image-upload-box">
                                    <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                                    <Plus size={32} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Add Photo</span>
                                </label>
                            )}
                            {(formData.images || []).map((img) => (
                                <div key={img.id} className="image-thumb">
                                    <img src={img.preview} alt="Product" />
                                    <button type="button" className="btn-remove" onClick={() => removeImage(img.id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dynamic Sections from fields.js */}
                {Object.keys(productFields).map(key => (
                    <div key={key} className="form-section-container">
                        <div className="section-header">
                            {sectionIcons[key] || <Tag size={20} />}
                            <span style={{ textTransform: 'capitalize' }}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                        </div>
                        <div className="field-grid-layout">
                            {productFields[key].filter(field => {
                                if (field.condition) {
                                    const dependVal = formData[field.condition.field];
                                    return dependVal === field.condition.value;
                                }
                                return true;
                            }).map(field => (
                                <div
                                    key={field.name}
                                    className={`field-unit ${field.type === 'textarea' || field.fullWidth ? 'full-width' : ''}`}
                                >
                                    {field.type !== 'checkbox' && (
                                        <label htmlFor={field.name}>
                                            {field.label}
                                            {field.required && <span className="required-dot">*</span>}
                                        </label>
                                    )}
                                    {renderField(field)}
                                    {errors[field.name] && <span className="input-error-msg">{errors[field.name]}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <div className="form-actions-bar">
                    <button type="submit" className="submit-btn">
                        <Plus size={20} />
                        <span>Add Product</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
