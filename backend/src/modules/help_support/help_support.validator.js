import Joi from "joi";

const updateContactsSchema = Joi.object({
  contacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      workingHours: Joi.string().allow("").optional()
    })
  ).required()
});

export { updateContactsSchema };
