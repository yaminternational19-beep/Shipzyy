import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { getFromCache, setToCache, removeByPattern } from "../../utils/cache.js";
import ApiError from "../../utils/ApiError.js";
import { createInvoicesForOrder } from "../invoices/invoices.service.js";
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
    where.push("oi.item_status = ?");
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
      o.order_status as global_status,
      o.payment_status as global_payment_status,
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
      -- Vendor Specific Calculations
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id AND vendor_id = ?) as vendorProductsCount,
      (SELECT SUM(price * quantity) FROM order_items WHERE order_id = o.id AND vendor_id = ?) as vendorTotalAmount,
      (SELECT 
          CASE 
              WHEN COUNT(*) = SUM(CASE WHEN payment_status = 'Paid' THEN 1 ELSE 0 END) THEN 'Paid'
              WHEN SUM(CASE WHEN payment_status = 'Refunded' THEN 1 ELSE 0 END) > 0 THEN 'Refunded'
              ELSE 'Pending'
          END
       FROM order_items WHERE order_id = o.id AND vendor_id = ?) as payment_status,
      (SELECT item_status FROM order_items WHERE order_id = o.id AND vendor_id = ? ORDER BY 
        FIELD(item_status, 'Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Return Requested', 'Delivered', 'Returned', 'Refunded', 'Cancelled') ASC LIMIT 1) as vendor_status
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    LEFT JOIN customers_addresses ca ON o.address_id = ca.id
    WHERE o.id IN (SELECT DISTINCT order_id FROM order_items WHERE vendor_id = ?)
      ${where.length > 1 ? ' AND ' + where.slice(1).join(" AND ") : ""}
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;


  const [rows] = await db.query(selectQuery, [vendorId, vendorId, vendorId, vendorId, vendorId, ...values.slice(1), limit, skip]);

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
    status: row.vendor_status, // Show the vendor's specific status
    globalStatus: row.global_status,
    deliveryAddress: `${row.address_line_1}, ${row.address_line_2 ? row.address_line_2 + ', ' : ''}${row.city}, ${row.state} - ${row.pincode}`,
    createdDate: formatDate(row.created_at),
    statusDate: formatDate(row.updated_at)
  }));

  // Fetch items for each order
  for (const order of orders) {
    const [items] = await db.query(`
        SELECT 
            oi.id as itemId,
            p.name, 
            oi.product_id, 
            oi.quantity as qty, 
            oi.price,
            oi.item_status as status,
            oi.payment_status as paymentStatus,
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
      cancelled: await getStatusCount(vendorId, 'Cancelled'),
      paid: await getPaymentStatusCount(vendorId, 'Paid'),
      unpaid: await getPaymentStatusCount(vendorId, 'Pending')
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
        WHERE oi.vendor_id = ? AND oi.item_status = ?
    `, [vendorId, status]);
  return rows[0].count;
};

const getPaymentStatusCount = async (vendorId, status) => {
  const [rows] = await db.query(`
          SELECT COUNT(DISTINCT o.id) as count 
          FROM orders o 
          JOIN order_items oi ON o.id = oi.order_id 
          WHERE oi.vendor_id = ? AND o.payment_status = ?
      `, [vendorId, status]);
  return rows[0].count;
};

/**
 * Helper to synchronize the main order status based on all item statuses
 */
const syncMainOrderStatus = async (orderId) => {
  const [items] = await db.query(
    "SELECT item_status FROM order_items WHERE order_id = ?",
    [orderId]
  );

  if (items.length === 0) return;

  const statuses = items.map(i => i.item_status);
  const uniqueStatuses = [...new Set(statuses)];

  let mainStatus = 'Pending';

  // 1. If all items are delivered
  if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'Delivered') {
    mainStatus = 'Delivered';
  }
  // 2. If all items are cancelled
  else if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'Cancelled') {
    mainStatus = 'Cancelled';
  }
  // 3. If all items are refunded
  else if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'Refunded') {
    mainStatus = 'Refunded';
  }
  // 4. Handle Returns/Refunds mixing with others
  else if (statuses.includes('Refunded')) {
    mainStatus = 'Refunded'; // Or "Partially Refunded" if you want to be very specific
  }
  else if (statuses.includes('Returned')) {
    mainStatus = 'Returned';
  }
  else if (statuses.includes('Return Requested')) {
    mainStatus = 'Return Requested';
  }
  // 5. If some are delivered and others are still in progress
  else if (statuses.includes('Delivered')) {
    mainStatus = 'Partially Delivered';
  }
  // 6. If any item is shipped/out for delivery
  else if (statuses.includes('Shipped') || statuses.includes('Out for Delivery')) {
    mainStatus = 'Partially Shipped';
  }
  // 7. If all items are at least confirmed
  else if (!statuses.includes('Pending')) {
    mainStatus = 'Confirmed';
  }

  await db.query("UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?", [mainStatus, orderId]);
  return mainStatus;
};

/**
 * Update order status (Item-Level for Vendors)
 */
