import React from 'react';
import TicketTable from './TicketTable';

const CustomerTickets = ({ onShowToast }) => {
    return <TicketTable type="customer" title="Customer Tickets" onShowToast={onShowToast} />;
};

export default CustomerTickets;
