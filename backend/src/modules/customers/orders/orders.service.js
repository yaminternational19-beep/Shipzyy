import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";
import { getCartItems } from "../cart/cart.service.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";
import { createInvoicesForOrder } from "../../invoices/invoices.service.js";

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

/**
 * Haversine formula — calculates distance in KM between two lat/lng points
 */
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get customer's delivery address (default or specified by address_id)
 */
const getCustomerAddress = async (customerId, addressId = null) => {
  let query, params;
  if (addressId) {
    query = `SELECT latitude, longitude, city FROM customers_addresses WHERE id = ? AND customer_id = ? LIMIT 1`;
    params = [addressId, customerId];
  } else {
    query = `SELECT latitude, longitude, city FROM customers_addresses WHERE customer_id = ? AND is_default = 1 LIMIT 1`;
    params = [customerId];
  }
  const [rows] = await db.query(query, params);
  return rows[0] || null;
};

/**
 * Get all unique vendor locations from cart items
 */
const getVendorLocations = async (vendorIds) => {
  const placeholders = vendorIds.map(() => "?").join(", ");
  const [rows] = await db.query(
    `SELECT id, latitude, longitude, city FROM vendors WHERE id IN (${placeholders})`,
    vendorIds
  );
  return rows;
};

/**
 * Get delivery charge from DB based on distance (km) and subtotal
 */
const getDeliveryChargeByDistance = async (distanceKm, subtotal) => {
  // Priority 1: Distance-based rule
  const [distanceRows] = await db.query(
    `SELECT charge_amount, free_delivery_above
     FROM delivery_charges
     WHERE status = 'Active'
       AND type = 'Distance'
       AND (min_distance IS NULL OR min_distance <= ?)
       AND (max_distance IS NULL OR max_distance >= ?)
     ORDER BY charge_amount ASC
     LIMIT 1`,
    [distanceKm, distanceKm]
  );

  if (distanceRows.length > 0) {
    const rule = distanceRows[0];
    if (rule.free_delivery_above !== null && subtotal >= parseFloat(rule.free_delivery_above)) {
      return { charge: 0, distance_km: parseFloat(distanceKm.toFixed(2)) };
    }
    return { charge: parseFloat(rule.charge_amount), distance_km: parseFloat(distanceKm.toFixed(2)) };
  }

  // Priority 2: Area/amount-based fallback
  const [amountRows] = await db.query(
    `SELECT charge_amount, free_delivery_above
     FROM delivery_charges
     WHERE status = 'Active'
       AND type = 'Area'
       AND (min_order_amount IS NULL OR min_order_amount <= ?)
     ORDER BY charge_amount ASC
     LIMIT 1`,
    [subtotal]
  );

  if (amountRows.length > 0) {
    const rule = amountRows[0];
    if (rule.free_delivery_above !== null && subtotal >= parseFloat(rule.free_delivery_above)) {
      return { charge: 0, distance_km: parseFloat(distanceKm.toFixed(2)) };
    }
    return { charge: parseFloat(rule.charge_amount), distance_km: parseFloat(distanceKm.toFixed(2)) };
  }

  return { charge: 0, distance_km: parseFloat(distanceKm.toFixed(2)) };
};

/**
 * Validate and apply coupon code (Checks global limits and per-customer limits)
 */