export const updateOrderStatus = async (vendorId, orderId, status) => {
  // 1. Update item_status for this vendor's items in the order
  const [result] = await db.query(`
        UPDATE order_items 
        SET item_status = ?, status_updated_at = NOW() 
        WHERE order_id = ? AND vendor_id = ?
    `, [status, orderId, vendorId]);

  if (result.affectedRows === 0) {
    throw new ApiError(403, "You do not have access to this order or no items were found");
  }

  // 2. Sync the main order status based on all items
  const newMainStatus = await syncMainOrderStatus(orderId);

  // 3. Log the status update
  const displayTitles = {
    'Pending': 'Vendor Pending',
    'Confirmed': 'Vendor Confirmed',
    'Shipped': 'Vendor Shipped',
    'Out for Delivery': 'Out for Delivery',
    'Delivered': 'Vendor Delivered',
    'Cancelled': 'Vendor Cancelled'
  };
  const displayTitle = displayTitles[status] || `Vendor ${status}`;

  await db.query(`
      INSERT INTO order_status_logs (order_id, status, display_title, changed_by_role, changed_by_id)
      VALUES (?, ?, ?, 'vendor', ?)
  `, [orderId, status, displayTitle, vendorId]);

  // 4. Clear relevant caches
  await removeByPattern(`vendor:orders:list:${vendorId}:*`);
  await removeByPattern(`admin:orders:list:*`);
  await removeByPattern(`admin:order:detail:${orderId}`);

  return { success: true, message: `Your items in order ${orderId} updated to ${status}. Main order is now ${newMainStatus}.` };
};

/**
 * Helper to synchronize main payment status based on items
 */
const syncMainPaymentStatus = async (orderId) => {
  const [items] = await db.query(
    "SELECT payment_status FROM order_items WHERE order_id = ?",
    [orderId]
  );

  if (items.length === 0) return;

  const statuses = items.map(i => i.payment_status);
  const uniqueStatuses = [...new Set(statuses)];

  let mainPaymentStatus = 'Pending';

  // 1. If all items are paid
  if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'Paid') {
    mainPaymentStatus = 'Paid';
  }
  // 2. If some are paid and others are still pending
  else if (statuses.includes('Paid')) {
    mainPaymentStatus = 'Pending'; // Order is still pending overall until all are paid
  }
  // 3. Handle refunds
  else if (uniqueStatuses.includes('Refunded')) {
    mainPaymentStatus = 'Refunded';
  }

  await db.query("UPDATE orders SET payment_status = ?, updated_at = NOW() WHERE id = ?", [mainPaymentStatus, orderId]);
  return mainPaymentStatus;
};

/**
 * Handle manual payment status update (Item-Level)
 */
export const updatePaymentStatus = async (userId, role, orderId, paymentStatus) => {
  // 1. Fetch current order info for validation
  const [orderInfo] = await db.query(
    "SELECT payment_method, order_status FROM orders WHERE id = ?",
    [orderId]
  );

  if (orderInfo.length === 0) {
    throw new ApiError(404, "Order not found");
  }

  const { payment_method, order_status } = orderInfo[0];

  // 2. Role-based Validation
  const isVendor = ['VENDOR_OWNER', 'VENDOR_STAFF'].includes(role);
  if (isVendor && payment_method !== 'COD') {
    throw new ApiError(403, "Vendors can only update payment status for COD orders. Online payments are handled by the system.");
  }

  // 3. Status-based Validation
  if (order_status === 'Cancelled') {
    throw new ApiError(400, "Cannot update payment status for a cancelled order.");
  }

  const allowedStatusesForPaid = ['Delivered', 'Partially Delivered', 'Returned', 'Refunded'];
  if (payment_method === 'COD' && !allowedStatusesForPaid.includes(order_status) && paymentStatus === 'Paid') {
    throw new ApiError(400, "COD items can only be marked as 'Paid' after they are Delivered.");
  }

  // 4. Update Item-Level Payment Status
  if (isVendor) {
    // Vendor only updates their own items
    await db.query(`
            UPDATE order_items 
            SET payment_status = ?, status_updated_at = NOW() 
            WHERE order_id = ? AND vendor_id = ?
        `, [paymentStatus, orderId, userId]);
  } else {
    // Admin updates all items in the order
    await db.query(`
            UPDATE order_items 
            SET payment_status = ?, status_updated_at = NOW() 
            WHERE order_id = ?
        `, [paymentStatus, orderId]);
  }

  // 5. Sync main order payment status
  const newMainPaymentStatus = await syncMainPaymentStatus(orderId);

  // 6. If marked as Paid, generate invoices (if all items are now paid)
  if (newMainPaymentStatus === 'Paid') {
    const [invExists] = await db.query("SELECT 1 FROM customer_invoices WHERE order_id = ? LIMIT 1", [orderId]);
    if (invExists.length === 0) {
      createInvoicesForOrder(orderId).catch(err =>
        console.error(`Background Invoice Generation Error for Order ${orderId}:`, err)
      );
    }
  }

  // 7. Clear caches
  const [vendors] = await db.query("SELECT DISTINCT vendor_id FROM order_items WHERE order_id = ?", [orderId]);
  for (const v of vendors) {
    await removeByPattern(`vendor:orders:list:${v.vendor_id}:*`);
  }

  await removeByPattern(`admin:orders:list:*`);
  await removeByPattern(`admin:order:detail:${orderId}`);

  return {
    success: true,
    message: `Payment status updated to ${paymentStatus} for your items.`,
    globalPaymentStatus: newMainPaymentStatus
  };
};

/**
 * Handle Return Request from Customer
 */
