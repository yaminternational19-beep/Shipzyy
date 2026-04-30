import db from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import formatCustomerDates from "../../utils/formatCustomerDates.js";
import { getFromCache, setToCache, removeFromCache, removeByPattern } from "../../utils/cache.js";

/* ===============================
   PROFILE COMPLETION
================================ */

const calculateProfileCompletion = (customer, address) => {
  let total = 6;
  let completed = 0;

  if (customer.name) completed++;
  if (customer.mobile) completed++;
  if (customer.email) completed++;
  if (customer.gender) completed++;
  if (customer.profile_image) completed++;
  if (address) completed++;

  return Math.round((completed / total) * 100);
};

/* ===============================
   GET ALL CUSTOMERS
================================ */

export const getAllCustomers = async (queryParams) => {
  const cacheKey = `admin:customers:list:${JSON.stringify(queryParams)}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const { page, limit, skip } = getPagination(queryParams);

  let where = [];
  let values = [];

  /* ===============================
     FILTERS
  =============================== */

  if (queryParams.status && queryParams.status !== 'All') {
    where.push("c.status = ?");
    values.push(queryParams.status);
  }

  if (queryParams.stats) {
    if (queryParams.stats === 'active') {
      where.push("c.status = 'active'");
    } else if (queryParams.stats === 'inactive') {
      where.push("c.status IN ('suspended', 'terminated')");
    } else if (queryParams.stats === 'new') {
      where.push("c.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
    }
  }

  if (queryParams.search) {
    where.push("(c.name LIKE ? OR c.email LIKE ? OR c.full_phone LIKE ?)");
    values.push(`%${queryParams.search}%`);
    values.push(`%${queryParams.search}%`);
    values.push(`%${queryParams.search}%`);
  }

  if (queryParams.country && queryParams.country !== 'All') {
    where.push("a.country = ?");
    values.push(queryParams.country);
  }

  if (queryParams.state && queryParams.state !== 'All') {
    where.push("a.state = ?");
    values.push(queryParams.state);
  }

  const whereClause = where.length
    ? `WHERE c.is_deleted = FALSE AND ${where.join(" AND ")}`
    : `WHERE c.is_deleted = FALSE`;

  /* ===============================
     TOTAL COUNT
  =============================== */

  const [countResult] = await db.query(
    `SELECT COUNT(*) as total
     FROM customers c
     LEFT JOIN customers_addresses a ON a.id = c.default_address_id
     ${whereClause}`,
    values
  );

  const totalRecords = countResult[0].total;

  /* ===============================
     FETCH DATA
  =============================== */

  const [rows] = await db.query(
    `SELECT 
        c.id,
        c.country_code,
        c.mobile,
        c.full_phone,
        COALESCE(NULLIF(c.name, ''), 'Shipzyy User') as name,
        COALESCE(NULLIF(c.email, ''), 'noemail') as email,
        c.gender,
        COALESCE(NULLIF(c.profile_image, ''), '') as profile_image,
        c.status,
        c.last_login_at,
        c.created_at,
        COALESCE(NULLIF(r.name, ''), 'Shipzyy User') as referred_by,

        a.city,
        a.state,
        a.country

     FROM customers c
     LEFT JOIN customers r ON r.id = c.referrer_id
     LEFT JOIN customers_addresses a ON a.id = c.default_address_id

     ${whereClause}
     ORDER BY c.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, skip]
  );

  /* ===============================
     FORMAT RESPONSE
  =============================== */

  const records = formatCustomerDates(
    rows.map(c => {
      let locationStr = null;
      if (c.city || c.state || c.country) {
        locationStr = [c.city, c.state, c.country].filter(Boolean).join(", ");
      }

      const profile_completion = calculateProfileCompletion(c, locationStr);

      return {
        id: c.id,
        customer_code: `CUST-${c.id}`,
        name: c.name,
        email: c.email,
        phone: c.full_phone,
        profile_image: c.profile_image,
        referred_by: c.referred_by || null,
        location: locationStr,
        status: c.status ? c.status.toLowerCase() : "active",
        orders: 0,
        profile_completion,
        joined: c.created_at,
        last_login_at: c.last_login_at,
        address: locationStr ? {
          city: c.city,
          state: c.state,
          country: c.country
        } : null  
      };
    })
  );

  const pagination = getPaginationMeta(page, limit, totalRecords);

  /* ===============================
     GLOBAL STATS
  =============================== */

  const [customerStats] = await db.query(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
      SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended,
      SUM(CASE WHEN status = 'terminated' THEN 1 ELSE 0 END) as terminatedCount,
      SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_accounts
    FROM customers
    WHERE is_deleted = FALSE
  `);

  const statsData = {
    total: customerStats[0].total,
    active: customerStats[0].active,
    suspended: customerStats[0].suspended,
    terminated: customerStats[0].terminatedCount,
    new: customerStats[0].new_accounts || 0
  };

  const result = {
    stats: statsData,
    records,
    pagination
  };

  await setToCache(cacheKey, result, 300); // 5 mins
  return result;
};

/* ===============================
   GET CUSTOMER BY ID
================================ */

export const getCustomerById = async (id) => {
  const cacheKey = `admin:customer:profile:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const [rows] = await db.query(
    `SELECT 
        c.id,
        c.country_code,
        c.mobile,
        c.full_phone,
        COALESCE(NULLIF(c.name, ''), 'Shipzyy User') as name,
        COALESCE(NULLIF(c.email, ''), 'noemail') as email,
        c.gender,
        COALESCE(NULLIF(c.profile_image, ''), '') as profile_image,
        c.status,
        c.created_at,
        COALESCE(NULLIF(r.name, ''), 'Shipzyy User') as referred_by,

        a.address_name,
        a.contact_person_name,
        a.contact_phone,
        a.address_line_1,
        a.address_line_2,
        a.landmark,
        a.city,
        a.state,
        a.country,
        a.pincode

     FROM customers c
     LEFT JOIN customers r ON r.id = c.referrer_id
     LEFT JOIN customers_addresses a ON a.id = c.default_address_id
     WHERE c.id = ? AND c.is_deleted = FALSE`,
    [id]
  );

  if (!rows.length) {
    throw new ApiError(404, "Customer not found");
  }

  const customer = rows[0];

  let address = null;
  if (customer.city || customer.state || customer.country) {
    address = `${customer.address_line_1 || ""}, ${customer.city || ""}, ${customer.state || ""}, ${customer.country || ""}`;
  }

  const profile_completion = calculateProfileCompletion(customer, address);

  const result = {
    ...customer,
    customer_code: `CUST-${customer.id}`,
    location: address,
    profile_completion,
    joined: customer.created_at
  };

  await setToCache(cacheKey, result, 3600); // 1 hour
  return result;
};

