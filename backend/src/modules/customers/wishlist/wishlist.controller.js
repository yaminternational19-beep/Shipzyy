import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import wishlistService from "./wishlist.service.js";

/**
 * Toggle a product in the authenticated customer's wishlist
 */
export const toggleWishlist = asyncHandler(async (req, res) => {
    const customerId = req.user?.id;
    
    if (!customerId) {
        return ApiResponse.error(res, "Please login first to update your wishlist", 401);
    }

    const { product_id, is_liked } = req.body;
    const result = await wishlistService.toggleWishlist(customerId, product_id, is_liked);
    return ApiResponse.success(res, result.message, result);
});

/**
 * Get all wishlist items for the authenticated customer
 */
export const getWishlist = asyncHandler(async (req, res) => {
    const customerId = req.user?.id || null;
    const items = await wishlistService.getWishlist(customerId);
    const message = customerId ? "Wishlist items fetched successfully" : "Please login to see your wishlist products";
    return ApiResponse.success(res, message, items);
});

export default {
    toggleWishlist,
    getWishlist
};
