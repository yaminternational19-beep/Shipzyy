import Joi from 'joi';

export const createFAQSchema = Joi.object({
    category: Joi.string().valid('customer', 'rider', 'vendor').required(),
    question: Joi.string().required(),
    answer: Joi.string().required(),
    status: Joi.string().valid('Active', 'Inactive').default('Active')
});

export const updateFAQSchema = Joi.object({
    category: Joi.string().valid('customer', 'rider', 'vendor'),
    question: Joi.string(),
    answer: Joi.string(),
    status: Joi.string().valid('Active', 'Inactive')
});
