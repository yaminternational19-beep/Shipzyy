import db from '../../config/db.js';
import { getPagination, getPaginationMeta } from '../../utils/pagination.js';
import { removeByPattern } from "../../utils/cache.js";

const createDeliveryCharge = async (data) => {
  const query = `
    INSERT INTO delivery_charges (
      type, area_name, min_distance, max_distance, charge_amount, 
      min_order_amount, free_delivery_above, status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.type, data.area_name || null, data.min_distance || null, data.max_distance || null,
    data.charge_amount, data.min_order_amount || 0, data.free_delivery_above || null, data.status || 'Active'
  ];

  const [result] = await db.query(query, values);
  await removeByPattern("admin:delivery_charges:*");

  return { id: result.insertId, ...data };
};

const getDeliveryCharges = async (queryParams) => {
  const { page, limit, skip } = getPagination(queryParams);
  let where = [];
  let values = [];

  if (queryParams.search) {
    where.push("(area_name LIKE ? OR type LIKE ?)");
    values.push(`%${queryParams.search}%`, `%${queryParams.search}%`);
  }

  if (queryParams.status && queryParams.status !== 'All') {
    where.push("status = ?");
    values.push(queryParams.status);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const [countResult] = await db.query(`SELECT COUNT(*) as total FROM delivery_charges ${whereClause}`, values);
  const totalRecords = countResult[0].total;

  const [records] = await db.query(
    `SELECT * FROM delivery_charges ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, skip]
  );

  return {
    records,
    pagination: getPaginationMeta(page, limit, totalRecords)
  };
};

const updateDeliveryCharge = async (id, data) => {
  const [rows] = await db.query(`SELECT * FROM delivery_charges WHERE id = ?`, [id]);
  if (rows.length === 0) throw new Error("Delivery charge definition not found");

  const charge = rows[0];
  const query = `
    UPDATE delivery_charges 
    SET type = ?, area_name = ?, min_distance = ?, max_distance = ?, charge_amount = ?, 
        min_order_amount = ?, free_delivery_above = ?, status = ?
    WHERE id = ?
  `;
  const values = [
    data.type ?? charge.type,
    data.area_name !== undefined ? data.area_name : charge.area_name,
    data.min_distance !== undefined ? data.min_distance : charge.min_distance,
    data.max_distance !== undefined ? data.max_distance : charge.max_distance,
    data.charge_amount ?? charge.charge_amount,
    data.min_order_amount ?? charge.min_order_amount,
    data.free_delivery_above !== undefined ? data.free_delivery_above : charge.free_delivery_above,
    data.status ?? charge.status,
    id
  ];

  await db.query(query, values);
  await removeByPattern("admin:delivery_charges:*");

  return { id, ...data };
};

const deleteDeliveryCharge = async (id) => {
  const [rows] = await db.query(`SELECT * FROM delivery_charges WHERE id = ?`, [id]);
  if (rows.length === 0) throw new Error("Delivery charge not found");

  await db.query(`DELETE FROM delivery_charges WHERE id = ?`, [id]);
  await removeByPattern("admin:delivery_charges:*");

  return { id, message: "Deleted successfully" };
};

const toggleStatus = async (id) => {
  const [rows] = await db.query(`SELECT status FROM delivery_charges WHERE id = ?`, [id]);
  if (rows.length === 0) throw new Error("Delivery charge not found");

  const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';
  await db.query(`UPDATE delivery_charges SET status = ? WHERE id = ?`, [newStatus, id]);
  await removeByPattern("admin:delivery_charges:*");

  return { id, status: newStatus };
};

export default { createDeliveryCharge, getDeliveryCharges, updateDeliveryCharge, deleteDeliveryCharge, toggleStatus };
