import Joi from "joi";

const createTicketSchema = Joi.object({
    support_contact_id: Joi.number().integer().allow(null).optional(),
    subject: Joi.string().trim().max(255).required().messages({
        "any.required": "Subject is required",
        "string.empty": "Subject cannot be empty"
    }),
    message: Joi.string().trim().required().messages({
        "any.required": "Message is required",
        "string.empty": "Message cannot be empty"
    })
});

export { createTicketSchema };
