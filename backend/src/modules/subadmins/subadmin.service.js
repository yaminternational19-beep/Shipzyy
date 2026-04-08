import { getPagination, getPaginationMeta } from '../../utils/pagination.js';
import buildFilters from '../../utils/filter.js';
import db from '../../config/db.js';
import { getFromCache, setToCache, removeFromCache, removeByPattern } from "../../utils/cache.js";


/* ===============================
   GET SUB ADMINS
================================= */

const getSubAdmins = async (queryParams) => {
  const cacheKey = `admin:subadmins:list:${JSON.stringify(queryParams)}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  
  const { page, limit, skip } = getPagination(queryParams);

  const filters = buildFilters(queryParams, ["name", "email", "mobile"]);

  let where = [];
  let values = [];

  // ROLE FILTER
  if (filters.role) {
    where.push("role = ?");
    values.push(filters.role);
  }

  // STATUS FILTER
  if (filters.status) {
    where.push("status = ?");
    values.push(filters.status);
  }

  // SEARCH FILTER
  if (filters.$or) {

    const searchConditions = filters.$or.map(condition => {
      const key = Object.keys(condition)[0];
      const value = condition[key].$regex;
      values.push(`%${value}%`);
      return `${key} LIKE ?`;
    });

    where.push(`(${searchConditions.join(" OR ")})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // GET RECORDS
  const [records] = await db.query(
    `SELECT * FROM sub_admins
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, skip]
  );

  // TOTAL COUNT
  const [countResult] = await db.query(
    `SELECT COUNT(*) as total FROM sub_admins ${whereClause}`,
    values
  );

  const totalRecords = countResult[0].total;

  const pagination = getPaginationMeta(page, limit, totalRecords);

  const formattedRecords = records.map(admin => ({
    // console.log("permissions raw:", admin.permissions, typeof admin.permissions);
    id: admin.id,
    name: admin.name,
    email: admin.email,
    password: admin.password, // Included for edit form as requested
    countryCode: admin.country_code,
    mobile: admin.mobile,
    contactNo: `${admin.country_code} ${admin.mobile}`,
    emergencyCountryCode: admin.emergency_country_code,
    emergencyMobile: admin.emergency_mobile,
    emergencyNo: admin.emergency_no || (admin.emergency_country_code ? `${admin.emergency_country_code} ${admin.emergency_mobile}` : null),
    role: admin.role,
    address: admin.address,
    state: admin.state,
    country: admin.country,
    pincode: admin.pincode,
    fullAddress: `${admin.address}, ${admin.state}, ${admin.country}`,
    status: admin.status,
    profilePhoto: admin.profile_photo,
    profilePhotoKey: admin.profile_photo_key,
    permissions: Array.isArray(admin.permissions)
  ? admin.permissions
  : admin.permissions
    ? JSON.parse(admin.permissions)
    : [],
    // permissions: admin.permissions ? JSON.parse(admin.permissions) : [],

    createdAt: admin.created_at
  }));
  

  // STATS
  const [stats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status='Active') as active,
        SUM(status='Inactive') as inactive,
        COUNT(DISTINCT role) as rolesDefined
      FROM sub_admins
  `);

  const result = {
    stats: stats[0],
    records: formattedRecords,
    pagination
  };

  await setToCache(cacheKey, result, 600); // 10 mins
  return result;
};


/* ===============================
   CREATE SUB ADMIN
================================= */

const createSubAdmin = async (data) => {

  /* check duplicate email */
  const [emailExists] = await db.execute(
    "SELECT id FROM sub_admins WHERE email = ?",
    [data.email]
  );

  if (emailExists.length) {
    throw new Error("Email already exists");
  }

  /* check duplicate mobile */
  const [mobileExists] = await db.execute(
    "SELECT id FROM sub_admins WHERE mobile = ?",
    [data.mobile]
  );

  if (mobileExists.length) {
    throw new Error("Mobile number already exists");
  }

  const query = `
    INSERT INTO sub_admins (
      name,
      email,
      password,
      country_code,
      mobile,
      address,
      state,
      country,
      pincode,
      emergency_country_code,
      emergency_mobile,
      role,
      status,
      profile_photo,
      profile_photo_key
    )
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    data.name,
    data.email,
    data.password,
    data.countryCode,
    data.mobile,
    data.address,
    data.state,
    data.country,
    data.pincode || null,
    data.emergencyCountryCode || null,
    data.emergencyMobile || null,
    data.role,
    data.status,
    data.profilePhoto || null,
    data.profilePhotoKey || null
  ];

  const [result] = await db.execute(query, values);

  // Invalidate caches
  await removeByPattern("admin:subadmins:list:*");

  return {
    id: result.insertId,
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    role: data.role,
    status: data.status,
    profilePhoto: data.profilePhoto,
    profilePhotoKey: data.profilePhotoKey
  };
};


/* ===============================
   UPDATE SUB ADMIN
================================= */

const getSubAdminById = async (id) => {
  const cacheKey = `admin:subadmin:profile:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const query = `SELECT * FROM sub_admins WHERE id = ?`;

  const [rows] = await db.execute(query, [id]);
  const result = rows[0] || null;

  if (result) {
    await setToCache(cacheKey, result, 3600); // 1 hour
  }
  return result;

};

