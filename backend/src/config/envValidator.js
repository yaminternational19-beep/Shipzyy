const Joi = require("joi");

const schema = Joi.object({
  PORT: Joi.number().default(5000),
  NODE_ENV: Joi.string().valid("development", "production").default("development")
}).unknown();

const { error, value } = schema.validate(process.env);

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = value;