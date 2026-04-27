import api from "./axios";

export const getTicketsApi = (params) => {
    return api.get("/admin-tickets", { params });
};

export const replyToTicketApi = (ticketId, data) => {
    return api.post(`/admin-tickets/${ticketId}/reply`, data);
};
