import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { getFromCache, setToCache, removeByPattern } from "../../utils/cache.js";
import ApiError from "../../utils/ApiError.js";
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

/**
 * Get all orders for a specific vendor with filtering and pagination
 */
export const getAllOrders = async (vendorId, queryParams = {}) => {
  const cacheKey = `vendor:orders:list:${vendorId}:${JSON.stringify(queryParams)}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const { page, limit, skip } = getPagination(queryParams);

  let where = ["oi.vendor_id = ?"];
  let values = [vendorId];

  if (queryParams.status) {
    where.push("o.order_status = ?");
    values.push(queryParams.status);
  }

  if (queryParams.payment_status) {
    where.push("o.payment_status = ?");
    values.push(queryParams.payment_status);
  }

  if (queryParams.search) {
    where.push("(o.order_number LIKE ? OR c.name LIKE ?)");
    const searchVal = `%${queryParams.search}%`;
    values.push(searchVal, searchVal);
  }

  if (queryParams.fromDate) {
    where.push("o.created_at >= ?");
    values.push(queryParams.fromDate);
  }

  if (queryParams.toDate) {
    where.push("o.created_at <= ?");
    values.push(queryParams.toDate);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Get total count of unique orders for this vendor
  const countQuery = `
    SELECT COUNT(DISTINCT o.id) as total 
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN customers c ON o.customer_id = c.id
    ${whereClause}
  `;
  const [countResult] = await db.query(countQuery, values);
  const totalRecords = countResult[0].total;

  // Fetch orders with customer and item details
  const selectQuery = `
    SELECT 
      o.id,
      o.order_number,
      o.total_amount AS order_total_amount,
      o.payment_method,
      o.payment_status,
      o.order_status as status,
      o.created_at,
      o.updated_at,
      c.name as customerName,
      c.id as customerId,
      c.mobile as customerPhone,
      c.email as customerEmail,
      ca.address_line_1,
      ca.address_line_2,
      ca.city,
      ca.state,
      ca.pincode,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id AND vendor_id = ?) as vendorProductsCount,
      (SELECT SUM(price * quantity) FROM order_items WHERE order_id = o.id AND vendor_id = ?) as vendorTotalAmount
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN customers c ON o.customer_id = c.id
    LEFT JOIN customers_addresses ca ON o.address_id = ca.id
    ${whereClause}
    GROUP BY o.id
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(selectQuery, [vendorId, vendorId, ...values, limit, skip]);

  const orders = rows.map(row => ({
    id: row.id.toString(),
    orderNumber: row.order_number,
    customerName: row.customerName,
    customerId: `CUST-${row.customerId}`,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail,
    productsCount: row.vendorProductsCount,
    totalAmount: parseFloat(row.vendorTotalAmount || 0),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    status: row.status,
    deliveryAddress: `${row.address_line_1}, ${row.address_line_2 ? row.address_line_2 + ', ' : ''}${row.city}, ${row.state} - ${row.pincode}`,
    createdDate: formatDate(row.created_at),
    statusDate: formatDate(row.updated_at)
  }));

  // Fetch items for each order
  for (const order of orders) {
    const [items] = await db.query(`
        SELECT 
            p.name, 
            oi.product_id, 
            oi.quantity as qty, 
            oi.price,
            (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ? AND oi.vendor_id = ?
     `, [order.id, vendorId]);
    order.items = items;
    order.productImage = items[0]?.image || null;
  }

  const result = {
    records: orders,
    pagination: getPaginationMeta(page, limit, totalRecords),
    stats: {
      total: totalRecords,
      pending: await getStatusCount(vendorId, 'Pending'),
      confirmed: await getStatusCount(vendorId, 'Confirmed'),
      shipped: await getStatusCount(vendorId, 'Shipped'),
      out_for_delivery: await getStatusCount(vendorId, 'Out for Delivery'),
      delivered: await getStatusCount(vendorId, 'Delivered'),
      cancelled: await getStatusCount(vendorId, 'Cancelled')
    }
  };

  await setToCache(cacheKey, result, 120); // 2 minutes
  return result;
};

const getStatusCount = async (vendorId, status) => {
  const [rows] = await db.query(`
        SELECT COUNT(DISTINCT o.id) as count 
        FROM orders o 
        JOIN order_items oi ON o.id = oi.order_id 
        WHERE oi.vendor_id = ? AND o.order_status = ?
    `, [vendorId, status]);
  return rows[0].count;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (vendorId, orderId, status) => {
  // 1. Check if vendor has access to this order
  const [access] = await db.query(`
        SELECT 1 FROM order_items WHERE order_id = ? AND vendor_id = ? LIMIT 1
    `, [orderId, vendorId]);

  if (access.length === 0) {
    throw new ApiError(403, "You do not have access to this order");
  }

  // 2. Update status in orders table
  await db.query(`
        UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?
    `, [status, orderId]);

  // 2.1 Log the status update
  const displayTitles = {
      'Pending': 'Order Pending',
      'Confirmed': 'Order Confirmed',
      'Shipped': 'Order Shipped',
      'Out for Delivery': 'Out for Delivery',
      'Delivered': 'Order Delivered',
      'Cancelled': 'Order Cancelled'
  };
  const displayTitle = displayTitles[status] || `Order ${status}`;

  await db.query(`
      INSERT INTO order_status_logs (order_id, status, display_title, changed_by_role, changed_by_id)
      VALUES (?, ?, ?, 'vendor', ?)
  `, [orderId, status, displayTitle, vendorId]);

  // 3. Clear relevant caches
  await removeByPattern(`vendor:orders:list:${vendorId}:*`);
  await removeByPattern(`admin:orders:list:*`);
  await removeByPattern(`admin:order:detail:${orderId}`);
  // If customer caching also existed, we would remove customer order cache here

  return { success: true, message: `Order status updated to ${status}` };
};
