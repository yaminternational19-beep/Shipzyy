import Joi from "joi";

export const initiatePaymentSchema = Joi.object({
    amount: Joi.number().required().min(1)
});

export default {
    initiatePaymentSchema
};
