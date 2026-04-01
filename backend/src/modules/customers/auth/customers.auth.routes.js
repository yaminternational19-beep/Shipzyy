import express from 'express';
const router = express.Router();

import customersAuthController from './customers.auth.controller.js';
import { signupSchema, verifyOtpSchema, loginSchema, verifyresendOtpSchema, refreshSchema, logoutSchema } from './customers.auth.validator.js';
import validate from '../../../middlewares/validate.js';

router.post("/signup", validate(signupSchema), customersAuthController.signup);
router.post("/login", validate(loginSchema), customersAuthController.login);
router.post("/verify-otp", validate(verifyOtpSchema), customersAuthController.verifyOtp);
router.post("/resend-otp", validate(verifyresendOtpSchema), customersAuthController.resendOtp);
router.post("/refresh-token", validate(refreshSchema), customersAuthController.refreshToken);
router.post("/logout", validate(logoutSchema), customersAuthController.logout);

export default router;