/* ===============================
   UPDATE CUSTOMER STATUS
================================ */

export const updateStatus = async (id, status) => {

  const [customer] = await db.query(
    "SELECT status FROM customers WHERE id = ? AND is_deleted = FALSE",
    [id]
  );

  if (!customer.length) {
    throw new ApiError(404, "Customer not found");
  }

  if (customer[0].status === 'terminated') {
    throw new ApiError(400, "Cannot change status of a terminated customer");
  }

  const [result] = await db.query(
    "UPDATE customers SET status = ?, updated_at = NOW() WHERE id = ?",
    [status, id]
  );

  // Invalidate caches
  await removeFromCache(`admin:customer:profile:${id}`);
  await removeFromCache(`customer:profile:${id}`); // Also clear customer-facing cache
  await removeByPattern("admin:customers:list:*"); 

  return true;

};

/* ===============================
   DELETE CUSTOMER
================================ */

export const deleteCustomer = async (id) => {

  const [customer] = await db.query(
    "SELECT status FROM customers WHERE id = ? AND is_deleted = FALSE",
    [id]
  );

  if (!customer.length) {
    throw new ApiError(404, "Customer not found");
  }

  if (customer[0].status !== 'terminated') {
    throw new ApiError(400, "Only terminated customers can be deleted");
  }

  const [result] = await db.query(
    "UPDATE customers SET is_deleted = TRUE, updated_at = NOW() WHERE id = ?",
    [id]
  );

  // Invalidate caches
  await removeFromCache(`admin:customer:profile:${id}`);
  await removeFromCache(`customer:profile:${id}`); // Also clear customer-facing cache
  await removeByPattern("admin:customers:list:*"); 

  return true;

};

export default {
  getAllCustomers,
  getCustomerById,
  updateStatus,
  deleteCustomer
};
