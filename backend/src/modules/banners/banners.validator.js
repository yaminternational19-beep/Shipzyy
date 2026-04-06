import Joi from "joi";

const createBannerSchema = Joi.object({
  banner_name: Joi.string().required(),
  description: Joi.string().allow(""),
  banner_image: Joi.any().optional()
});

const updateBannerSchema = Joi.object({
  banner_name: Joi.string().optional(),
  description: Joi.string().allow(""),
  banner_image: Joi.any().optional()
});

export { createBannerSchema, updateBannerSchema };
