import ApiResponse from '../../../utils/apiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import asyncHandler from '../../../utils/asyncHandler.js';
import customersAuthService from './customers.auth.service.js';

/* ===============================
   SIGNUP - SEND OTP
================================= */
export const signup = asyncHandler(async (req, res) => {

  const {
    country_code,
    mobile,
    name,
    email,
    device_id,
    player_id,
    referral_code
  } = req.body;

  // Check if already registered
  const existingCustomer = await customersAuthService.getCustomerByPhone(country_code, mobile);

  if (existingCustomer) {
    throw new ApiError(400, "Mobile number already registered. Please login.");
  }

  // Validate signup data + referral
  const referrer_id = await customersAuthService.validateSignupData({
    country_code,
    mobile,
    name,
    device_id,
    player_id,
    referral_code
  });

  const full_phone = `${country_code}${mobile}`;

  // Generate OTP
  const otp = customersAuthService.generateOtp();

  // Create signup token
  const signupToken = customersAuthService.generateToken({
    country_code,
    mobile,
    name,
    email,
    device_id,
    player_id,
    referrer_id,
    purpose: "signup"
  });

  // Store OTP
  await customersAuthService.storeOtp(full_phone, otp, "signup", signupToken);

  return ApiResponse.success(res, "OTP sent successfully", {
    token: signupToken,
    otp
  });

});


/* ===============================
   LOGIN - SEND OTP
================================= */
export const login = asyncHandler(async (req, res) => {

  const { country_code, mobile, device_id, player_id } = req.body;

  const customer = await customersAuthService.getCustomerByPhone(country_code, mobile);

  if (!customer) {
    throw new ApiError(400, "Mobile number not registered. Please signup.");
  }

  const full_phone = `${country_code}${mobile}`;

  const otp = customersAuthService.generateOtp();

  const loginToken = customersAuthService.generateToken({
    country_code,
    mobile,
    device_id,
    player_id,
    purpose: "login"
  });

  await customersAuthService.storeOtp(full_phone, otp, "login", loginToken);

  return ApiResponse.success(res, "OTP sent successfully", {
    token: loginToken,
    otp
  });

});

/* ===============================
   VERIFY OTP - CREATE CUSTOMER
================================= */
export const verifyOtp = asyncHandler(async (req, res) => {

  const { token, otp } = req.body;

  const decoded = customersAuthService.verifyToken(token);
  if (!decoded) {
    throw new ApiError(401, "Invalid or expired session");
  }

  const full_phone = `${decoded.country_code}${decoded.mobile}`;

  const isOtpValid = await customersAuthService.verifyOtp(
    full_phone,
    otp,
    decoded.purpose
  );

  if (!isOtpValid) {
    throw new ApiError(401, "Invalid OTP");
  }

  let customer = await customersAuthService.getCustomerByPhone(
    decoded.country_code,
    decoded.mobile
  );

  // Signup → create customer
  if (!customer && decoded.purpose === "signup") {
    customer = await customersAuthService.createCustomer(decoded);
  }

  // Login → store device
  if (customer && decoded.purpose === "login") {
    await customersAuthService.storeCustomerDevice({
      customer_id: customer.id,
      device_id: decoded.device_id,
      player_id: decoded.player_id
    });
  }

  const accessToken = customersAuthService.generateAccessToken(customer);
  const refreshToken = customersAuthService.generateRefreshToken(customer);

  await customersAuthService.storeRefreshToken(customer.id, refreshToken, decoded.device_id);

  return ApiResponse.success(res, "Success", {
    accessToken,
    refreshToken,
    customer
  });

});


export const resendOtp = asyncHandler(async (req, res) => {

  const { token } = req.body;

  if (!token) {
    throw new ApiError(400, "Token is required");
  }

  const decoded = customersAuthService.verifyToken(token);

  if (!decoded) {
    throw new ApiError(401, "Invalid or expired session");
  }

  const full_phone = `${decoded.country_code}${decoded.mobile}`;

  const otp = await customersAuthService.resendOtp(
    full_phone,
    decoded.purpose
  );

  return ApiResponse.success(res, "OTP resent successfully", {
    token,
    otp
  });

});



export const refreshToken = asyncHandler(async (req, res) => {

  const { token } = req.body;

  const result = await customersAuthService.refreshSession(token);

  return ApiResponse.success(res, "Token refreshed successfully", result);

});

export const logout = asyncHandler(async (req, res) => {

  const { refreshToken, logoutAll } = req.body;

  if (!refreshToken) {
    throw new ApiError(400, "Refresh token required");
  }

  await customersAuthService.logoutCustomer(refreshToken, logoutAll);

  return ApiResponse.success(res, "Logged out successfully");

});



export default {
  signup,
  login,
  verifyOtp,
  resendOtp,
  refreshToken,
  logout
};