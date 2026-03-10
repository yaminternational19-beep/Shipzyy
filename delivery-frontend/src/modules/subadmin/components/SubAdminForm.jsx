import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, User, Mail, Globe, ShieldAlert, BadgeCheck, Activity, Hash, Lock, Eye, EyeOff } from 'lucide-react';
import { Country, State } from 'country-state-city';


import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { menuItems } from '../../../utils/menuConfig';


const SubAdminForm = ({ user, onClose, onSave }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(() => {
        if (user) {
            let role = user.role || menuItems[0]?.name;
            const matchedRole = menuItems.find(item => item.name.toLowerCase() === role.toLowerCase() || item.key.toLowerCase() === role.toLowerCase());
            role = matchedRole ? matchedRole.name : (menuItems.find(m => m.name === 'Sub-Admins')?.name || menuItems[0]?.name);

            let countryIso = user.countryIso || 'IN';
            let countryName = user.country || 'India';
            if (!user.countryIso && user.country) {
                const c = Country.getAllCountries().find(item => item.name === user.country);
                if (c) countryIso = c.isoCode;
            }

            let stateIso = user.stateIso || '';
            if (!user.stateIso && user.state && countryIso) {
                const s = State.getStatesOfCountry(countryIso).find(item => item.name === user.state);
                if (s) stateIso = s.isoCode;
            }

            return {
                ...user,
                countryCode: user.countryCode || user.country_code || '+91',
                mobile: user.mobile || '',
                emergencyCountryCode: user.emergencyCountryCode || user.emergency_country_code || '+91',
                emergencyMobile: user.emergencyMobile || user.emergency_mobile || '',
                role: role,
                pincode: user.pincode || '',
                country: countryName,
                countryIso: countryIso,
                stateIso: stateIso,
                state: user.state || '',
                address: user.address || '',
                profilePhoto: user.profilePhoto || user.photo || '',
                profilePhotoKey: user.profilePhotoKey || '',
                password: ''
            };
        }
        return {
            name: '',
            email: '',
            countryCode: '+91',
            mobile: '',
            address: '',
            state: '',
            country: 'India',
            countryIso: 'IN',
            stateIso: '',
            pincode: '',
            emergencyCountryCode: '+91',
            emergencyMobile: '',
            password: '',
            status: 'Active',
            role: menuItems.find(m => m.name === 'Sub-Admins')?.name || menuItems[0]?.name,
            profilePhoto: '',
            profilePhotoKey: '',
            photoFile: null
        }
    });

    const [states, setStates] = useState([]);

    useEffect(() => {
        if (formData.countryIso) {
            const countryStates = State.getStatesOfCountry(formData.countryIso);
            setStates(countryStates);
        }
    }, [formData.countryIso]);


    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'countryCode', label: 'Country Code' },
            { key: 'mobile', label: 'Mobile' },
            { key: 'address', label: 'Address' },
            { key: 'state', label: 'State' },
            { key: 'country', label: 'Country' },
            { key: 'status', label: 'Status' },
            { key: 'role', label: 'Role' },
        ];

        if (!user) {
            requiredFields.push({ key: 'password', label: 'Password' });
        }

        requiredFields.forEach(field => {
            if (!formData[field.key] || formData[field.key].toString().trim() === '') {
                newErrors[field.key] = `${field.label} is required`;
            }
        });

        if (!user && !formData.photoFile) {
            newErrors.profilePhoto = "Profile photo is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('countryCode', formData.countryCode);
        data.append('mobile', formData.mobile);
        data.append('address', formData.address);
        data.append('state', formData.state);
        data.append('country', formData.country);
        data.append('pincode', formData.pincode);
        data.append('emergencyCountryCode', formData.emergencyCountryCode);
        data.append('emergencyMobile', formData.emergencyMobile);
        data.append('status', formData.status);
        data.append('role', formData.role);

        if (formData.password) {
            data.append('password', formData.password);
        }

        if (formData.photoFile) {
            data.append('profilePhoto', formData.photoFile);
        } else if (user && formData.profilePhoto) {
            // Keep existing photo if no new photo is uploaded
            data.append('profilePhoto', formData.profilePhoto);
            if (formData.profilePhotoKey) {
                data.append('profilePhotoKey', formData.profilePhotoKey);
            }
        }

        onSave(data);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                setErrors({ ...errors, profilePhoto: "Only jpg, jpeg, or png files are allowed" });
                return;
            }

            setFormData({
                ...formData,
                profilePhoto: URL.createObjectURL(file),
                photoFile: file
            });
            // Clear photo error if any
            const newErrors = { ...errors };
            delete newErrors.profilePhoto;
            setErrors(newErrors);
        }
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{user ? 'Edit Sub-Admin Details' : 'Add New Sub-Admin'}</h3>
                    <button className="icon-btn" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                            <div className={`profile-photo-upload ${errors.profilePhoto ? 'profile-photo-error' : ''}`}>
                                {formData.profilePhoto ? (
                                    <img src={formData.profilePhoto} alt="Profile" className="preview-photo" />
                                ) : (
                                    <div className="photo-placeholder"><User size={40} /></div>
                                )}
                                <label className="upload-badge">
                                    <Camera size={16} />
                                    <input type="file" hidden onChange={handlePhotoUpload} accept="image/jpeg,image/jpg,image/png" />
                                </label>
                            </div>
                        </div>
                        {errors.profilePhoto && <div style={{ textAlign: 'center', marginBottom: '16px' }}><span className="error-text">{errors.profilePhoto}</span></div>}

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <div className="input-with-icon">
                                    <User size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, name: val });
                                            if (errors.name) {
                                                const newErrors = { ...errors };
                                                delete newErrors.name;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.name ? 'input-error' : ''}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <Mail size={18} className="field-icon" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, email: val });
                                            if (errors.email) {
                                                const newErrors = { ...errors };
                                                delete newErrors.email;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.email ? 'input-error' : ''}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                {errors.email && <span className="error-text">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>{user ? 'New Password (leave blank to keep current)' : 'Login Password'}</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="field-icon" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, password: val });
                                            if (errors.password) {
                                                const newErrors = { ...errors };
                                                delete newErrors.password;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.password ? 'input-error' : ''}
                                        placeholder="••••••••"
                                        required={!user}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex="-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.password && <span className="error-text">{errors.password}</span>}
                            </div>
                            <div className="form-group">
                                <label>Mobile Number</label>
                                <PhoneInput
                                    country={'in'}
                                    value={formData.countryCode + formData.mobile}
                                    onChange={(value, data) => {
                                        const dialCode = `+${data.dialCode}`;
                                        const mobileNumber = value.startsWith(data.dialCode)
                                            ? value.slice(data.dialCode.length)
                                            : value;
                                        setFormData({
                                            ...formData,
                                            countryCode: dialCode,
                                            mobile: mobileNumber
                                        });
                                        if (errors.mobile || errors.countryCode) {
                                            const newErrors = { ...errors };
                                            delete newErrors.mobile;
                                            delete newErrors.countryCode;
                                            setErrors(newErrors);
                                        }
                                    }}
                                    enableSearch={true}
                                    containerClass="mobile-phone-input"
                                    inputClass={`phone-field ${errors.mobile ? 'input-error' : ''}`}
                                    buttonClass="country-dropdown-btn"
                                    dropdownClass="country-dropdown-list"
                                    placeholder="Primary Phone"
                                    required
                                />
                                {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                            </div>

                            <div className="form-group">
                                <label>Emergency Number</label>
                                <PhoneInput
                                    country={'in'}
                                    value={formData.emergencyCountryCode + formData.emergencyMobile}
                                    onChange={(value, data) => {
                                        const dialCode = `+${data.dialCode}`;
                                        const mobileNumber = value.startsWith(data.dialCode)
                                            ? value.slice(data.dialCode.length)
                                            : value;
                                        setFormData({
                                            ...formData,
                                            emergencyCountryCode: dialCode,
                                            emergencyMobile: mobileNumber
                                        });
                                        if (errors.emergencyMobile || errors.emergencyCountryCode) {
                                            const newErrors = { ...errors };
                                            delete newErrors.emergencyMobile;
                                            delete newErrors.emergencyCountryCode;
                                            setErrors(newErrors);
                                        }
                                    }}
                                    enableSearch={true}
                                    containerClass="mobile-phone-input"
                                    inputClass={`phone-field ${errors.emergencyMobile ? 'input-error' : ''}`}
                                    buttonClass="country-dropdown-btn"
                                    dropdownClass="country-dropdown-list"
                                    placeholder="Emergency Contact"
                                />
                                {errors.emergencyMobile && <span className="error-text">{errors.emergencyMobile}</span>}
                            </div>

                            <div className="form-group">
                                <label>Assigned Role</label>
                                <div className="input-with-icon">
                                    <BadgeCheck size={18} className="field-icon" />
                                    <select
                                        value={formData.role}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, role: val });
                                            if (errors.role) {
                                                const newErrors = { ...errors };
                                                delete newErrors.role;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.role ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        <option value="Sub Admin">Sub Admin</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Support">Support</option>
                                    </select>
                                </div>
                                {errors.role && <span className="error-text">{errors.role}</span>}
                            </div>

                            <div className="form-group">
                                <label>Account Status</label>
                                <div className="input-with-icon">
                                    <Activity size={18} className="field-icon" />
                                    <select
                                        value={formData.status}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, status: val });
                                            if (errors.status) {
                                                const newErrors = { ...errors };
                                                delete newErrors.status;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.status ? 'input-error' : ''}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                {errors.status && <span className="error-text">{errors.status}</span>}
                            </div>


                        </div>

                        <div className="form-section-title">Address Information</div>

                        <div className="form-group">
                            <label>Door No / Street Address</label>
                            <div className="input-with-icon">
                                <MapPin size={18} className="field-icon" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, address: val });
                                        if (errors.address) {
                                            const newErrors = { ...errors };
                                            delete newErrors.address;
                                            setErrors(newErrors);
                                        }
                                    }}
                                    className={errors.address ? 'input-error' : ''}
                                    placeholder="House/Office No, Street, Area..."
                                    required
                                />
                            </div>
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Country</label>
                                <div className="input-with-icon">
                                    <Globe size={18} className="field-icon" />
                                    <select
                                        value={formData.countryIso}
                                        onChange={(e) => {
                                            const selectedCountry = Country.getCountryByCode(e.target.value);
                                            setFormData({
                                                ...formData,
                                                countryIso: e.target.value,
                                                country: selectedCountry.name,
                                                state: '',
                                                stateIso: ''
                                            });
                                            if (errors.country) {
                                                const newErrors = { ...errors };
                                                delete newErrors.country;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.country ? 'input-error' : ''}
                                        required
                                    >
                                        <option value="">Select Country</option>
                                        {Country.getAllCountries().map(c => (
                                            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.country && <span className="error-text">{errors.country}</span>}
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <select
                                    value={formData.stateIso}
                                    onChange={(e) => {
                                        const selectedState = states.find(s => s.isoCode === e.target.value);
                                        setFormData({
                                            ...formData,
                                            stateIso: e.target.value,
                                            state: selectedState ? selectedState.name : ''
                                        });
                                        if (errors.state) {
                                            const newErrors = { ...errors };
                                            delete newErrors.state;
                                            setErrors(newErrors);
                                        }
                                    }}
                                    className={errors.state ? 'input-error' : ''}
                                    required
                                >
                                    <option value="">Select State</option>
                                    {states.map(s => (
                                        <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                                    ))}
                                </select>
                                {errors.state && <span className="error-text">{errors.state}</span>}
                            </div>
                        </div>

                        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="form-group">
                                <label>Pincode / Zip Code</label>
                                <div className="input-with-icon">
                                    <Hash size={18} className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.pincode}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData({ ...formData, pincode: val });
                                            if (errors.pincode) {
                                                const newErrors = { ...errors };
                                                delete newErrors.pincode;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        className={errors.pincode ? 'input-error' : ''}
                                        placeholder="Enter Pincode"
                                    />
                                </div>
                                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                            </div>
                        </div>




                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button type="button" className="action-btn secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                            <button type="submit" className="action-btn primary" style={{ flex: 2 }}>{user ? 'Update Details' : 'Save Sub-Admin'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SubAdminForm;
