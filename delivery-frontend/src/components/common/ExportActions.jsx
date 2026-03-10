import React, { useState } from 'react';
import { Download, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';

const ExportActions = ({ selectedCount, onExport, onDownload }) => {
    const [isOpen, setIsOpen] = useState(false);
    // Use internal toast state or context if available. Simulating props for now.

    const handleExport = (type) => {
        if (selectedCount === 0) {
            onExport('Please select the data then export', 'warning');
            return;
        }

        if (onDownload) {
            onDownload(type);
        } else {
            onExport(`Exporting ${selectedCount} selected data as ${type === 'pdf' ? 'PDF' : 'Excel'}...`, 'info');
        }
        setIsOpen(false);
    };

    return (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button
                className="btn btn-pdf"
                onClick={() => handleExport('pdf')}
            >
                <FileText size={16} />
                Export PDF
            </button>
            <button
                className="btn btn-excel"
                onClick={() => handleExport('excel')}
            >
                <FileSpreadsheet size={16} />
                Export Excel
            </button>
        </div>
    );
};

export default ExportActions;
