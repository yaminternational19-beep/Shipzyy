import React from 'react';
import TicketTable from './TicketTable';

const AllTickets = ({ onShowToast }) => {
    return <TicketTable type="all" title="All Tickets" onShowToast={onShowToast} />;
};

export default AllTickets;
