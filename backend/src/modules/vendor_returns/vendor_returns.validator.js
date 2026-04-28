import Joi from "joi";

export const getReturnsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('Requested', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Refunded').optional(),
  search: Joi.string().allow('', null).optional()
});

export const updateReturnStatusSchema = Joi.object({
  status: Joi.string().valid('Requested', 'Approved', 'Rejected', 'Picked Up', 'Received', 'Refunded').required(),
  vendor_notes: Joi.string().allow('', null).optional()
});
