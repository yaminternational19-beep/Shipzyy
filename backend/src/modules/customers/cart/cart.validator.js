import Joi from "joi";

export const addToCartSchema = Joi.object({
  product_id: Joi.number().integer().required().messages({
    "any.required": "Product ID is required",
    "number.base": "Product ID must be a number",
  }),
  quantity: Joi.number().integer().min(1).default(1).messages({
    "number.min": "Quantity must be at least 1",
  }),
});


export const removeFromCartSchema = Joi.object({
  cart_ids: Joi.array().items(Joi.number().integer()).messages({
    "array.base": "Cart IDs must be an array",
  }),
  clear_all: Joi.boolean(),
}).or('cart_ids', 'clear_all'); // Ensures at least one of these is provided
