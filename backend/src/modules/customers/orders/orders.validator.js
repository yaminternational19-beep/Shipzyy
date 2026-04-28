import Joi from "joi";

export const checkoutSchema = Joi.object({
  address_id: Joi.number().integer().required(),
  coupon_code: Joi.string().allow("", null).optional(),
});

export const placeOrderSchema = Joi.object({
  address_id: Joi.number().integer().required().messages({
    "number.base": "Address ID must be a number",
    "any.required": "Address is required to place an order",
  }),
  coupon_code: Joi.string().allow("", null).optional(),
  payment_method: Joi.string().valid("COD", "Online").required().messages({
    "any.only": "Payment method must be either 'COD' or 'Online'",
    "any.required": "Payment method is required",
  }),
});

export const cancelItemSchema = Joi.object({
  order_id: Joi.number().integer().required().messages({
    "number.base": "Order ID must be a number",
    "any.required": "Order ID is required",
  }),
  item_id: Joi.number().integer().required().messages({
    "number.base": "Item ID must be a number",
    "any.required": "Item ID is required",
  }),
});