const updateSubAdmin = async (id, data) => {

  let query = `
UPDATE sub_admins SET
  name = ?,
  email = ?,
  country_code = ?,
  mobile = ?,
  address = ?,
  state = ?,
  country = ?,
  pincode = ?,
  emergency_country_code = ?,
  emergency_mobile = ?,
  role = ?,
  status = ?,
  profile_photo = ?,
  profile_photo_key = ?
`;

  const values = [
    data.name,
    data.email,
    data.countryCode,
    data.mobile,
    data.address,
    data.state,
    data.country,
    data.pincode || null,
    data.emergencyCountryCode || null,
    data.emergencyMobile || null,
    data.role,
    data.status,
    data.profilePhoto || null,
    data.profilePhotoKey || null
  ];

  if (data.password) {
    query += `, password = ?`;
    values.push(data.password);
  }

  query += ` WHERE id = ?`;
  values.push(id);

  const [result] = await db.execute(query, values);

  console.log("UPDATE RESULT:", result);

  // Invalidate caches
  await removeFromCache(`admin:subadmin:profile:${id}`);
  await removeByPattern("admin:subadmins:list:*");

  return {
    id,
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    role: data.role,
    status: data.status,
    profilePhoto: data.profilePhoto,
    profilePhotoKey: data.profilePhotoKey
  };
};

/* ===============================
   TOGGLE STATUS
================================= */

const toggleStatus = async (id) => {

  // check existing admin
  const [rows] = await db.query(
    "SELECT id, status FROM sub_admins WHERE id = ?",
    [id]
  );

  if (!rows.length) return null;

  const admin = rows[0];

  const newStatus =
    admin.status === "Active"
      ? "Inactive"
      : "Active";

  // update status
  await db.query(
    "UPDATE sub_admins SET status = ? WHERE id = ?",
    [newStatus, id]
  );

  // Invalidate caches
  await removeFromCache(`admin:subadmin:profile:${id}`);
  await removeByPattern("admin:subadmins:list:*");

  // return updated record
  const [updated] = await db.query(
    "SELECT * FROM sub_admins WHERE id = ?",
    [id]
  );

  return updated[0];
};

/* ===============================
   DELETE SUB ADMIN
================================= */

const deleteSubAdmin = async (id) => {

  // check if admin exists
  const [rows] = await db.query(
    "SELECT id, status FROM sub_admins WHERE id = ?",
    [id]
  );

  if (!rows.length) {
    return { error: "Sub admin not found" };
  }

  const admin = rows[0];

  // prevent delete if active
  if (admin.status === "Active") {
    return { error: "Admin is active. Please deactivate first." };
  }

  // delete admin
  const [result] = await db.query(
    "DELETE FROM sub_admins WHERE id = ?",
    [id]
  );

  if (!result.affectedRows) {
    return { error: "Failed to delete sub admin" };
  }

  // Invalidate caches
  await removeFromCache(`admin:subadmin:profile:${id}`);
  await removeByPattern("admin:subadmins:list:*");

  return { success: true };
};



/* ===============================
   UPDATE PERMISSIONS
================================= */

const updatePermissions = async (id, permissions) => {

  const uniquePermissions = [...new Set(permissions)];

  const [rows] = await db.query(
    "SELECT id FROM sub_admins WHERE id = ?",
    [id]
  );

  if (!rows.length) {
    return null;
  }

  await db.query(
    "UPDATE sub_admins SET permissions = ? WHERE id = ?",
    [JSON.stringify(uniquePermissions), id]
  );

  // Invalidate caches
  await removeFromCache(`admin:subadmin:profile:${id}`);
  await removeByPattern("admin:subadmins:list:*");

  return {
    id: Number(id),
    permissions: uniquePermissions
  };
};



/* ===============================
   EXPORTS
================================= */

export default {
  getSubAdmins,
  createSubAdmin,
  getSubAdminById,
  updateSubAdmin,
  deleteSubAdmin,
  toggleStatus,
  updatePermissions,
};