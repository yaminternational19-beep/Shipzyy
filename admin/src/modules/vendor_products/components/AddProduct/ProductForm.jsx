import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Briefcase, Tag, Archive, DollarSign, FileText, CheckCircle2 } from 'lucide-react';
import productFields from '../../config/fields';
import '../../product.css';
import { createProductAPI, updateProductAPI } from '../../../../api/product.api';
import { getCategoriesApi } from '../../../../api/categories.api';
import { getSubCategoriesApi } from '../../../../api/subcategory.api';
import { getBrandsApi } from '../../../../api/brands.api';

const ProductForm = ({ onSave, showToast, initialData = null }) => {
    // Initialize state dynamically from fields.js
    const getInitialState = () => {
        if (initialData) {
            // Map specification if it's an object/array
            let specStr = initialData.specification || '';
            if (typeof specStr === 'object' && specStr !== null) {
                if (Array.isArray(specStr.details)) {
                    specStr = specStr.details.join('\n');
                } else {
                    specStr = JSON.stringify(specStr);
                }
            }

            const mappedImages = (initialData.images || []).map((img, i) => {
                const url = typeof img === 'string' ? img : (img.image_url || '');
                return {
                    id: `existing-${i}`,
                    file: null,
                    preview: url,
                    image_url: url
                };
            });
            return { 
                ...initialData, 
                specification: specStr,
                images: mappedImages 
            };
        }

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

    const [rawCategories, setRawCategories] = useState([]);
    const [rawSubCategories, setRawSubCategories] = useState([]);
    const [rawBrands, setRawBrands] = useState([]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [catRes, subRes, brandRes] = await Promise.all([
                    getCategoriesApi(),
                    getSubCategoriesApi(),
                    getBrandsApi()
                ]);
                
                const cats = catRes.data?.data?.records || catRes.data?.records || catRes.data || [];
                const subs = subRes.data?.data?.records || subRes.data?.records || subRes.data || [];
                const brnds = brandRes.data?.data?.records || brandRes.data?.records || brandRes.data || [];

                setRawCategories(Array.isArray(cats) ? cats : []);
                setRawSubCategories(Array.isArray(subs) ? subs : []);
                setRawBrands(Array.isArray(brnds) ? brnds : []);
            } catch (err) {
                console.error("Failed to load form dropdowns:", err);
            }
        };
        fetchDropdownData();
    }, []);

    // Sync state if initialData changes (for editing) - Using the same logic as getInitialState
    useEffect(() => {
        if (initialData) {
            setFormData(getInitialState());
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

    const handleChange = (name, value) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            
            // Interactive bidirectional pricing calculation rules
            if (name === 'mrp' || name === 'discount_value') {
                const mrp = name === 'mrp' ? Number(value) : Number(prev.mrp) || 0;
                const disc = name === 'discount_value' ? Number(value) : Number(prev.discount_value) || 0;
                updated.sale_price = Math.max(0, mrp - (mrp * disc / 100)).toFixed(2);
            } else if (name === 'sale_price') {
                const sale = Number(value) || 0;
                const mrp = Number(prev.mrp) || 0;
                if (mrp > 0 && sale <= mrp) {
                    updated.discount_value = Math.max(0, ((mrp - sale) / mrp) * 100).toFixed(2);
                } else {
                    updated.discount_value = 0;
                }
            }
            
            if (name === 'brand_id' && value !== 'Other') {
                updated.custom_brand = '';
            }
            if (name === 'category_id') updated.subcategory_id = '';
            
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
        const requiredFields = [
            'name', 'description', 
            'specification', 'mrp', 'stock', 
            'min_order', 'variant_name'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] && formData[field] !== 0) {
                newErrors[field] = 'This field is required';
            }
        });

        // Brand is now optional per USER_REQUEST
        if (formData.brand_id === 'Other' && (!formData.custom_brand || !formData.custom_brand.trim())) {
            newErrors['custom_brand'] = 'Custom brand name is required when "Other" is selected';
        }

        if ((formData.images || []).length === 0) {
            showToast('Please upload at least one image', 'error');
            return false;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildProductPayload = (data) => {
        const payloadData = new FormData();

        // Removed vendor_id: Backend now takes it from the token
        payloadData.append('category_id', data.category_id ?? '');
        payloadData.append('subcategory_id', data.subcategory_id ?? '');
        payloadData.append('name', data.name || '');
        payloadData.append('description', data.description || '');
        
        const isOtherBrand = data.brand_id === 'Other';
        payloadData.append('brand_id', isOtherBrand ? '' : (data.brand_id ?? ''));
        payloadData.append('custom_brand', isOtherBrand ? (data.custom_brand ?? '') : '');

        const specData = { details: data.specification ? data.specification.split('\n') : [] };
        payloadData.append('specification', JSON.stringify(specData));

        payloadData.append('country_of_origin', data.country_of_origin || '');
        payloadData.append('manufacture_date', data.manufacture_date || '');
        payloadData.append('expiry_date', data.expiry_date || '');
        
        const isReturnAllowed = data.return_allowed === true || String(data.return_allowed).toLowerCase() === 'true' || Number(data.return_allowed) === 1;
        payloadData.append('return_allowed', isReturnAllowed ? 'true' : 'false');
        payloadData.append('return_days', isReturnAllowed ? (Number(data.return_days) || 0) : 0);

        // VARIANT FIELDS (Flattened)
        payloadData.append('variant_name', data.variant_name || 'Standard');
        payloadData.append('unit', data.unit || 'PCS');
        payloadData.append('color', data.color || 'N/A');
        payloadData.append('sku', data.sku || '');
        payloadData.append('mrp', Number(data.mrp) || 0);
        payloadData.append('sale_price', Number(data.sale_price) || 0);
        payloadData.append('discount_value', Number(data.discount_value) || 0);
        payloadData.append('discount_type', 'Percent');
        payloadData.append('stock', Number(data.stock) || 0);
        payloadData.append('min_order', Number(data.min_order) || 1);
        payloadData.append('low_stock_alert', Number(data.low_stock_alert) || 5);

        if (data.images && data.images.length > 0) {
            const existingUrls = [];
            data.images.forEach(img => {
                if (img.file) {
                    payloadData.append('images', img.file);
                } else if (img.image_url) {
                    existingUrls.push({
                        image_url: img.image_url,
                        is_primary: data.images[0].id === img.id,
                        sort_order: data.images.indexOf(img)
                    });
                }
            });
            if (existingUrls.length > 0) {
                payloadData.append('images', JSON.stringify(existingUrls));
            }
        }

        return payloadData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            try {
                const payload = buildProductPayload(formData);
                const isUpdate = !!initialData?.id;
                
                if (isUpdate) {
                    await updateProductAPI(initialData.id, payload);
                    showToast('Product updated successfully!', 'success');
                } else {
                    await createProductAPI(payload);
                    showToast('Product added successfully!', 'success');
                }
                
                onSave(); 
            } catch (error) {
                const backendMsg = error.response?.data?.message || 'Failed to process product. Please try again.';
                showToast(backendMsg, 'error');
                console.error('API Error:', error);
            }
        } else {
            showToast('Missing Fields: Please fill out all required attributes highlighted in red', 'error');
        }
    };

    // Get specific options for selects
    const getOptions = (fieldName) => {
        if (fieldName === 'category_id') {
            return rawCategories.map(c => ({ value: c.id, label: c.name }));
        }
        if (fieldName === 'subcategory_id') {
            return rawSubCategories
                .filter(s => (s.categoryId || s.category_id) === Number(formData.category_id))
                .map(s => ({ value: s.id, label: s.name }));
        }
        if (fieldName === 'brand_id') {
            const mappedBrands = rawBrands.map(b => ({ value: b.id, label: b.name }));
            mappedBrands.push({ value: 'Other', label: 'Other' });
            return mappedBrands;
        }

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
            disabled: field.readOnly || (field.name === 'subcategory_id' && !formData.category_id)
        };

        switch (field.type) {
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select {field.label}</option>
                        {getOptions(field.name).map((opt, i) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return (
                                <option key={i} value={val}>{lbl}</option>
                            );
                        })}
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
                        <span>{initialData ? 'Update Product' : 'Add Product'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
