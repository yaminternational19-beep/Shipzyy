import ApiResponse from "../../../utils/apiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import supportService from "./support.service.js";

const getHelpSupport = asyncHandler(async (req, res) => {
  const result = await supportService.getHelpSupport();
  return ApiResponse.success(res, "Help support contacts fetched successfully", result);
});

const getContent = asyncHandler(async (req, res) => {
  const result = await supportService.getContent();
  return ApiResponse.success(res, "Content fetched successfully", result);
});

const getContentByKey = asyncHandler(async (req, res) => {
    const { page_key } = req.params;
    const contentData = await supportService.getContentByKey(page_key);
    
    if (!contentData) {
        throw new ApiError(404, "Page not found");
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(contentData.content || "");
});


const createTicket = asyncHandler(async (req, res) => {
    // Check if user is logged in
    if (!req.user || !req.user.id) {
        throw new ApiError(401, "Please log in to create a support ticket. For general inquiries, you can reach us by phone or email.");
    }

    const result = await supportService.createTicket(req.user.id, req.body);
    return ApiResponse.success(res, "Support ticket created successfully", result);
});

const getFaqs = asyncHandler(async (req, res) => {
    const result = await supportService.getFaqs();
    return ApiResponse.success(res, "FAQs fetched successfully", result);
});

const getAnnouncements = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new ApiError(401, "Please log in to view announcements.");
    }
    const result = await supportService.getAnnouncements(req.user.id, req.query);

    return ApiResponse.success(res, "Announcements fetched successfully", result);
});



export default { getHelpSupport, getContent, getContentByKey, createTicket, getFaqs, getAnnouncements };