export const applyCoupon = async (customerId, couponCode, subtotal, excludeOrderId = null) => {
  if (!couponCode || couponCode === "null" || couponCode === "undefined") {
    return { discount: 0, coupon: null };
  }

  // 1. Fetch Coupon & check global validity
  const [rows] = await db.query(
    `SELECT * FROM coupons
     WHERE code = ?
       AND status = 'Active'
       AND (expiry_date IS NULL OR expiry_date > NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)
     LIMIT 1`,
    [couponCode.toUpperCase()]
  );

  if (rows.length === 0) {
    throw new ApiError(400, "Invalid, expired, or fully claimed coupon code", "INVALID_COUPON");
  }

  const coupon = rows[0];

  // 2. Check minimum order value
  if (subtotal < parseFloat(coupon.min_order_value)) {
    throw new ApiError(
      400,
      `Minimum order value of ₹${coupon.min_order_value} required for this coupon`,
      "MIN_ORDER_NOT_MET"
    );
  }

  // 3. To enforce "one time per customer", check past orders!
  try {
    let usageQuery = `SELECT COUNT(*) as usage_count FROM orders WHERE customer_id = ? AND coupon_code = ?`;
    let queryParams = [customerId, coupon.code];

    if (excludeOrderId) {
        usageQuery += ` AND id != ?`;
        queryParams.push(excludeOrderId);
    }

    const [pastUsage] = await db.query(usageQuery, queryParams);
    if (pastUsage[0].usage_count > 0) {
      throw new ApiError(400, "You have already used this coupon", "COUPON_ALREADY_USED");
    }
  } catch (err) {
    if (err.code !== 'ER_NO_SUCH_TABLE') throw err;
  }

  // 4. Calculate discount
  let discount = 0;

  if (coupon.discount_type === "Fixed") {
    discount = parseFloat(coupon.discount_value);
  } else if (coupon.discount_type === "Percentage") {
    discount = (subtotal * parseFloat(coupon.discount_value)) / 100;
    // Cap at max_discount_amount if set
    if (coupon.max_discount_amount && discount > parseFloat(coupon.max_discount_amount)) {
      discount = parseFloat(coupon.max_discount_amount);
    }
  }

  // Discount cannot exceed subtotal
  discount = Math.min(discount, subtotal);

  return {
    discount: parseFloat(discount.toFixed(2)),
    coupon: {
      code: coupon.code,
      title: coupon.title,
      discount_type: coupon.discount_type,
      discount_value: parseFloat(coupon.discount_value),
    },
  };
};

const getEligibleCoupons = async (customerId, subtotal) => {
  // 1. Get coupons used by this specific customer in the past
  const [usedCouponsRows] = await db.query(
    `SELECT coupon_code FROM orders WHERE customer_id = ? AND coupon_code IS NOT NULL`,
    [customerId]
  );
  const usedCodes = usedCouponsRows.map(row => row.coupon_code.toUpperCase());

  // 2. Fetch active coupons
  const [rows] = await db.query(
    `SELECT id, code, title, description, discount_type, discount_value,
            min_order_value, max_discount_amount, expiry_date
     FROM coupons
     WHERE status = 'Active'
       AND (expiry_date IS NULL OR expiry_date > NOW())
       AND (usage_limit IS NULL OR used_count < usage_limit)
       AND (min_order_value IS NULL OR min_order_value <= ?)
     ORDER BY discount_value DESC`,
    [subtotal]
  );

  // 3. Filter out those already used by this customer
  return rows
    .filter(coupon => !usedCodes.includes(coupon.code.toUpperCase()))
    .map(coupon => {
      let discount_preview = 0;
      if (coupon.discount_type === "Fixed") {
        discount_preview = parseFloat(coupon.discount_value);
      } else if (coupon.discount_type === "Percentage") {
        discount_preview = (subtotal * parseFloat(coupon.discount_value)) / 100;
        if (coupon.max_discount_amount && discount_preview > parseFloat(coupon.max_discount_amount)) {
          discount_preview = parseFloat(coupon.max_discount_amount);
        }
      }
      discount_preview = Math.min(discount_preview, subtotal);

      return {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description || null,
        discount_type: coupon.discount_type,
        discount_value: parseFloat(coupon.discount_value),
        max_discount_amount: coupon.max_discount_amount ? parseFloat(coupon.max_discount_amount) : null,
        min_order_value: parseFloat(coupon.min_order_value),
        discount_preview: parseFloat(discount_preview.toFixed(2)),
        expiry_date: formatDate(coupon.expiry_date),
      };
    });
};

