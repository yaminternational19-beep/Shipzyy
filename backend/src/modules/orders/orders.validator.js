import Joi from "joi";

export const updateStatusSchema = Joi.object({
    status: Joi.string()
        .valid('Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')
        .required()
});

export const getOrdersQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled').optional(),
    payment_status: Joi.string().valid('Pending', 'Paid', 'Failed').optional(),
    search: Joi.string().allow('').optional(),
    fromDate: Joi.date().iso().optional(),
    toDate: Joi.date().iso().optional()
});
