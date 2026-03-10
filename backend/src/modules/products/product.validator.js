const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().required(),
  description: Joi.string().optional()
});

module.exports = {
  createProductSchema
};