import ApiResponse from "../../utils/apiResponse.js";
import ApiError from "../../utils/ApiError.js";
import asyncHandler from "../../utils/asyncHandler.js";
import reviewsService from "../customers/reviews/reviews.service.js";

/**
 * List reviews for vendor's products
 * GET /api/v1/vendor/reviews
 */
const getReviews = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new ApiError(401, "Vendor authentication required");
    }

    const vendorId = req.user.vendor_id;
    const result = await reviewsService.listReviews(req.query, vendorId);
    
    return ApiResponse.success(res, "Vendor reviews fetched successfully", result);
});

export default { getReviews };
