import Joi from "joi";

const createCouponSchema = Joi.object({
  code: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow(""),
  discount_type: Joi.string().valid('Percentage', 'Fixed').required(),
  discount_value: Joi.number().allow("", null).required(),
  min_order_value: Joi.number().allow("", null).optional().default(0),
  max_discount_amount: Joi.number().allow("", null).optional().default(0),
  usage_limit: Joi.number().allow("", null).optional(),
  expiry_date: Joi.date().allow(null, "").optional(),
  status: Joi.string().valid('Active', 'Inactive').optional().default('Active')
});

const updateCouponSchema = Joi.object({
  code: Joi.string().optional(),
  title: Joi.string().optional(),
  description: Joi.string().allow(""),
  discount_type: Joi.string().valid('Percentage', 'Fixed').optional(),
  discount_value: Joi.number().allow("", null).optional(),
  min_order_value: Joi.number().allow("", null).optional(),
  max_discount_amount: Joi.number().allow("", null).optional(),
  usage_limit: Joi.number().allow("", null).optional(),
  expiry_date: Joi.date().allow(null, "").optional(),
  status: Joi.string().valid('Active', 'Inactive').optional()
});

export { createCouponSchema, updateCouponSchema };
