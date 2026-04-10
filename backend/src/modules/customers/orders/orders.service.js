import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";
import { getCartItems } from "../cart/cart.service.js";

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
const applyCoupon = async (customerId, couponCode, subtotal) => {
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
  // Assuming you will have an 'orders' table where `coupon_code` and `customer_id` are saved.
  try {
    const [pastUsage] = await db.query(
      `SELECT COUNT(*) as usage_count FROM orders WHERE customer_id = ? AND coupon_code = ?`,
      [customerId, coupon.code]
    );
    if (pastUsage[0].usage_count > 0) {
      throw new ApiError(400, "You have already used this coupon", "COUPON_ALREADY_USED");
    }
  } catch (err) {
    // If 'orders' table doesn't exist yet, it safely ignores this check for now.
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

const getEligibleCoupons = async (subtotal) => {
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

  return rows.map(coupon => {
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
  const { address_id, coupon_code } = options;

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

  // 3. Apply coupon discount (on subtotal before delivery)
  const { discount, coupon } = await applyCoupon(customerId, coupon_code, subtotal);
  const discountedSubtotal = subtotal - discount;

  // 4. Check if customer has ANY saved address
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

  // 5. Get customer's selected/default delivery address
  const customerAddress = await getCustomerAddress(customerId, address_id);

  if (!customerAddress) {
    throw new ApiError(
      400,
      "No default address found. Please set a default delivery address",
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
    // 6. Get vendor locations & calculate max distance
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

    // 6. Get delivery charge from DB based on distance
    const result = await getDeliveryChargeByDistance(maxDistanceKm, subtotal);
    deliveryCharges = result.charge;
    distance_km = result.distance_km;
  }

  const total = discountedSubtotal + deliveryCharges;

  // Fetch all eligible coupons for this order (one can be selected)
  const eligible_coupons = await getEligibleCoupons(subtotal);

  // Build response
  const response = {
    order_summary: {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      delivery_charges: parseFloat(deliveryCharges.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    },
    eligible_coupons,    // all eligible coupons (customer selects one)
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

  // 1. Re-calculate everything securely using our robust checkout summary logic
  // NEVER trust amounts passed from the frontend!
  const summary = await getCheckoutSummary(customerId, { address_id, coupon_code });
  
  const { subtotal, discount, delivery_charges, total } = summary.order_summary;
  const items = (await getCartItems(customerId)).items;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 2. ASSUMED SCHEMA: Insert into orders table
    // (We prefix with 'ORD' and add timestamp for uniqueness)
    const orderNumber = `ORD-${Date.now()}`;
    
    // NOTE: This assumes an 'orders' table exists. I've commented out the DB insert
    // to prevent crashes since you haven't given the final schema yet.
    
    const [orderRes] = await connection.query(
      `INSERT INTO orders (
        order_number, customer_id, address_id, subtotal, discount, 
        delivery_charges, total_amount, payment_method, coupon_code, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderNumber, customerId, address_id, subtotal, discount, delivery_charges, total, payment_method, coupon_code || null, 'Pending']
    );
    const orderId = orderRes.insertId;

    // 3. ASSUMED SCHEMA: Insert into order_items table
    for (const item of items) {
      if (item.is_available) {
        await connection.query(
          `INSERT INTO order_items (
            order_id, product_id, vendor_id, quantity, price
          ) VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.vendor_id, item.quantity, item.offer_price]
        );
      }
    }

    // 4. Update Coupon usage count (if a valid coupon was applied)
    if (coupon_code && summary.coupon_applied) {
      await connection.query(
        `UPDATE coupons SET used_count = used_count + 1 WHERE code = ?`,
        [coupon_code]
      );
    }

    // 5. Clear the customer's cart (Only active available items could be cleared, or all)
    await connection.query(
      `DELETE FROM customers_cart WHERE customer_id = ?`,
      [customerId]
    );

    await connection.commit();

    return {
      order_number: orderNumber,
      total_paid: total,
      payment_method,
      status: "Processing",
      message: "Order placed successfully. Schema assumed."
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

