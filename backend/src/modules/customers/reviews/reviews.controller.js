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
    
    // Support single or multiple image uploads
    const files = req.files || (req.file ? [req.file] : []);

    const result = await reviewsService.createReview(customerId, reviewData, files);
    
    return ApiResponse.success(res, "Review submitted successfully", result, 201);
});

export default { createReview };
