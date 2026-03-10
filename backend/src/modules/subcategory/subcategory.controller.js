const ApiResponse = require("../../utils/apiResponse");
const service = require("./subcategory.service");

/* ===============================
   CREATE SUBCATEGORY
================================= */

exports.createSubCategory = async (req, res) => {
  try {

    const subCategory = await service.createSubCategory(
      req.body,
      req.file
    );

    return ApiResponse.success(
      res,
      "SubCategory created successfully",
      subCategory
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to create subcategory"
    );

  }
};


/* ===============================
   GET SUBCATEGORIES
================================= */

exports.getSubCategories = async (req, res) => {
  try {

    const result = await service.getSubCategories(req.query);

    return ApiResponse.success(
      res,
      "SubCategories fetched successfully",
      result
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to fetch subcategories"
    );

  }
};


/* ===============================
   UPDATE SUBCATEGORY
================================= */

exports.updateSubCategory = async (req, res) => {
  try {

    const subCategory = await service.updateSubCategory(
      req.params.id,
      req.body,
      req.file
    );

    return ApiResponse.success(
      res,
      "SubCategory updated successfully",
      subCategory
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to update subcategory"
    );

  }
};


/* ===============================
   DELETE SUBCATEGORY
================================= */

exports.deleteSubCategory = async (req, res) => {
  try {

    const deleted = await service.deleteSubCategory(req.params.id);

    return ApiResponse.success(
      res,
      "SubCategory deleted successfully",
      deleted
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to delete subcategory"
    );

  }
};


/* ===============================
   TOGGLE SUBCATEGORY STATUS
================================= */

exports.toggleStatus = async (req, res) => {
  try {

    const data = await service.toggleStatus(
      req.params.id,
      req.body.status
    );

    return ApiResponse.success(
      res,
      "SubCategory status updated",
      data
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to update subcategory status"
    );

  }
};