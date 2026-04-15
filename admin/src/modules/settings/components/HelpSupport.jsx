import React, { useState, useEffect } from 'react';
import { Save, Mail, Phone, Clock, LifeBuoy, User, Plus } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import SettingTabs from './SettingTabs';
import ActionButtons from '../../../components/common/ActionButtons';
import { getHelpSupportContactsApi, updateHelpSupportContactsApi } from '../../../api/settings.api';

const HelpSupport = ({ onShowToast }) => {
    const [activeTab, setActiveTab] = useState('customer');
    const [loading, setLoading] = useState(false);
    
    const [supportData, setSupportData] = useState({
        customer: [],
        rider: [],
        vendor: []
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await getHelpSupportContactsApi();
            if (response.data.success) {
                const fetchedData = response.data.data;
                const newSupportData = {
                    customer: fetchedData.filter(d => d.role === 'customer').map(d => ({ name: d.name, email: d.email, country_code: d.country_code, phone_number: d.phone_number, working_hours: d.working_hours })),
                    rider: fetchedData.filter(d => d.role === 'rider').map(d => ({ name: d.name, email: d.email, country_code: d.country_code, phone_number: d.phone_number, working_hours: d.working_hours })),
                    vendor: fetchedData.filter(d => d.role === 'vendor').map(d => ({ name: d.name, email: d.email, country_code: d.country_code, phone_number: d.phone_number, working_hours: d.working_hours }))
                };
                // Fallback to defaults if fully empty
                if (newSupportData.customer.length === 0) newSupportData.customer.push({ name: '', email: '', country_code: '', phone_number: '', working_hours: '' });
                if (newSupportData.rider.length === 0) newSupportData.rider.push({ name: '', email: '', country_code: '', phone_number: '', working_hours: '' });
                if (newSupportData.vendor.length === 0) newSupportData.vendor.push({ name: '', email: '', country_code: '', phone_number: '', working_hours: '' });
                setSupportData(newSupportData);
            }
        } catch (error) {
            console.error("Error fetching support contacts:", error);
            onShowToast("Failed to load help support contacts", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (idx, field, value) => {
        setSupportData(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map((entry, i) =>
                i === idx ? { ...entry, [field]: value } : entry
            )
        }));
    };

    const handleAddInfo = () => {
        setSupportData(prev => ({
            ...prev,
            [activeTab]: [
                ...prev[activeTab],
                { name: '', email: '', country_code: '', phone_number: '', working_hours: '' }
            ]
        }));
    };

    const handleDelete = (idx) => {
        if (window.confirm('Are you sure you want to delete this contact entry?')) {
            setSupportData(prev => ({
                ...prev,
                [activeTab]: prev[activeTab].filter((_, i) => i !== idx)
            }));
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const currentContacts = supportData[activeTab];
            const response = await updateHelpSupportContactsApi(activeTab, currentContacts);
            if (response.data.success) {
                onShowToast(`Support settings for ${activeTab.toUpperCase()} updated!`, 'success');
            }
        } catch (error) {
            console.error("Error saving support settings:", error);
            onShowToast(error.response?.data?.message || `Failed to save ${activeTab.toUpperCase()} settings`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const currentInfo = supportData[activeTab] || [];

    return (
        <div className="settings-section help-support-manager" style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <SettingTabs activeTab={activeTab} onTabChange={setActiveTab} showAll={false} />
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleAddInfo} 
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                        disabled={loading}
                    >
                        <Plus size={16} /> Add info
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSave} 
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
            
            {loading && supportData[activeTab].length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    <p>Loading support configurations...</p>
                </div>
            ) : (
                <div className="settings-grid">
                    {currentInfo.map((entry, idx) => (
                        <div key={idx} style={{ marginBottom: '24px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfd' }}>
                                <h4 style={{ margin: 0, fontSize: '14px', color: '#64748b', fontWeight: 600 }}>{activeTab.toUpperCase()} SUPPORT RECORD #{idx + 1}</h4>
                                <ActionButtons 
                                    onDelete={idx === 0 && currentInfo.length === 1 ? null : () => handleDelete(idx)}
                                />
                            </div>
                            <div className="form-fields-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', padding: '24px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                                        <User size={16} color="#64748b" /> Name
                                    </label>
                                    <input 
                                        type="text"
                                        value={entry.name}
                                        onChange={e => handleChange(idx, 'name', e.target.value)}
                                        className="form-control"
                                        placeholder="Support Name"
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                                        <Mail size={16} color="#64748b" /> Email
                                    </label>
                                    <input 
                                        type="email"
                                        value={entry.email}
                                        onChange={e => handleChange(idx, 'email', e.target.value)}
                                        className="form-control"
                                        placeholder="support@domain.com"
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontWeight: 600,
                                            color: '#334155',
                                            marginBottom: '10px'
                                        }}
                                    >
                                        <Phone size={16} color="#64748b" /> Mobile Number
                                    </label>
    
                                    <PhoneInput
                                        country={'in'}
                                        value={(entry.country_code?.replace('+', '') || '') + (entry.phone_number || '')}
                                        onChange={(value, data) => {
                                            const countryCode = "+" + data.dialCode;
                                            const number = value.slice(data.dialCode.length);

                                            handleChange(idx, 'country_code', countryCode);
                                            handleChange(idx, 'phone_number', number);
                                        }}
                                        enableSearch={true}
                                        containerClass="mobile-phone-input"
                                        inputClass="phone-field"
                                        buttonClass="country-dropdown-btn"
                                        dropdownClass="country-dropdown-list"
                                        placeholder="Enter phone number"
                                        inputStyle={{
                                            width: '100%',
                                            height: '44px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1'
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#334155', marginBottom: '10px' }}>
                                        <Clock size={16} color="#64748b" /> Working Hours
                                    </label>
                                    <input 
                                        type="text"
                                        value={entry.working_hours}
                                        onChange={e => handleChange(idx, 'working_hours', e.target.value)}
                                        className="form-control"
                                        placeholder="e.g. 24/7 or specific hours"
                                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {currentInfo.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                            <p>No contact configurations currently set for {activeTab}.</p>
                            <button 
                                className="btn btn-secondary" 
                                onClick={handleAddInfo} 
                                style={{ marginTop: '10px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                            >
                                Add Contact
                            </button>
                        </div>
                    )}
                    
                    <div style={{ marginTop: '0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '10px', color: '#0ea5e9', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <LifeBuoy size={20} />
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                            These support details will be displayed specifically to <strong>{activeTab}s</strong> in their mobile app's help section.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HelpSupport;
