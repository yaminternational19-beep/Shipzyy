import jwt from "jsonwebtoken";
import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";

/* ===============================
   GET CUSTOMER BY PHONE
================================= */
const getCustomerByPhone = async (country_code, mobile) => {
  const full_phone = `${country_code}${mobile}`;

  const [rows] = await db.query(
    "SELECT * FROM customers WHERE full_phone = ? AND is_deleted = FALSE LIMIT 1",
    [full_phone]
  );

  return rows[0];
};


/* ===============================
   VALIDATE SIGNUP DATA
================================= */
const validateSignupData = async (data) => {
  const {
    country_code,
    mobile,
    name,
    device_id,
    player_id,
    referral_code
  } = data;

  if (!country_code) throw new ApiError(400, "Country code is required");
  if (!mobile) throw new ApiError(400, "Mobile number is required");
  if (!name) throw new ApiError(400, "Name is required");
  if (!device_id) throw new ApiError(400, "Device ID is required");
  if (!player_id) throw new ApiError(400, "Player ID is required");

  // Validate referral code
  if (referral_code) {
    const [rows] = await db.query(
      "SELECT id FROM customers WHERE referral_code = ? LIMIT 1",
      [referral_code]
    );

    if (!rows.length) {
      throw new ApiError(400, "Invalid referral code");
    }

    return rows[0].id;
  }

  return null;
};


/* ===============================
   GENERATE OTP
================================= */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ===============================
   STORE OTP
================================= */
const storeOtp = async (phone, otp, purpose, token) => {
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  const now = new Date();

  await db.query(
    `INSERT INTO otp_verifications (
    phone,
    otp,
    token,
    expires_at,
    last_sent_at,
    purpose
) VALUES (
    ?, ?, ?, ?, ?, ?
);`,
    [phone, otp, token, expiresAt, now, purpose]
  );
};

/* ===============================
   VERIFY OTP
================================= */
const verifyOtp = async (phone, otp, purpose) => {

  const [rows] = await db.query(
    `SELECT * FROM otp_verifications
     WHERE phone = ?
     AND purpose = ?
     AND verified = FALSE
     ORDER BY id DESC
     LIMIT 1`,
    [phone, purpose]
  );

  if (!rows.length) {
    throw new ApiError(400, "No OTP request found");
  }

  const otpRow = rows[0];

  // 1. Expiry check
  if (new Date() > new Date(otpRow.expires_at)) {
    throw new ApiError(400, "OTP expired");
  }

  // 2. Attempts limit
  if (otpRow.attempts >= 5) {
    throw new ApiError(429, "Too many wrong OTP attempts");
  }

  // 3. Wrong OTP
  if (otpRow.otp !== otp) {
    await db.query(
      `UPDATE otp_verifications
       SET attempts = attempts + 1
       WHERE id = ?`,
      [otpRow.id]
    );
    return false;
  }

  // 4. Correct OTP
  await db.query(
    `UPDATE otp_verifications
     SET verified = TRUE
     WHERE id = ?`,
    [otpRow.id]
  );

  return true;
};

/* ===============================
   SIGNUP TOKEN
================================= */
const generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "10m" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

