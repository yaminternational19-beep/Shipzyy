import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const BannerForm = ({ initialData, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        banner_name: '',
        description: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                banner_name: initialData.banner_name || '',
                description: initialData.description || ''
            });

            if (initialData.banner_image) {
                setImagePreview(initialData.banner_image);
            }
        } else {
            setFormData({ banner_name: '', description: '' });
            setImageFile(null);
            setImagePreview(null);
            setErrors({});
        }
    }, [initialData]);

    const validate = () => {
        const newErrors = {};
        if (!formData.banner_name.trim()) newErrors.banner_name = 'Banner name is required';
        if (!imageFile && !imagePreview) newErrors.banner_image = 'Banner image is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
            setErrors(prev => ({ ...prev, banner_image: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        try {
            await onSave({ ...formData, imageFile });
        } catch {
            // error handled in parent
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="vendor-modal-overlay">
            <div className="vendor-modal-card">

                <div className="vendor-modal-header">
                    <h3>{initialData ? 'Edit Banner' : 'Add New Banner'}</h3>
                    <button className="icon-btn-sm" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="vendor-modal-body">

                        <div className="vendor-form-group vendor-form-group-full">
                            <label className="vendor-label">Banner Name <span className="vendor-required-star">*</span></label>
                            <input
                                type="text"
                                className={`vendor-input${errors.banner_name ? ' error' : ''}`}
                                placeholder="e.g. Summer Sale, Front Page Hero"
                                value={formData.banner_name}
                                onChange={(e) => setFormData({ ...formData, banner_name: e.target.value })}
                            />
                            {errors.banner_name && <span className="vendor-field-error">{errors.banner_name}</span>}
                        </div>

                        <div className="vendor-form-group vendor-form-group-full">
                            <label className="vendor-label">Banner Image <span className="vendor-required-star">*</span></label>
                            <div className={`vendor-upload-zone ${errors.banner_image ? 'error-border' : ''}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="vendor-upload-preview"
                                        style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className="vendor-upload-icon-wrapper">
                                        <Upload size={20} color="var(--primary-color)" />
                                    </div>
                                )}
                                <span className="vendor-upload-text">
                                    {imagePreview ? 'Click to change image' : 'Upload banner image'}
                                </span>
                                <span className="vendor-upload-hint">SVG, PNG, JPG (max 2MB)</span>
                            </div>
                            {errors.banner_image && <span className="vendor-field-error">{errors.banner_image}</span>}
                        </div>

                        <div className="vendor-form-group vendor-form-group-full">
                            <label className="vendor-label">Description</label>
                            <textarea
                                className="vendor-input"
                                rows="3"
                                placeholder="Brief details or internal notes about this banner..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                    </div>

                    <div className="vendor-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Banner'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default BannerForm;
