import ApiResponse from "../../../utils/apiResponse.js";
import service from "./home.service.js";

export const getHomeData = async (req, res) => {
  try {
    const result = await service.getHomeData(req.user?.id || null, req.query);
    return ApiResponse.success(res, "Home data fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch home data");
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    if (!categoryId) {
      return ApiResponse.error(res, "categoryId path parameter is required");
    }
    const result = await service.getSubCategories(categoryId, req.query);
    return ApiResponse.success(res, "Subcategories fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch subcategories");
  }
}

export const getProducts = async (req, res) => {
  try {
    const result = await service.getProducts(req.user?.id || null, req.query);
    return ApiResponse.success(res, "Products fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch products");
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await service.getProductById(req.user?.id || null, productId, req.query);
    if (!result) {
      return ApiResponse.error(res, "Product not found", 404);  
    }
    return ApiResponse.success(res, "Product details fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch product details");
  }
};

export default { 
    getHomeData,
    getSubCategories,
    getProducts,
    getProductById
 };