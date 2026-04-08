import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import ApiError from "../../../utils/ApiError.js";
import service from "./home.service.js";

export const getHomeData = asyncHandler(async (req, res) => {
  const result = await service.getHomeData(req.user?.id || null, req.query);
  return ApiResponse.success(res, "Home data fetched successfully", result);
});

export const getSubCategories = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  if (!categoryId) {
    throw new ApiError(400, "categoryId path parameter is required");
  }
  const result = await service.getSubCategories(categoryId, req.query);
  return ApiResponse.success(res, "Subcategories fetched successfully", result);
});

export const getProducts = asyncHandler(async (req, res) => {
  const result = await service.getProducts(req.user?.id || null, req.query);
  return ApiResponse.success(res, "Products fetched successfully", result);
});

export const getProductById = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const result = await service.getProductById(req.user?.id || null, productId, req.query);
  if (!result) {
    throw new ApiError(404, "Product not found");
  }
  return ApiResponse.success(res, "Product details fetched successfully", result);
});

export default { 
    getHomeData,
    getSubCategories,
    getProducts,
    getProductById
 };