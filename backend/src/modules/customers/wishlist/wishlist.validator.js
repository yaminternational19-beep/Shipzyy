import Joi from "joi";

export const toggleWishlistSchema = Joi.object({
  product_id: Joi.number().integer().required().messages({
    "any.required": "Product ID is required",
    "number.base": "Product ID must be a number",
  }),
  is_liked: Joi.boolean().required().messages({
    "any.required": "Liked status is required",
    "boolean.base": "Liked status must be a boolean",
  }),
});
