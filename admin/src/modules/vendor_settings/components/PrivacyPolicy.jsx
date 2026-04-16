import React from 'react';
import { ShieldCheck } from 'lucide-react';
import LegalBase from './LegalBase';

const PrivacyPolicy = ({ showToast }) => {
    return (
        <LegalBase 
            type="privacy" 
            title="Privacy Policy" 
            icon={ShieldCheck} 
            showToast={showToast} 
        />
    );
};

export default PrivacyPolicy;
