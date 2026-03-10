import React from 'react';
import './ActionButton.css';

const ActionButton = ({ icon: Icon, onClick, variant = 'secondary', tooltip, size = 18 }) => {
    return (
        <div className="action-button-wrapper" title={tooltip}>
            <button
                className={`modern-action-btn ${variant}`}
                onClick={onClick}
            >
                <Icon size={size} />
            </button>
        </div>
    );
};

export default ActionButton;