export const getCheckoutSummary = async (customerId, options = {}) => {
  const { address_id, coupon_code, excludeOrderId } = options;

  // 1. Get cart items
  const cart = await getCartItems(customerId);
  const items = cart.items || [];

  if (items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  // 2. Calculate subtotal from available items
  let subtotal = 0;
  items.forEach(item => {
    if (item.is_available) {
      subtotal += parseFloat(item.offer_price) * item.quantity;
    }
  });

  // 3. Fetch vendor IDs directly from cart table (vendor_id not in cart items response)
  const [vendorIdRows] = await db.query(
    `SELECT DISTINCT vendor_id FROM customers_cart WHERE customer_id = ?`,
    [customerId]
  );
  const vendorIds = vendorIdRows.map(r => r.vendor_id);

  // 4. Apply coupon discount (on subtotal before delivery)
  const { discount, coupon } = await applyCoupon(customerId, coupon_code, subtotal, excludeOrderId);
  const discountedSubtotal = subtotal - discount;

  // 5. Check if customer has ANY saved address
  const [addressCountRows] = await db.query(
    `SELECT COUNT(*) as count FROM customers_addresses WHERE customer_id = ?`,
    [customerId]
  );
  const addressCount = addressCountRows[0]?.count || 0;

  if (addressCount === 0) {
    throw new ApiError(
      400,
      "Please add a delivery address before proceeding to checkout",
      "NO_ADDRESS_FOUND"
    );
  }

  // 6. Get customer's selected/default delivery address
  const customerAddress = await getCustomerAddress(customerId, address_id);

  if (!customerAddress) {
    throw new ApiError(
      400,
      "No address found. Please select a delivery address",
      "NO_DEFAULT_ADDRESS"
    );
  }

  let deliveryCharges = 0;
  let distance_km = null;

  // Check if coordinates are valid (non-null and non-zero)
  const hasValidCoords =
    customerAddress.latitude &&
    customerAddress.longitude &&
    parseFloat(customerAddress.latitude) !== 0 &&
    parseFloat(customerAddress.longitude) !== 0;

  if (!hasValidCoords) {
    // Address exists but lat/lng not set — fallback to first active charge
    const [fallbackRows] = await db.query(
      `SELECT charge_amount, free_delivery_above FROM delivery_charges WHERE status = 'Active' ORDER BY charge_amount ASC LIMIT 1`
    );
    if (fallbackRows.length > 0) {
      const rule = fallbackRows[0];
      deliveryCharges =
        rule.free_delivery_above && subtotal >= parseFloat(rule.free_delivery_above)
          ? 0
          : parseFloat(rule.charge_amount);
    }
  } else {
    // 7. Get vendor locations & calculate max distance
    let maxDistanceKm = 0;

    if (vendorIds.length > 0) {
      const vendors = await getVendorLocations(vendorIds);
      for (const vendor of vendors) {
        if (vendor.latitude && vendor.longitude) {
          const distKm = calculateDistanceKm(
            parseFloat(customerAddress.latitude),
            parseFloat(customerAddress.longitude),
            parseFloat(vendor.latitude),
            parseFloat(vendor.longitude)
          );
          if (distKm > maxDistanceKm) maxDistanceKm = distKm;
        }
      }
    }

    // 8. Get delivery charge from DB based on distance
    const result = await getDeliveryChargeByDistance(maxDistanceKm, subtotal);
    deliveryCharges = result.charge;
    distance_km = result.distance_km;
  }

  const total = discountedSubtotal + deliveryCharges;

  // 9. Fetch all eligible unused coupons for this order
  const eligible_coupons = await getEligibleCoupons(customerId, subtotal);

  // Build response
  const response = {
    order_summary: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      delivery_charges: parseFloat(deliveryCharges.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    },
    eligible_coupons,    // all eligible unused coupons
  };

  if (coupon) {
    response.coupon_applied = coupon;  // the selected/applied coupon
  }

  if (distance_km !== null) {
    response.delivery_info = {
      distance_km,
      delivery_address: customerAddress?.city || null,
    };
  }

  return response;
};

export const placeOrder = async (customerId, payload) => {
  const { address_id, coupon_code, payment_method } = payload;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Check if there's an existing PENDING order for this customer
    const [existingOrders] = await connection.query(
      `SELECT id, order_number, coupon_code, total_amount, address_id, payment_method 
       FROM orders 
       WHERE customer_id = ? AND order_status = 'Pending' AND payment_status = 'Pending'
       ORDER BY created_at DESC LIMIT 1`,
      [customerId]
    );

    let existingOrder = existingOrders[0] || null;

    // 2. Re-calculate everything securely using our robust checkout summary logic
    // Pass existingOrder.id to allow re-using the same coupon if it's the same flow
    const summary = await getCheckoutSummary(customerId, { 
        address_id, 
        coupon_code, 
        excludeOrderId: existingOrder?.id 
    });
    
    const { subtotal, discount, delivery_charges, total } = summary.order_summary;

    // 3. Get active cart items directly from DB (bypassing cache)
    const [cartItems] = await connection.query(
      `SELECT product_id, vendor_id, quantity, offer_price 
       FROM customers_cart 
       WHERE customer_id = ? AND is_available = 1`,
      [customerId]
    );

    if (cartItems.length === 0) {
      throw new ApiError(400, "No available products in cart to order");
    }

    let orderId;
    let orderNumber;
    let order_status;
    let message = "Order placed successfully";

    if (existingOrder) {
      // 4. SMART LOGIC: Check if it's an exact duplicate
      const [existingItems] = await connection.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
        [existingOrder.id]
      );

      // Compare cartItems with existingItems
      const isIdentical = 
          cartItems.length === existingItems.length && 
          cartItems.every(ci => existingItems.some(ei => ei.product_id === ci.product_id && ei.quantity === ci.quantity)) &&
          existingOrder.address_id === parseInt(address_id) &&
          existingOrder.payment_method === payment_method &&
          (existingOrder.coupon_code || null) === (coupon_code?.toUpperCase() || null);

      if (isIdentical) {
          await connection.rollback();
          return {
            order_id: existingOrder.id,
            order_number: existingOrder.order_number,
            payable_amount: existingOrder.total_amount,
            status: "Pending",
            message: "Order has already been placed. You can proceed to payment."
          };
      }

      // 5. UPDATE MODE: If something changed, update the existing order
      orderId = existingOrder.id;
      orderNumber = existingOrder.order_number;
      message = "Order updated successfully";

      const statusToSet = payment_method === 'COD' ? 'Confirmed' : 'Pending';

      await connection.query(
        `UPDATE orders SET 
          address_id = ?, subtotal = ?, discount = ?, delivery_charges = ?, 
          total_amount = ?, coupon_code = ?, payment_method = ?, 
          order_status = ?, updated_at = NOW()
         WHERE id = ?`,
        [address_id, subtotal, discount, delivery_charges, total, coupon_code?.toUpperCase() || null, payment_method, statusToSet, orderId]
      );
      order_status = statusToSet;

      // Delete old items to re-insert fresh ones
      await connection.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);

    } else {
      // 6. CREATE MODE: Standard flow
      orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const [orderRes] = await connection.query(
        `INSERT INTO orders (
          order_number, customer_id, address_id, 
          subtotal, discount, delivery_charges, total_amount, 
          coupon_code, payment_method, payment_status, order_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, 
          customerId, 
          address_id, 
          subtotal, 
          discount, 
          delivery_charges, 
          total, 
          coupon_code?.toUpperCase() || null, 
          payment_method, 
          'Pending',
          payment_method === 'COD' ? 'Confirmed' : 'Pending'
        ]
      );
      orderId = orderRes.insertId;
      order_status = payment_method === 'COD' ? 'Confirmed' : 'Pending';
    }

    // 7. Insert/Re-insert Order Items
    for (const item of cartItems) {
      await connection.query(
        `INSERT INTO order_items (
          order_id, product_id, vendor_id, quantity, price
        ) VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.vendor_id, item.quantity, item.offer_price]
      );
    }

    // 8. Stock Management: Reduce stock and increment sold_count
    for (const item of cartItems) {
        // Find the variant for this product and reduce its stock
        const [stockUpdate] = await connection.query(
            `UPDATE product_variants 
             SET stock = GREATEST(0, stock - ?), updated_at = NOW()
             WHERE product_id = ? AND stock >= ?
             LIMIT 1`,
            [item.quantity, item.product_id, item.quantity]
        );

        if (stockUpdate.affectedRows === 0) {
            // If stock was enough during cart check but not now (race condition)
            throw new ApiError(400, `Sorry, one or more items just went out of stock.`);
        }

        // Increment product's global sold_count
        await connection.query(
            `UPDATE products SET sold_count = sold_count + ?, updated_at = NOW() WHERE id = ?`,
            [item.quantity, item.product_id]
        );
    }

    // 9. If Coupon changed/used, update logic (Note: we don't increment used_count here if same order update)
    // For simplicity, we assume usage count is based on 'Placed/Completed' orders.
    // If you want strict usage count on placement:
    if (coupon_code && summary.coupon_applied) {
        // Only increment if the existing order didn't already use this coupon
        if (!existingOrder || existingOrder.coupon_code !== coupon_code.toUpperCase()) {
            await connection.query(
                `UPDATE coupons SET used_count = used_count + 1 WHERE code = ?`,
                [coupon_code.toUpperCase()]
            );
        }
    }

    // 9. Clear cart
    await connection.query(`DELETE FROM customers_cart WHERE customer_id = ?`, [customerId]);

    await connection.commit();

    return {
      order_id: orderId,
      order_number: orderNumber,
      payable_amount: total,
      payment_method,
      status: order_status,
      message: message
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};


