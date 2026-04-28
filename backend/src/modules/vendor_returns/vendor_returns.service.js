import db from "../../config/db.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Get all returns for a vendor
 */
export const getVendorReturns = async (vendorId, filters = {}) => {
  const { page = 1, limit = 10, status, search } = filters;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT r.id as return_id, r.reason, r.status as return_status, r.created_at as return_requested_at, r.images,
           oi.id as item_id, oi.quantity, oi.price, oi.item_status,
           o.order_number, o.created_at as order_date,
           p.name as product_name, p.slug as product_slug, (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as featured_image,
           c.name as customer_name, c.email as customer_email, c.full_phone as customer_phone
    FROM order_returns r
    JOIN order_items oi ON r.order_item_id = oi.id
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    JOIN customers c ON r.customer_id = c.id
    WHERE r.vendor_id = ?
  `;
  
  const queryParams = [vendorId];
  
  if (status) {
    query += ` AND r.status = ?`;
    queryParams.push(status);
  }
  
  if (search) {
    query += ` AND (o.order_number LIKE ? OR p.name LIKE ? OR c.name LIKE ?)`;
    queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(Number(limit), Number(offset));
  
  const [returns] = await db.query(query, queryParams);
  
  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total
    FROM order_returns r
    JOIN order_items oi ON r.order_item_id = oi.id
    JOIN orders o ON oi.order_id = o.id
    JOIN products p ON oi.product_id = p.id
    JOIN customers c ON r.customer_id = c.id
    WHERE r.vendor_id = ?
  `;
  
  const countParams = [vendorId];
  
  if (status) {
    countQuery += ` AND r.status = ?`;
    countParams.push(status);
  }
  
  if (search) {
    countQuery += ` AND (o.order_number LIKE ? OR p.name LIKE ? OR c.name LIKE ?)`;
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  const [countResult] = await db.query(countQuery, countParams);
  const total = countResult[0].total;
  
  return {
    returns,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Update the status of a return
 */
export const updateReturnStatus = async (vendorId, returnId, newStatus, vendorNotes) => {
  const [returnRecs] = await db.query(
    `SELECT r.*, oi.order_id, oi.product_id, oi.quantity 
     FROM order_returns r 
     JOIN order_items oi ON r.order_item_id = oi.id 
     WHERE r.id = ? AND r.vendor_id = ?`,
    [returnId, vendorId]
  );

  if (returnRecs.length === 0) {
    throw new ApiError(404, "Return request not found");
  }

  const returnRec = returnRecs[0];
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Update order_returns table
    await connection.query(
      `UPDATE order_returns SET status = ?, vendor_notes = ?, updated_at = NOW() WHERE id = ?`,
      [newStatus, vendorNotes || returnRec.vendor_notes, returnId]
    );

    // 2. Update order_items status if necessary
    let newItemStatus = null;
    let logTitle = `Vendor marked return as ${newStatus}`;

    if (newStatus === 'Received') {
      newItemStatus = 'Returned';
      logTitle = 'Return Received and Restocked';
      // Restore stock when received
      await connection.query(
        `UPDATE product_variants SET stock = stock + ? WHERE product_id = ? LIMIT 1`,
        [returnRec.quantity, returnRec.product_id]
      );
    } else if (newStatus === 'Approved') {
      newItemStatus = 'Return Approved';
      logTitle = 'Return Approved by Vendor';
    } else if (newStatus === 'Picked Up') {
      newItemStatus = 'Return Picked Up';
      logTitle = 'Item Picked Up by Courier';
    } else if (newStatus === 'Rejected') {
      newItemStatus = 'Return Rejected';
      logTitle = 'Return Request Rejected by Vendor';
    }

    if (newItemStatus) {
      await connection.query(
        `UPDATE order_items SET item_status = ?, status_updated_at = NOW() WHERE id = ?`,
        [newItemStatus, returnRec.order_item_id]
      );
    }

    // Always log status changes
    await connection.query(
      `INSERT INTO order_status_logs (order_id, status, display_title, changed_by_role, changed_by_id)
       VALUES (?, ?, ?, 'vendor', ?)`,
      [returnRec.order_id, newItemStatus || returnRec.item_status, logTitle, vendorId]
    );

    // Sync main order status
    const [allItems] = await connection.query(
      `SELECT item_status FROM order_items WHERE order_id = ?`,
      [returnRec.order_id]
    );
    const statuses = allItems.map(i => i.item_status);
    
    let mainStatus = 'Return Requested';
    const uniqueStatuses = [...new Set(statuses)];
    if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'Delivered') mainStatus = 'Delivered';
    else if (uniqueStatuses.length === 1 && uniqueStatuses[0] === 'Cancelled') mainStatus = 'Cancelled';
    else if (statuses.includes('Returned')) mainStatus = 'Returned';
    else if (statuses.includes('Return Picked Up')) mainStatus = 'Return Picked Up';
    else if (statuses.includes('Return Approved')) mainStatus = 'Return Approved';
    else if (statuses.includes('Return Requested')) mainStatus = 'Return Requested';
    else if (statuses.includes('Delivered')) mainStatus = 'Partially Delivered';
    else if (statuses.includes('Shipped') || statuses.includes('Out for Delivery')) mainStatus = 'Partially Shipped';
    else if (!statuses.includes('Pending')) mainStatus = 'Confirmed';

    await connection.query(
      `UPDATE orders SET order_status = ?, updated_at = NOW() WHERE id = ?`,
      [mainStatus, returnRec.order_id]
    );

    await connection.commit();
    return { success: true, message: `Return status updated to ${newStatus}` };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
