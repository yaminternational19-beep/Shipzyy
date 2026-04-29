import apiService from './api';

// 1. OTP Request 
export const requestOtp = async (payload) => {
  const response = await apiService.post("/customers/request-otp", payload);
  return response.data;
};

// 2. OTP Verify 
export const verifyOtp = async (payload) => {
  const response = await apiService.post("/customers/verify-otp", payload);
  return response.data;
};

// 3. Resend OTP 
export const resendOtp = async (payload) => {
  const response = await apiService.post("/customers/resend-otp", payload);
  return response.data;
};

// logout API
export const logoutApi = async (refreshToken, logoutAll = true) => {
  const response = await apiService.post("/customers/logout", {
    refreshToken: refreshToken,
    logoutAll: logoutAll
  });
  return response.data;
};