import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";
import { getFromCache, setToCache, removeFromCache } from "../../../utils/cache.js";

export const getCartItems = async (customerId) => {
  const cacheKey = `customer:cart:${customerId}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  const query = `
    SELECT 
      cc.id AS cart_id,
      cc.product_id,
      cc.quantity,
      cc.offer_price AS snapshot_price,
      cc.mrp AS snapshot_mrp,
      cc.price_changed,
      cc.is_available,
      p.name AS product_name,
      p.slug AS product_slug,
      p.description AS product_description,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
      pv.sale_price AS live_price,
      pv.mrp AS live_mrp,
      pv.stock AS live_stock,
      IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
      1 AS is_in_cart
    FROM customers_cart cc
    JOIN products p ON cc.product_id = p.id
    LEFT JOIN product_variants pv ON pv.id = (
      SELECT id FROM product_variants WHERE product_id = p.id LIMIT 1
    )
    LEFT JOIN customers_wishlist cw ON cw.customer_id = cc.customer_id AND cw.product_id = cc.product_id
    WHERE cc.customer_id = ?
  `;

  const [rows] = await db.execute(query, [customerId]);

  // Sync snapshot prices with live prices if they differ
  for (const item of rows) {
    const needsPriceUpdate = item.live_price !== null && 
      (parseFloat(item.snapshot_price) !== parseFloat(item.live_price) || 
       parseFloat(item.snapshot_mrp) !== parseFloat(item.live_mrp));
    
    const isActuallyAvailable = item.live_stock > 0;
    const needsAvailabilityUpdate = (item.is_available === 1) !== isActuallyAvailable;

    if (needsPriceUpdate || needsAvailabilityUpdate) {
      await db.execute(
        `UPDATE customers_cart 
         SET offer_price = ?, mrp = ?, price_changed = ?, is_available = ?
         WHERE id = ?`,
        [
          item.live_price ?? item.snapshot_price,
          item.live_mrp ?? item.snapshot_mrp,
          needsPriceUpdate ? 1 : item.price_changed,
          isActuallyAvailable ? 1 : 0,
          item.cart_id
        ]
      );
      
      // Update local object for the final response
      item.offer_price = item.live_price ?? item.snapshot_price;
      item.mrp = item.live_mrp ?? item.snapshot_mrp;
      item.is_available = isActuallyAvailable ? 1 : 0;
      item.price_changed = needsPriceUpdate ? 1 : item.price_changed;
    } else {
      item.offer_price = item.snapshot_price;
      item.mrp = item.snapshot_mrp;
    }

    item.current_price = item.live_price;
    item.available_stock = item.live_stock;

    // Remove temporary keys used for comparison
    delete item.snapshot_price;
    delete item.snapshot_mrp;
    delete item.live_price;
    delete item.live_mrp;
    delete item.live_stock;

    // Format boolean flags
    item.is_liked = !!item.is_liked;
    item.is_in_cart = !!item.is_in_cart;
  }

  const result = {
    is_logged_in: customerId ? true : false,
    items: rows
  };

  await setToCache(cacheKey, result, 3600); // 1 hour
  return result;
};


export const addToCart = async (customerId, { product_id, quantity }) => {
  const cacheKey = `customer:cart:${customerId}`;
  // 1. Check if product exists and get its current price & vendor_id
  const productQuery = `
    SELECT p.id, p.vendor_id, pv.mrp, pv.sale_price, pv.stock
    FROM products p
    JOIN product_variants pv ON p.id = pv.product_id
    WHERE p.id = ?
    LIMIT 1
  `;
  const [products] = await db.execute(productQuery, [product_id]);

  if (products.length === 0) {
    throw new ApiError(404, "Product not found or not available");
  }

  const product = products[0];

  if (product.stock < quantity) {
    throw new ApiError(400, "Insufficient stock available");
  }

  // 2. Check if item already exists in cart
  const existingQuery = `SELECT id, quantity FROM customers_cart WHERE customer_id = ? AND product_id = ?`;
  const [existingItems] = await db.execute(existingQuery, [customerId, product_id]);

  if (existingItems.length > 0) {
    // Update existing cart item quantity
    const newQuantity = existingItems[0].quantity + quantity;
    
    // Optional: cap with stock
    if (product.stock < newQuantity) {
        throw new ApiError(400, `Cannot add more. Only ${product.stock} items in stock.`);
    }

    await db.execute(
      `UPDATE customers_cart SET quantity = ?, offer_price = ?, mrp = ? WHERE id = ?`,
      [newQuantity, product.sale_price, product.mrp, existingItems[0].id]
    );
    
    await removeFromCache(cacheKey);
    return { cart_id: existingItems[0].id, quantity: newQuantity, status: 'updated' };
  } else {
    // Insert new cart item
    const [result] = await db.execute(
      `INSERT INTO customers_cart (customer_id, vendor_id, product_id, quantity, offer_price, mrp) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customerId, product.vendor_id, product_id, quantity, product.sale_price, product.mrp]
    );

    await removeFromCache(cacheKey);
    return { cart_id: result.insertId, quantity, status: 'added' };
  }
};


export const removeFromCart = async (customerId, { cart_ids, clear_all }) => {
  const cacheKey = `customer:cart:${customerId}`;
  if (clear_all === true || clear_all === "true") {
    await db.execute(`DELETE FROM customers_cart WHERE customer_id = ?`, [customerId]);
    await removeFromCache(cacheKey);
    return { message: "All items removed from cart" };
  }

  if (!cart_ids || !Array.isArray(cart_ids) || cart_ids.length === 0) {
    throw new ApiError(400, "Please provide cart item IDs to remove");
  }

  // Delete specific IDs
  const placeholders = cart_ids.map(() => "?").join(",");
  const [result] = await db.execute(
    `DELETE FROM customers_cart WHERE customer_id = ? AND id IN (${placeholders})`,
    [customerId, ...cart_ids]
  );

  await removeFromCache(cacheKey);
  return { 
    message: `${result.affectedRows} item(s) removed from cart`,
    removedCount: result.affectedRows 
  };
};
