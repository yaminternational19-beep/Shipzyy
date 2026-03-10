const express = require("express");
const router = express.Router();

const authController = require("./auth.controller");
const { loginSchema, verifyLoginOtpSchema, forgotPasswordSchema, resetPasswordSchema, resendOtpSchema, refreshSchema, verifyResetOtpSchema } = require("./auth.validator");
const validate = require("../../middlewares/validate");

router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-otp", validate(verifyLoginOtpSchema), authController.verifyLoginOtp);
router.post("/refresh-token", validate(refreshSchema), authController.refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/verify-reset-otp", validate(verifyResetOtpSchema), authController.verifyResetOtp);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);
router.post("/resend-otp", validate(resendOtpSchema), authController.resendOtp);
router.post("/logout", validate(refreshSchema), authController.logout);
module.exports = router;