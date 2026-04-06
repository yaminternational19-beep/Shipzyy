import Joi from 'joi';

/* ===============================
   CREATE CATEGORY
================================= */

const createCategorySchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("Active", "Inactive").required(),
  banner_name: Joi.string().allow("").required()
});

/* ===============================
   UPDATE CATEGORY
================================= */

const updateCategorySchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().allow(""),
  status: Joi.string().valid("Active", "Inactive").optional(),
  banner_name: Joi.string().allow("").optional()
});

export { createCategorySchema, updateCategorySchema };  