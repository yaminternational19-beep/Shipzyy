const ApiResponse = require("../../utils/apiResponse");
const asyncHandler = require("../../utils/asyncHandler");
const productService = require("./product.service");

exports.createProduct = asyncHandler(async (req, res) => {
  const product = productService.createProduct(req.body);

  return ApiResponse.success(res, "Product created successfully", product);
});

exports.getAllProducts = asyncHandler(async (req, res) => {
  const products = productService.getAllProducts();

  return ApiResponse.success(res, "Products fetched successfully", products);
});