/**
 * Get full order history for a customer
 */

export const getOrderHistory = async (customerId, queryParams = {}) => {
  const { page, limit, skip } = getPagination(queryParams);

  const [countRows] = await db.query(
    "SELECT COUNT(*) as total FROM orders WHERE customer_id = ?",
    [customerId]
  );
  const totalRecords = countRows[0].total;

  const query = `
    SELECT 
      o.id, o.order_number, o.total_amount, o.order_status, o.payment_status, o.payment_method, o.created_at,
      (SELECT p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = o.id LIMIT 1) as first_item_name,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as total_items,
      (SELECT pi.image_url FROM product_images pi JOIN order_items oi ON oi.product_id = pi.product_id WHERE oi.order_id = o.id ORDER BY pi.is_primary DESC LIMIT 1) as primary_image
    FROM orders o
    WHERE o.customer_id = ?
    ORDER BY o.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [orders] = await db.query(query, [customerId, limit, skip]);

  // Apply date formatting
  const formattedOrders = orders.map(order => ({
    ...order,
    created_at: formatDate(order.created_at)
  }));

  return {
    orders: formattedOrders,
    pagination: getPaginationMeta(page, limit, totalRecords)
  };
};


/**
 * Get granular details for one specific order
 */

export const getOrderDetails = async (customerId, orderId) => {
  const orderQuery = `
    SELECT 
      o.*, 
      ca.address_name, ca.contact_person_name, ca.contact_phone, 
      ca.address_line_1, ca.address_line_2, ca.city, ca.state, ca.pincode
    FROM orders o
    JOIN customers_addresses ca ON o.address_id = ca.id
    WHERE o.id = ? AND o.customer_id = ?
  `;
  const [orders] = await db.query(orderQuery, [orderId, customerId]);

  if (orders.length === 0) {
    throw new ApiError(404, "Order not found");
  }

  const order = orders[0];

  const itemsQuery = `
    SELECT 
      oi.id as item_id, oi.quantity, oi.price AS offer_price,
      p.id, p.name, p.slug, p.description,
      v.business_name AS vendor_name,
      pv.mrp, pv.discount_percentage,
      (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as product_image,
      IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
      IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    JOIN vendors v ON oi.vendor_id = v.id
    LEFT JOIN (
        SELECT product_id, MAX(mrp) AS mrp, MAX(discount_value) AS discount_percentage 
        FROM product_variants 
        WHERE is_live = 1 
        GROUP BY product_id
    ) pv ON p.id = pv.product_id
    LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
    LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
    WHERE oi.order_id = ?
  `;
  const [items] = await db.query(itemsQuery, [customerId, customerId, orderId]);

  return {
    ...order,
    created_at: formatDate(order.created_at),
    updated_at: formatDate(order.updated_at),
    items: items.map(item => ({
        ...item,
        is_liked: !!item.is_liked,
        is_in_cart: !!item.is_in_cart
    }))
  };
};

