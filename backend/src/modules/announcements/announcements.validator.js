import Joi from "joi";

export const createAnnouncementSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required(),
  target_type: Joi.string().valid('ALL', 'CUSTOMER', 'RIDER', 'VENDOR').required(),
  target_detail: Joi.string().valid('ALL', 'SPECIFIC').required(),
  targeted_to: Joi.string().required(),
  entity_id: Joi.string().allow(null, ""),
  entity_name: Joi.string().allow(null, "")
});

export const updateAnnouncementSchema = Joi.object({
  title: Joi.string().required(),
  message: Joi.string().required()
});
