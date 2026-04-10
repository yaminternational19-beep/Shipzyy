import * as faqService from './faq.service.js';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import ApiError from '../../utils/ApiError.js';

export const getFAQs = asyncHandler(async (req, res) => {
    const { category } = req.query;
    const faqs = await faqService.getFAQsService(category);
    return ApiResponse.success(res, "FAQs retrieved successfully", faqs);
});

export const createFAQ = asyncHandler(async (req, res) => {
    // Validation handled by middleware
    const faqId = await faqService.createFAQService(req.body);
    return ApiResponse.success(res, "FAQ created successfully", { id: faqId }, 201);
});

export const updateFAQ = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Validation handled by middleware
    if (Object.keys(req.body).length === 0) throw new ApiError(400, "Nothing to update");
    
    const updated = await faqService.updateFAQService(id, req.body);
    if (!updated) throw new ApiError(404, "FAQ not found");
    
    return ApiResponse.success(res, "FAQ updated successfully");
});

export const deleteFAQ = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await faqService.deleteFAQService(id);
    if (!deleted) throw new ApiError(404, "FAQ not found");
    
    return ApiResponse.success(res, "FAQ deleted successfully");
});
