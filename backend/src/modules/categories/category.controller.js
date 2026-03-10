const ApiResponse = require("../../utils/apiResponse");
const service = require("./category.service");

/* ===============================
   CREATE CATEGORY
================================= */

exports.createCategory = async (req, res) => {
  try {

    const category = await service.createCategory(req.body, req.file);

    return ApiResponse.success(
      res,
      "Category created successfully",
      category
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to create category"
    );

  }
};


/* ===============================
   GET CATEGORIES
================================= */

exports.getCategories = async (req, res) => {
  try {

    const result = await service.getCategories(req.query);

    return ApiResponse.success(
      res,
      "Categories fetched successfully",
      result
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to fetch categories"
    );

  }
};


/* ===============================
   UPDATE CATEGORY
================================= */

exports.updateCategory = async (req, res) => {
  try {

    const category = await service.updateCategory(
      req.params.id,
      req.body,
      req.file
    );

    return ApiResponse.success(
      res,
      "Category updated successfully",
      category
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to update category"
    );

  }
};


/* ===============================
   DELETE CATEGORY
================================= */

exports.deleteCategory = async (req, res) => {
  try {

    const deleted = await service.deleteCategory(req.params.id);

    return ApiResponse.success(
      res,
      "Category deleted successfully",
      deleted
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to delete category"
    );

  }
};


/* ===============================
   TOGGLE CATEGORY STATUS
================================= */

exports.toggleStatus = async (req, res) => {
  try {

    const data = await service.toggleStatus(
      req.params.id,
      req.body.status
    );

    return ApiResponse.success(
      res,
      "Category status updated",
      data
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to update category status"
    );

  }
};