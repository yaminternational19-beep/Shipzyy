const express = require("express");
const router = express.Router();

const controller = require("./category.controller");
const validate = require("../../middlewares/validate");
const { createCategorySchema, updateCategorySchema } = require("./category.validator");

const upload = require("../../middlewares/upload.middleware");

// GET categories
router.get("/", controller.getCategories);

// CREATE category
router.post(
  "/",
  upload.single("image"),
  validate(createCategorySchema),
  controller.createCategory
);

// UPDATE category
router.put(
  "/:id",
  upload.single("image"),
  validate(updateCategorySchema),
  controller.updateCategory
);

// DELETE category
router.delete("/:id", controller.deleteCategory);

// TOGGLE STATUS
router.patch("/:id/status", controller.toggleStatus);

module.exports = router;