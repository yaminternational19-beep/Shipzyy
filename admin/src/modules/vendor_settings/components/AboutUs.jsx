import React from 'react';
import { Info } from 'lucide-react';
import LegalBase from './LegalBase';

const AboutUs = ({ showToast }) => {
    return (
        <LegalBase 
            type="about-us" 
            title="About Us" 
            icon={Info} 
            showToast={showToast} 
        />
    );
};

export default AboutUs;