/* ===============================
   CREATE CUSTOMER
================================= */
const createCustomer = async ({
  country_code,
  mobile,
  name,
  email,
  device_id,
  player_id,
  referrer_id
}) => {

  const full_phone = `${country_code}${mobile}`;

  const newReferralCode = await generateUniqueReferralCode();

  const [result] = await db.query(
    `INSERT INTO customers
    (country_code, mobile, full_phone, name, email, device_id, player_id, referral_code, referrer_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      country_code,
      mobile,
      full_phone,
      name,
      email || null,
      device_id,
      player_id,
      newReferralCode,
      referrer_id
    ]
  );

  return {
    id: result.insertId,
    country_code,
    mobile,
    full_phone,
    name,
    email,
    device_id,
    player_id,
    referral_code: newReferralCode,
    referrer_id
  };
};


/* ===============================
   LOGIN CUSTOMER
================================= */
const storeCustomerDevice = async ({
  customer_id,
  device_id,
  player_id,
  device_type,
  app_version
}) => {

  await db.query(
    `INSERT INTO customers_devices
     (customer_id, device_id, player_id, device_type, app_version, last_login_at)
     VALUES (?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       player_id = VALUES(player_id),
       device_type = VALUES(device_type),
       app_version = VALUES(app_version),
       last_login_at = NOW(),
       is_active = TRUE`,
    [customer_id, device_id, player_id, device_type, app_version]
  );

};

/* ===============================
   TOKENS
================================= */
const generateAccessToken = (customer) => {
  return jwt.sign(
    { id: customer.id, role: "CUSTOMER" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (customer) => {
  return jwt.sign(
    { id: customer.id, role: "CUSTOMER", type: "REFRESH" },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

/* ===============================
   STORE REFRESH TOKEN
================================= */
const storeRefreshToken = async (customerId, refreshToken, deviceId) => {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

  const [rows] = await db.query(
    `SELECT id FROM customers_sessions
     WHERE customer_id = ? AND device_id = ?
     LIMIT 1`,
    [customerId, deviceId]
  );

  if (rows.length) {
    // Update existing session
    await db.query(
      `UPDATE customers_sessions
       SET refresh_token = ?, expires_at = ?
       WHERE id = ?`,
      [refreshToken, expiresAt, rows[0].id]
    );
  } else {
    // Insert new session
    await db.query(
      `INSERT INTO customers_sessions
       (customer_id, refresh_token, device_id, expires_at)
       VALUES (?, ?, ?, ?)`,
      [customerId, refreshToken, deviceId, expiresAt]
    );
  }
};

const refreshSession = async (oldRefreshToken) => {

  const [rows] = await db.query(
    `SELECT * FROM customers_sessions
     WHERE refresh_token = ?
     AND expires_at > NOW()
     LIMIT 1`,
    [oldRefreshToken]
  );

  if (!rows.length) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const session = rows[0];

  const [customers] = await db.query(
    `SELECT * FROM customers WHERE id = ?`,
    [session.customer_id]
  );

  const customer = customers[0];

  const newAccessToken = generateAccessToken(customer);
  const newRefreshToken = generateRefreshToken(customer);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days

  await db.query(
    `UPDATE customers_sessions
     SET refresh_token = ?, expires_at = ?
     WHERE id = ?`,
    [newRefreshToken, expiresAt, session.id]
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
};

const generateUniqueReferralCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    code = "REF" + Math.floor(100000 + Math.random() * 900000);

    const [rows] = await db.query(
      "SELECT id FROM customers WHERE referral_code = ?",
      [code]
    );

    if (rows.length === 0) {
      exists = false;
    }
  }

  return code;
};

/* ===============================
   VALIDATE REFERRAL CODE
================================= */
const validateReferralCode = async (referral_code) => {

  if (!referral_code) return null;

  const [rows] = await db.query(
    "SELECT id FROM customers WHERE referral_code = ? LIMIT 1",
    [referral_code]
  );

  if (!rows.length) {
    throw new Error("Invalid referral code");
  }

  return rows[0].id;
};

/* ===============================
   RESEND OTP
================================= */
const resendOtp = async (phone, purpose) => {

  const [rows] = await db.query(
    `SELECT * FROM otp_verifications
     WHERE phone = ?
     AND purpose = ?
     AND verified = FALSE
     ORDER BY id DESC
     LIMIT 1`,
    [phone, purpose]
  );

  if (!rows.length) {
    throw new ApiError(400, "Already verified or session expired. Please request OTP again.");
  }

  const otpRow = rows[0];
  const now = new Date();
  const lastSent = new Date(otpRow.last_sent_at);
  const createdAt = new Date(otpRow.created_at);

  // 1. 30 seconds cooldown
  if (otpRow.last_sent_at && (now - lastSent) < 30000) {
    throw new ApiError(429, "Please wait 30 seconds before requesting OTP again.");
  }

  // 2. Max 5 OTP per hour
  if (otpRow.send_count >= 5 && (now - createdAt) < 3600000) {
    throw new ApiError(429, "OTP request limit reached. Try again after 1 hour.");
  }

  // 3. Generate new OTP
  const newOtp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const nowUtc = new Date();

  // 4. Update same row
  await db.query(
    `UPDATE otp_verifications
     SET otp = ?,
         expires_at = ?,
         attempts = 0,
         send_count = send_count + 1,
         last_sent_at = ?
     WHERE id = ?`,
    [newOtp, expiresAt, nowUtc, otpRow.id]
  );

  return newOtp;
};



const logoutCustomer = async (refreshToken, logoutAll = false) => {

  // First find the session
  const [rows] = await db.query(
    `SELECT * FROM customers_sessions
     WHERE refresh_token = ?
     LIMIT 1`,
    [refreshToken]
  );

  if (!rows.length) {
    throw new ApiError(400, "Invalid session");
  }

  const session = rows[0];

  if (logoutAll) {
    // Delete all sessions for this customer
    await db.query(
      `DELETE FROM customers_sessions
       WHERE customer_id = ?`,
      [session.customer_id]
    );
  } else {
    // Delete only current session
    await db.query(
      `DELETE FROM customers_sessions
       WHERE id = ?`,
      [session.id]
    );
  }

  return true;
};


export default {
  getCustomerByPhone,
  validateSignupData,
  generateOtp,
  storeOtp,
  verifyOtp,
  generateToken,
  verifyToken,
  createCustomer,
  storeCustomerDevice,
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  refreshSession,
  generateUniqueReferralCode,
  validateReferralCode,
  resendOtp,
  logoutCustomer
};