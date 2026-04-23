import { getPagination, getPaginationMeta } from '../../utils/pagination.js';
import buildFilters from '../../utils/filter.js';
import db from '../../config/db.js';
import { getFromCache, setToCache, removeFromCache, removeByPattern } from "../../utils/cache.js";


/* ===============================
   GET VENDOR STAFF
================================= */

const getVendorStaff = async (queryParams) => {
  const cacheKey = `vendor:staff:list:${JSON.stringify(queryParams)}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const { page, limit, skip } = getPagination(queryParams);

  const filters = buildFilters(queryParams, ['name', 'email', 'mobile']);

  let where = [];
  let values = [];

  // VENDOR_ID FILTER
  if (queryParams.vendor_id) {
    where.push('vendor_id = ?');
    values.push(queryParams.vendor_id);
  }

  // ROLE FILTER
  if (filters.role) {
    where.push('role = ?');
    values.push(filters.role);
  }

  // STATUS FILTER
  if (filters.status) {
    where.push('status = ?');
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
    where.push(`(${searchConditions.join(' OR ')})`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // GET RECORDS
  const [records] = await db.query(
    `SELECT * FROM vendor_staff
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, skip]
  );

  // TOTAL COUNT
  const [countResult] = await db.query(
    `SELECT COUNT(*) as total FROM vendor_staff ${whereClause}`,
    values
  );

  const totalRecords = countResult[0].total;
  const pagination = getPaginationMeta(page, limit, totalRecords);

  const formattedRecords = records.map(staff => ({
    id: staff.id,
    vendorId: staff.vendor_id,
    name: staff.name,
    email: staff.email,
    password: staff.password,
    countryCode: staff.country_code,
    mobile: staff.mobile,
    contactNo: `${staff.country_code} ${staff.mobile}`,
    emergencyCountryCode: staff.emergency_country_code,
    emergencyMobile: staff.emergency_mobile,
    emergencyNo: staff.emergency_country_code
      ? `${staff.emergency_country_code} ${staff.emergency_mobile}`
      : null,
    role: staff.role,
    address: staff.address,
    state: staff.state,
    country: staff.country,
    pincode: staff.pincode,
    fullAddress: staff.address ? `${staff.address}, ${staff.state}, ${staff.country}` : null,
    status: staff.status,
    profilePhoto: staff.profile_photo,
    profilePhotoKey: staff.profile_photo_key,
    permissions: Array.isArray(staff.permissions)
      ? staff.permissions
      : staff.permissions
        ? JSON.parse(staff.permissions)
        : [],
    createdAt: staff.created_at
  }));

  // STATS
  const [stats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(status='Active') as active,
        SUM(status='Inactive') as inactive,
        COUNT(DISTINCT role) as rolesDefined
      FROM vendor_staff
      ${whereClause}
  `, values);

  const result = {
    stats: stats[0],
    records: formattedRecords,
    pagination
  };

  await setToCache(cacheKey, result, 600); // 10 mins
  return result;
};


/* ===============================
   GET BY ID
================================= */

const getVendorStaffById = async (id) => {
  const cacheKey = `vendor:staff:profile:${id}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const [rows] = await db.execute('SELECT * FROM vendor_staff WHERE id = ?', [id]);
  const result = rows[0] || null;

  if (result) {
    await setToCache(cacheKey, result, 3600); // 1 hour
  }
  return result;
};


/* ===============================
   CREATE VENDOR STAFF
================================= */

const createVendorStaff = async (data) => {

  /* check duplicate email */
  const [emailExists] = await db.execute(
    'SELECT id FROM vendor_staff WHERE email = ?',
    [data.email]
  );
  if (emailExists.length) throw new Error('Email already exists');

  /* check duplicate mobile */
  const [mobileExists] = await db.execute(
    'SELECT id FROM vendor_staff WHERE mobile = ?',
    [data.mobile]
  );
  if (mobileExists.length) throw new Error('Mobile number already exists');

  const query = `
    INSERT INTO vendor_staff (
      vendor_id,
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
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    data.vendor_id,
    data.name,
    data.email,
    data.password,
    data.countryCode,
    data.mobile,
    data.address || null,
    data.state || null,
    data.country || 'India',
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
  await removeByPattern("vendor:staff:list:*");

  return {
    id: result.insertId,
    vendorId: data.vendor_id,
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
   UPDATE VENDOR STAFF
================================= */

const updateVendorStaff = async (id, data) => {

  const query = `
UPDATE vendor_staff
SET
  name = ?,
  email = ?,
  password = COALESCE(?, password),
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
WHERE id = ?
`;

  const values = [
    data.name,
    data.email,
    data.password || null,
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
    data.profilePhotoKey || null,
    id
  ];

  await db.execute(query, values);

  // Invalidate caches
  await removeFromCache(`vendor:staff:profile:${id}`);
  await removeByPattern("vendor:staff:list:*");

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

  const [rows] = await db.query(
    'SELECT id, status FROM vendor_staff WHERE id = ?',
    [id]
  );

  if (!rows.length) return null;

  const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';

  await db.query(
    'UPDATE vendor_staff SET status = ? WHERE id = ?',
    [newStatus, id]
  );

  // Invalidate caches
  await removeFromCache(`vendor:staff:profile:${id}`);
  await removeByPattern("vendor:staff:list:*");

  const [updated] = await db.query(
    'SELECT * FROM vendor_staff WHERE id = ?',
    [id]
  );

  return updated[0];
};


/* ===============================
   DELETE VENDOR STAFF
================================= */

const deleteVendorStaff = async (id) => {

  const [rows] = await db.query(
    'SELECT id, status FROM vendor_staff WHERE id = ?',
    [id]
  );

  if (!rows.length) return { error: 'Vendor staff not found' };

  if (rows[0].status === 'Active') {
    return { error: 'Staff member is active. Please deactivate first.' };
  }

  const [result] = await db.query(
    'DELETE FROM vendor_staff WHERE id = ?',
    [id]
  );

  if (!result.affectedRows) return { error: 'Failed to delete vendor staff' };

  // Invalidate caches
  await removeFromCache(`vendor:staff:profile:${id}`);
  await removeByPattern("vendor:staff:list:*");

  return { success: true };
};


/* ===============================
   UPDATE PERMISSIONS
================================= */

const updatePermissions = async (id, permissions) => {

  const uniquePermissions = [...new Set(permissions)];

  const [rows] = await db.query(
    'SELECT id FROM vendor_staff WHERE id = ?',
    [id]
  );

  if (!rows.length) return null;

  await db.query(
    'UPDATE vendor_staff SET permissions = ? WHERE id = ?',
    [JSON.stringify(uniquePermissions), id]
  );

  // Invalidate caches
  await removeFromCache(`vendor:staff:profile:${id}`);
  await removeByPattern("vendor:staff:list:*");

  return {
    id: Number(id),
    permissions: uniquePermissions
  };
};


/* ===============================
   EXPORTS
================================= */

export default {
  getVendorStaff,
  getVendorStaffById,
  createVendorStaff,
  updateVendorStaff,
  deleteVendorStaff,
  toggleStatus,
  updatePermissions
};
