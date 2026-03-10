const express = require("express");
const router = express.Router();

const controller = require("./subcategory.controller");
const validate = require("../../middlewares/validate");

const {
  createSubCategorySchema,
  updateSubCategorySchema
} = require("./subcategory.validator");

const upload = require("../../middlewares/upload.middleware");

/* ===============================
   GET SUBCATEGORIES
================================= */

router.get("/", controller.getSubCategories);

/* ===============================
   CREATE SUBCATEGORY
================================= */

router.post(
  "/",
  upload.single("image"),
  validate(createSubCategorySchema),
  controller.createSubCategory
);

/* ===============================
   UPDATE SUBCATEGORY
================================= */

router.put(
  "/:id",
  upload.single("image"),
  validate(updateSubCategorySchema),
  controller.updateSubCategory
);

/* ===============================
   DELETE SUBCATEGORY
================================= */

router.delete("/:id", controller.deleteSubCategory);

/* ===============================
   TOGGLE STATUS
================================= */

router.patch("/:id/status", controller.toggleStatus);

module.exports = router;