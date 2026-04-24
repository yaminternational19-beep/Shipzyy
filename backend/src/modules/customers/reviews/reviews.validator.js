import Joi from "joi";

export const createReviewSchema = Joi.object({
  order_id: Joi.number().integer().positive().required(),
  product_id: Joi.number().integer().positive().required(),
  item_id: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().max(1000).allow(null, "")
});
