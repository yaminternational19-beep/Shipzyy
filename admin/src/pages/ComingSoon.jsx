import React from 'react';

const ComingSoon = ({ title }) => {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>{title}</h2>
            <p>This module is currently under development. Please check back later.</p>
        </div>
    );
};

export default ComingSoon;
