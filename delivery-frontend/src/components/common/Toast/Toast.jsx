import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const icons = {
        success: <CheckCircle2 className="toast-icon" />,
        error: <AlertCircle className="toast-icon" />,
        info: <Info className="toast-icon" />
    };

    return (
        <div className="toast-container">
            <div className={`toast-message ${type}`}>
                {icons[type]}
                <span className="toast-text">{message}</span>
                <button className="toast-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
