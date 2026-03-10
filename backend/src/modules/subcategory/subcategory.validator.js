const Joi = require("joi");

/* ===============================
   CREATE SUBCATEGORY
================================= */

const createSubCategorySchema = Joi.object({
  categoryId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("Active", "Inactive").required()
});

/* ===============================
   UPDATE SUBCATEGORY
================================= */

const updateSubCategorySchema = Joi.object({
  categoryId: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("Active", "Inactive").optional()
});

module.exports = {
  createSubCategorySchema,
  updateSubCategorySchema
};