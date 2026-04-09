import Joi from "joi";

const createDeliveryChargeSchema = Joi.object({
  type: Joi.string().valid('Area', 'Distance').required(),
  area_name: Joi.string().when('type', { is: 'Area', then: Joi.required(), otherwise: Joi.allow(null, "") }),
  min_distance: Joi.number().allow("", null).when('type', { is: 'Distance', then: Joi.required(), otherwise: Joi.allow(null) }),
  max_distance: Joi.number().allow("", null).when('type', { is: 'Distance', then: Joi.required(), otherwise: Joi.allow(null) }),
  charge_amount: Joi.number().allow("", null).required(),
  min_order_amount: Joi.number().allow("", null).optional().default(0),
  free_delivery_above: Joi.number().allow("", null).optional(),
  status: Joi.string().valid('Active', 'Inactive').optional().default('Active')
});

const updateDeliveryChargeSchema = Joi.object({
  type: Joi.string().valid('Area', 'Distance').optional(),
  area_name: Joi.string().allow(null, "").optional(),
  min_distance: Joi.number().allow("", null).optional(),
  max_distance: Joi.number().allow("", null).optional(),
  charge_amount: Joi.number().allow("", null).optional(),
  min_order_amount: Joi.number().allow("", null).optional(),
  free_delivery_above: Joi.number().allow("", null).optional(),
  status: Joi.string().valid('Active', 'Inactive').optional()
});

export { createDeliveryChargeSchema, updateDeliveryChargeSchema };
