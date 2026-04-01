import Joi from "joi";

const signupSchema = Joi.object({
  country_code: Joi.string().required(),
  mobile: Joi.string().min(8).max(15).required(),
  name: Joi.string().required(),
    email: Joi.string().email().optional(),
    device_id: Joi.string().required(),
    player_id: Joi.string().required(),
    referral_code: Joi.string().optional()
});

const verifyOtpSchema = Joi.object({
  token: Joi.string().required(),
  otp: Joi.string().length(6).required()
});


const loginSchema = Joi.object({
  country_code: Joi.string().required(),
  mobile: Joi.string().min(8).max(15).required(),
  device_id: Joi.string().required(),
  player_id: Joi.string().required()
});

const verifyresendOtpSchema = Joi.object({
    token: Joi.string().required()
});

const refreshSchema = Joi.object({
  token: Joi.string().required()
});



export const logoutSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token is required",
    "any.required": "Refresh token is required"
  }),
  logoutAll: Joi.boolean().optional()
});


export { signupSchema, verifyOtpSchema, loginSchema, verifyresendOtpSchema, refreshSchema };