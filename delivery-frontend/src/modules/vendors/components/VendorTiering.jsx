import React, { useState } from 'react';
import { Award, Star, Zap, Shield, Check, Info, X, Save, Plus, Trash2 } from 'lucide-react';
import Toast from '../../../components/common/Toast/Toast';

const VendorTiering = () => {
    const [tiers, setTiers] = useState([
        {
            id: 'platinum',
            name: 'Platinum Tier',
            icon: Zap,
            color: '#4f46e5',
            badge: '#e0e7ff',
            threshold: 'Turnover > $10k / Month',
            benefits: [
                'Priority customer support',
                'Reduced commission (12%)',
                'Free marketing shoutouts',
                'Top listing in search results'
            ],
            count: 12
        },
        {
            id: 'gold',
            name: 'Gold Tier',
            icon: Award,
            color: '#b45309',
            badge: '#fef3c7',
            threshold: 'Turnover > $5k / Month',
            benefits: [
                'Regular marketing support',
                'Standard commission (15%)',
                'Priority dispatch',
                'Bi-weekly payments'
            ],
            count: 48
        },
        {
            id: 'silver',
            name: 'Silver Tier',
            icon: Shield,
            color: '#475569',
            badge: '#f1f5f9',
            threshold: 'Default Entry Level',
            benefits: [
                'Standard support',
                'Regular commission (20%)',
                'Basic portal analytics',
                'Monthly payments'
            ],
            count: 82
        }
    ]);

    const [editingTier, setEditingTier] = useState(null);
    const [formData, setFormData] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const handleEdit = (tier) => {
        setEditingTier(tier.id);
        setFormData({ ...tier });
    };

    const handleSave = () => {
        setTiers(tiers.map(t => t.id === editingTier ? formData : t));
        setEditingTier(null);
        setToast({ show: true, message: `${formData.name} updated successfully!`, type: 'success' });
    };

    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    const addBenefit = () => {
        setFormData({ ...formData, benefits: [...formData.benefits, 'New Benefit'] });
    };

    const removeBenefit = (index) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({ ...formData, benefits: newBenefits });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="tier-grid">
                {tiers.map((tier) => (
                    <div key={tier.id} className={`tier-card ${tier.id}`}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: tier.badge,
                            color: tier.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px'
                        }}>
                            <tier.icon size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: '0 0 8px 0', color: tier.color }}>{tier.name}</h2>
                        <span className="badge" style={{ background: 'white', color: tier.color, border: `1px solid ${tier.color}30` }}>
                            {tier.count} Active Partners
                        </span>

                        <div style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.5)', padding: '20px', borderRadius: '12px' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Info size={14} /> ELIGIBILITY: {tier.threshold}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {tier.benefits.map((benefit, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Check size={12} />
                                        </div>
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '24px', background: tier.color, border: 'none', justifyContent: 'center' }}
                            onClick={() => handleEdit(tier)}
                        >
                            Manage Tier Settings
                        </button>
                    </div>
                ))}
            </div>


            {editingTier && (
                <div className="modal-overlay">
                    <div className="card" style={{ width: '500px', padding: '0', overflow: 'hidden' }}>
                        <div className="modal-header">
                            <h3 style={{ margin: 0 }}>Edit {formData.name}</h3>
                            <button className="icon-btn-sm" onClick={() => setEditingTier(null)}><X size={20} /></button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                            <div className="form-group">
                                <label>Tier Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Eligibility Threshold</label>
                                <input
                                    type="text"
                                    value={formData.threshold}
                                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Benefits
                                    <button
                                        className="icon-btn-plain"
                                        onClick={addBenefit}
                                        style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}
                                    >
                                        + Add Benefit
                                    </button>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {formData.benefits.map((benefit, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                value={benefit}
                                                onChange={(e) => handleBenefitChange(i, e.target.value)}
                                            />
                                            <button
                                                className="icon-btn"
                                                style={{ color: '#ef4444' }}
                                                onClick={() => removeBenefit(i)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button className="btn btn-secondary" onClick={() => setEditingTier(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                <Save size={16} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default VendorTiering;
