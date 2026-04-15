import Joi from "joi";

const updateContactsSchema = Joi.object({
  contacts: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      country_code: Joi.string().required(),
      phone_number: Joi.string().required(),
      working_hours: Joi.string().allow("").required()
    })
  ).required()
});

export { updateContactsSchema };
