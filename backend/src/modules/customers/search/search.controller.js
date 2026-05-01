import searchService from "./search.service.js";
import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";


export const searchProducts = asyncHandler(async (req, res) => {
  const customerId = req.user ? req.user.id : null; // Extract from auth middleware if available
  const queryParams = req.query;

  const result = await searchService.searchAll(customerId, queryParams);

  return ApiResponse.success(res, "Search results fetched successfully", result);
});

export default {
  searchProducts
};
