import ApiResponse from "../../../utils/apiResponse.js";
import ApiError from "../../../utils/ApiError.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import reviewsService from "./reviews.service.js";

/**
 * Submit a review
 * POST /customers/reviews
 */
const createReview = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new ApiError(401, "Please log in to submit a review.");
    }

    const customerId = req.user.id;
    const reviewData = req.body;
    
    // Support single or multiple image uploads from either field name
    let files = [];
    if (req.files) {
        if (Array.isArray(req.files)) {
            files = req.files;
        } else {
            files = [
                ...(req.files.images || []),
                ...(req.files.imageUrls || [])
            ];
        }
    } else if (req.file) {
        files = [req.file];
    }

    const result = await reviewsService.createReview(customerId, reviewData, files);
    
    return ApiResponse.success(res, "Review submitted successfully", result, 201);
});

const updateReview = asyncHandler(async (req, res) => {
    const customerId = req.user.id;
    const reviewId = req.params.reviewId;
    const updateData = req.body;

    // Handle new image uploads
    let files = [];
    if (req.files) {
        if (Array.isArray(req.files)) {
            files = req.files;
        } else {
            files = [
                ...(req.files.images || []),
                ...(req.files.imageUrls || [])
            ];
        }
    } else if (req.file) {
        files = [req.file];
    }

    const result = await reviewsService.updateReview(customerId, reviewId, updateData, files);
    return ApiResponse.success(res, result.message, null);
});

const deleteReview = asyncHandler(async (req, res) => {
    const customerId = req.user.id;
    const reviewId = req.params.reviewId;

    const result = await reviewsService.deleteReview(customerId, reviewId);
    return ApiResponse.success(res, result.message, null);
});

export default { createReview, updateReview, deleteReview };
