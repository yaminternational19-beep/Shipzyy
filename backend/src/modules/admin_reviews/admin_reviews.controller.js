import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import reviewsService from "../customers/reviews/reviews.service.js";

/**
 * List all reviews (Admin)
 * GET /api/v1/admin/reviews
 */
const getReviews = asyncHandler(async (req, res) => {
    const result = await reviewsService.listReviews(req.query);
    return ApiResponse.success(res, "All reviews fetched successfully", result);
});

export default { getReviews };
