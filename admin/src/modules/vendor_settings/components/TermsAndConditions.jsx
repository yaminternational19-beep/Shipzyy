import React from 'react';
import { FileText } from 'lucide-react';
import LegalBase from './LegalBase';

const TermsAndConditions = ({ showToast }) => {
    return (
        <LegalBase 
            type="terms" 
            title="Terms & Conditions" 
            icon={FileText} 
            showToast={showToast} 
        />
    );
};

export default TermsAndConditions;
