
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, User, MapPin, CreditCard } from 'lucide-react';

const MOCK_PRODUCTS = [
    { id: 'PROD-101', name: 'Sony WH-1000XM5', price: 29990 },
    { id: 'PROD-102', name: 'Nike Air Max 270', price: 8995 },
    { id: 'PROD-103', name: 'Samsung Galaxy S24', price: 124999 },
    { id: 'PROD-104', name: 'Logitech G Pro X', price: 13495 },
    { id: 'PROD-105', name: 'Amul Gold Milk 1L', price: 64 }
];

const CreateVendorOrderModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        deliveryAddress: '',
        paymentType: 'COD',
        deliveryType: 'Standard',
        notes: '',
        items: []
    });

    const [selectedProductId, setSelectedProductId] = useState('');

    const addItem = () => {
        if (!selectedProductId) return;
        const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
        if (!product) return;

        const existing = formData.items.find(item => item.id === product.id);
        if (existing) {
            updateQty(product.id, 1);
        } else {
            setFormData(prev => ({
                ...prev,
                items: [...prev.items, { ...product, qty: 1 }]
            }));
        }
        setSelectedProductId('');
    };

    const updateQty = (id, delta) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
            )
        }));
    };

    const removeItem = (id) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
    };

    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliveryCharge = formData.deliveryType === 'Express' ? 100 : 40;
    const finalTotal = subtotal + deliveryCharge;

    const handleSubmit = (assignRider = false) => {
        if (!formData.customerName || !formData.customerPhone || formData.items.length === 0) {
            alert('Please fill customer details and add at least one product.');
            return;
        }
        onSave({ ...formData, subtotal, deliveryCharge, finalTotal }, assignRider);
    };

    return (
        <div className="rider-modal-overlay">
            <div className="rider-modal-content" style={{ maxWidth: '1000px', width: '95%', padding: 0 }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Plus size={24} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Create New Order</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: 'calc(90vh - 80px)' }}>
                    {/* Left Scrollable Form */}
                    <div style={{ padding: '32px', overflowY: 'auto', borderRight: '1px solid #f1f5f9' }}>
                        {/* Basic Info */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={18} color="#6366f1" /> Customer Information
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Customer Name</label>
                                    <input
                                        type="text"
                                        className="dynamic-input"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        placeholder="Enter customer name"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Phone Number</label>
                                    <input
                                        type="text"
                                        className="dynamic-input"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        placeholder="Enter phone number"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Delivery Address</label>
                                <textarea
                                    className="dynamic-input"
                                    value={formData.deliveryAddress}
                                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                                    placeholder="Enter complete delivery address"
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', minHeight: '80px', resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ShoppingCart size={18} color="#6366f1" /> Product Selection
                            </h3>
                            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                <select
                                    className="dynamic-input"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                >
                                    <option value="">Select a product...</option>
                                    {MOCK_PRODUCTS.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={addItem}
                                    style={{ padding: '0 20px', background: '#6366f1', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                            </div>

                            {formData.items.length > 0 && (
                                <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                    {formData.items.map(item => (
                                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>₹{item.price} each</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '4px' }}>
                                                    <button onClick={() => updateQty(item.id, -1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Minus size={14} /></button>
                                                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><Plus size={14} /></button>
                                                </div>
                                                <div style={{ fontWeight: 800, color: '#1e293b', width: '80px', textAlign: 'right' }}>₹{item.price * item.qty}</div>
                                                <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Delivery & Payment Extras */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CreditCard size={18} color="#6366f1" /> Payment & notes
                                </h3>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>PAYMENT TYPE</label>
                                    <select
                                        className="dynamic-input"
                                        value={formData.paymentType}
                                        onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                                    >
                                        <option value="COD">Cash on Delivery (COD)</option>
                                        <option value="Online">Online Payment</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginTop: '12px' }}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>ORDER NOTES</label>
                                    <input
                                        type="text"
                                        className="dynamic-input"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Special instructions..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.9rem', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={18} color="#6366f1" /> Delivery Mode
                                </h3>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>DELIVERY TYPE</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {['Standard', 'Express'].map(type => (
                                            <label key={type} style={{ flex: 1, padding: '12px', border: `1px solid ${formData.deliveryType === type ? '#6366f1' : '#e2e8f0'}`, borderRadius: '12px', background: formData.deliveryType === type ? '#f5f3ff' : 'white', cursor: 'pointer', textAlign: 'center', transition: '0.2s' }}>
                                                <input
                                                    type="radio"
                                                    name="deliveryType"
                                                    checked={formData.deliveryType === type}
                                                    onChange={() => setFormData({ ...formData, deliveryType: type })}
                                                    style={{ display: 'none' }}
                                                />
                                                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: formData.deliveryType === type ? '#4f46e5' : '#64748b' }}>{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Order Summary & Actions */}
                    <div style={{ padding: '32px', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '24px', fontWeight: 800 }}>Order Summary</h3>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b', fontWeight: 600 }}>
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b', fontWeight: 600 }}>
                                <span>Delivery Charge</span>
                                <span>₹{deliveryCharge}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', color: '#64748b', fontWeight: 600 }}>
                                <span>Platform Discount</span>
                                <span style={{ color: '#10b981' }}>- ₹0</span>
                            </div>

                            <div style={{ padding: '24px 0', borderTop: '2px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Grand Total</span>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>₹{finalTotal}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => handleSubmit(false)}
                                style={{ width: '100%', padding: '16px', background: 'white', color: '#1e293b', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', transition: '0.2s' }}
                                onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                                Save Order
                            </button>
                            <button
                                onClick={() => handleSubmit(true)}
                                style={{ width: '100%', padding: '16px', background: '#6366f1', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}
                            >
                                Save & Assign Rider
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateVendorOrderModal;
