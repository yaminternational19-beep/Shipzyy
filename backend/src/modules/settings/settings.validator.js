import Joi from "joi";

const createPageSchema = Joi.object({
  page_key: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().allow(""),
  type: Joi.string().valid('html', 'textarea', 'url').optional().default('html'),
  icon: Joi.string().optional()
});

const updatePageSchema = Joi.object({
  content: Joi.string().allow("")
});

export { createPageSchema, updatePageSchema };
