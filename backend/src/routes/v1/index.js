const express = require("express");
const router = express.Router();

const ApiResponse = require("../../utils/apiResponse");
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const pool = require("../../config/db");

// Example route
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API v1 is working" });
});

router.get(
  "/test-success",
  asyncHandler(async (req, res) => {
    return ApiResponse.success(res, "API working properly", {
      version: "v1"
    });
  })
);

router.get(
  "/test-error",
  asyncHandler(async (req, res) => {
    throw new ApiError(400, "This is a test error", "TEST_ERROR");
  })
);

router.get(
  "/test-db",
  asyncHandler(async (req, res) => {

    const [rows] = await pool.query("SELECT NOW() AS time");

    return ApiResponse.success(res, "Database connected successfully", {
      serverTime: rows[0].time
    });

  })
);



const productRoutes = require("../../modules/products/product.routes");
router.use("/products", productRoutes);


const authRoutes = require("../../modules/auth/auth.routes");
router.use("/auth", authRoutes);

const subadmins = require("../../modules/subadmins/subadmin.routes");
router.use("/subadmin", subadmins);

const categoryRoutes = require("../../modules/categories/category.routes");

router.use("/categories", categoryRoutes);


const subCategoryRoutes = require("../../modules/subcategory/subcategory.routes");

router.use("/subcategories", subCategoryRoutes);


module.exports = router;