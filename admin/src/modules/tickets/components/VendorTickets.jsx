import React from 'react';
import TicketTable from './TicketTable';

const VendorTickets = ({ onShowToast }) => {
    return <TicketTable type="vendor" title="Vendor Tickets" onShowToast={onShowToast} />;
};

export default VendorTickets;
