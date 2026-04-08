import ApiResponse from '../../utils/apiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';
import productService from './product.service.js';
import ApiError from '../../utils/ApiError.js';

export const createProduct = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendor_id; 
  if (!vendorId) throw new ApiError(403, "Vendor access required");
  
  const result = await productService.createProduct({ ...req.body, vendor_id: vendorId }, req.files);
  return ApiResponse.success(res, "Product created successfully", result);
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const products = await productService.getAllProducts(req.query);
  return ApiResponse.success(res, "Products fetched successfully", products);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const vendorId = req.user.vendor_id;
  if (!vendorId) throw new ApiError(403, "Vendor access required");

  const result = await productService.updateProduct(req.params.id, { ...req.body, vendor_id: vendorId }, req.files);
  return ApiResponse.success(res, "Product updated successfully", result);
});

export const toggleLive = asyncHandler(async (req, res) => {
  const { isLive } = req.body;
  const result = await productService.toggleProductLiveStatus(req.params.id, isLive);
  return ApiResponse.success(res, `Product is now ${isLive ? 'LIVE' : 'HIDDEN'}`, result);
});

export const updateStock = asyncHandler(async (req, res) => {
  const result = await productService.updateStock(req.user.vendor_id, req.body);
  return ApiResponse.success(res, "Stock updated successfully", result);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const result = await productService.deleteProduct(req.params.id, req.user.vendor_id);
  return ApiResponse.success(res, "Product deleted successfully", result);
});

export default { createProduct, getAllProducts, updateProduct, toggleLive, updateStock, deleteProduct };
