import db from '../../config/db.js';
import { getPagination, getPaginationMeta } from '../../utils/pagination.js';
import { removeByPattern } from "../../utils/cache.js";

const createCoupon = async (data) => {
  const query = `
    INSERT INTO coupons (
      code, title, description, discount_type, discount_value, 
      min_order_value, max_discount_amount, usage_limit, expiry_date, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.code, data.title, data.description || "", data.discount_type, data.discount_value,
    data.min_order_value || 0, data.max_discount_amount || 0, data.usage_limit || null, 
    data.expiry_date || null, data.status || 'Active'
  ];

  const [result] = await db.query(query, values);

  await removeByPattern("admin:coupons:*");

  return { id: result.insertId, ...data };
};

const getCoupons = async (queryParams) => {
  const { page, limit, skip } = getPagination(queryParams);
  let where = [];
  let values = [];

  if (queryParams.search) {
    where.push("(code LIKE ? OR title LIKE ?)");
    values.push(`%${queryParams.search}%`, `%${queryParams.search}%`);
  }

  if (queryParams.status && queryParams.status !== 'All') {
    where.push("status = ?");
    values.push(queryParams.status);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countResult] = await db.query(`SELECT COUNT(*) as total FROM coupons ${whereClause}`, values);
  const totalRecords = countResult[0].total;

  const [records] = await db.query(
    `SELECT * FROM coupons ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, skip]
  );

  return {
    records,
    pagination: getPaginationMeta(page, limit, totalRecords)
  };
};

const updateCoupon = async (id, data) => {
  const [rows] = await db.query(`SELECT * FROM coupons WHERE id = ?`, [id]);
  if (rows.length === 0) throw new Error("Coupon not found");

  const coupon = rows[0];
  const query = `
    UPDATE coupons 
    SET code = ?, title = ?, description = ?, discount_type = ?, discount_value = ?, 
        min_order_value = ?, max_discount_amount = ?, usage_limit = ?, expiry_date = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    data.code ?? coupon.code,
    data.title ?? coupon.title,
    data.description ?? coupon.description,
    data.discount_type ?? coupon.discount_type,
    data.discount_value ?? coupon.discount_value,
    data.min_order_value ?? coupon.min_order_value,
    data.max_discount_amount ?? coupon.max_discount_amount,
    data.usage_limit ?? coupon.usage_limit,
    data.expiry_date ?? coupon.expiry_date,
    data.status ?? coupon.status,
    id
  ];

  await db.query(query, values);
  await removeByPattern("admin:coupons:*");

  return { id, ...data };
};

const deleteCoupon = async (id) => {
  const [rows] = await db.query(`SELECT * FROM coupons WHERE id = ?`, [id]);
  if (rows.length === 0) throw new Error("Coupon not found");

  await db.query(`DELETE FROM coupons WHERE id = ?`, [id]);
  await removeByPattern("admin:coupons:*");

  return { id, message: "Deleted successfully" };
};

const toggleStatus = async (id) => {
  const [rows] = await db.query(`SELECT status FROM coupons WHERE id = ?`, [id]);
  if (rows.length === 0) throw new Error("Coupon not found");

  const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';
  await db.query(`UPDATE coupons SET status = ? WHERE id = ?`, [newStatus, id]);
  await removeByPattern("admin:coupons:*");

  return { id, status: newStatus };
};

export default { createCoupon, getCoupons, updateCoupon, deleteCoupon, toggleStatus };
