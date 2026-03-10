const express = require("express");
const router = express.Router();

const productController = require("./product.controller");
const { createProductSchema } = require("./product.validator");

const validate = require("../../middlewares/validate"); // if created

router.post(
  "/",
  validate(createProductSchema),
  productController.createProduct
);

router.get("/", productController.getAllProducts);

module.exports = router;