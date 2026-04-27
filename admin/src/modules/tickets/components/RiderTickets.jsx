import React from 'react';
import TicketTable from './TicketTable';

const RiderTickets = ({ onShowToast }) => {
    return <TicketTable type="rider" title="Rider Tickets" onShowToast={onShowToast} />;
};

export default RiderTickets;
