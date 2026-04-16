import React, { useState, useEffect } from 'react';
import { Download, Copy, Loader2 } from 'lucide-react';
import { getSettingsContentApi } from '../../../api/settings.api';
import { jsPDF } from "jspdf";

const LegalBase = ({ type, title, icon: Icon, showToast }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await getSettingsContentApi();
                // Map of possible keys in DB
                const keyMap = {
                    'about-us': 'about_us',
                    'terms': 'terms_conditions',
                    'privacy': 'privacy_policy'
                };
                
                const dbKey = keyMap[type] || type;
                const records = res.data?.data || res.data || [];
                const record = Array.isArray(records) ? records.find(item => item.key === dbKey || item.slug === dbKey) : null;
                
                setContent(record || { 
                    content: `The ${title} content is currently being updated. Please check back later or contact our support team if you have immediate questions.` 
                });
            } catch (error) {
                console.error(`Failed to fetch ${type}:`, error);
                showToast(`Failed to load ${title}`, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, [type, title]);

    const handleCopy = () => {
        if (!content) return;
        const textToCopy = content.content || content.value || "";
        // Simple HTML tag removal if present
        const cleanText = textToCopy.replace(/<[^>]*>?/gm, '');
        navigator.clipboard.writeText(cleanText);
        showToast("Content copied to clipboard!");
    };

    const handleDownload = () => {
        if (!content) return;
        try {
            const doc = new jsPDF();
            doc.setFontSize(22);
            doc.setTextColor(37, 99, 235);
            doc.text(title, 20, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated for Vendor on: ${new Date().toLocaleDateString()}`, 20, 28);
            
            doc.setFontSize(12);
            doc.setTextColor(33, 37, 41);
            const textToFormat = (content.content || content.value || "").replace(/<[^>]*>?/gm, '');
            const splitText = doc.splitTextToSize(textToFormat, 170);
            doc.text(splitText, 20, 40);
            
            doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
            showToast(`${title} downloaded as PDF!`);
        } catch (e) {
            showToast("Failed to generate PDF", "error");
        }
    };

    if (loading) {
        return (
            <div className="legal-loading">
                <Loader2 className="animate-spin" size={40} color="#6366f1" />
                <p style={{ marginTop: '12px', fontWeight: 600 }}>Fetching latest {title.toLowerCase()}...</p>
            </div>
        );
    }

    return (
        <div className="legal-content-card">
            <div className="legal-card-header">
                <h3><Icon size={20} style={{ color: 'var(--primary-color)' }} /> {title}</h3>
                <div className="legal-actions">
                    <button onClick={handleCopy} className="btn-legal-action btn-copy">
                        <Copy size={16} /> Copy Text
                    </button>
                    <button onClick={handleDownload} className="btn-legal-action btn-download">
                        <Download size={16} /> Download PDF
                    </button>
                </div>
            </div>
            <div className="legal-card-body">
                <div 
                    className="legal-inner-content"
                    dangerouslySetInnerHTML={{ __html: content.content || content.value }} 
                />
            </div>
        </div>
    );
};

export default LegalBase;
