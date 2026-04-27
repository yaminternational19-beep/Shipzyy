import adminTicketsService from "./admin_tickets.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";

const getTickets = asyncHandler(async (req, res) => {
    const result = await adminTicketsService.getTickets(req.query);
    return ApiResponse.success(res, "Tickets fetched successfully", result);
});

const replyToTicket = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;
    const { userType, reply, status } = req.body;
    const adminId = req.user?.id; // Assuming auth middleware adds user to req

    if (!ticketId || !userType || !reply || !status) {
        return ApiResponse.error(res, "Missing required fields", 400);
    }

    const result = await adminTicketsService.replyToTicket(ticketId, userType, reply, status, adminId);
    return ApiResponse.success(res, result.message, result);
});

export default {
    getTickets,
    replyToTicket
};
