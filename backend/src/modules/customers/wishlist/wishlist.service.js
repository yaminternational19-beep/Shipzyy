import db from "../../../config/db.js";
import { getFromCache, setToCache, removeFromCache } from "../../../utils/cache.js";

/**
 * Add or Remove product in wishlist based on explicit isLiked flag
 */
const toggleWishlist = async (customerId, productId, isLiked) => {
    let action = "";

    if (isLiked) {
        // 1. If isLiked is true, ensure it is added (Use INSERT IGNORE to avoid duplicates)
        await db.query(
            "INSERT IGNORE INTO customers_wishlist (customer_id, product_id) VALUES (?, ?)",
            [customerId, productId]
        );
        action = "added";
    } else {
        // 2. If isLiked is false, remove it from the wishlist
        await db.query(
            "DELETE FROM customers_wishlist WHERE customer_id = ? AND product_id = ?",
            [customerId, productId]
        );
        action = "removed";
    }

    // 3. Invalidate Redis cache for this customer's wishlist
    await removeFromCache(`customer:wishlist:${customerId}`);

    return { 
        status: "success",
        action,
        message: action === "added" ? "Product added to wishlist" : "Product removed from wishlist"
    };
};

/**
 * Get all products in the customer's wishlist
 */
const getWishlist = async (customerId) => {
    const cacheKey = `customer:wishlist:${customerId}`;

    // 1. Try to fetch from Redis cache
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return cachedData;

    // 2. Query Database if not in cache
    const query = `
        SELECT 
            p.id,
            p.name,
            p.slug,
            p.description,
            p.category_id,
            c.name AS category_name,
            p.subcategory_id,
            sc.name AS subcategory_name,
            p.brand_id,
            COALESCE(b.name, p.custom_brand) AS brand_name,
            p.country_of_origin AS made_in,
            p.return_allowed,
            p.return_days,
            pi.image_url AS product_image,
            pv.min_price AS offer_price,
            pv.max_mrp AS mrp,
            pv.discount_percentage,
            1 AS is_liked,
            IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart
        FROM customers_wishlist cw
        JOIN products p ON cw.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        LEFT JOIN (
            SELECT product_id, 
                   MIN(sale_price) AS min_price, 
                   MAX(mrp) AS max_mrp,
                   MAX(discount_value) AS discount_percentage
            FROM product_variants 
            WHERE is_live = 1 
            GROUP BY product_id
        ) pv ON p.id = pv.product_id
        LEFT JOIN customers_cart cc ON cc.customer_id = cw.customer_id AND cc.product_id = cw.product_id
        WHERE cw.customer_id = ?
        ORDER BY cw.added_at DESC
    `;

    const [rows] = await db.query(query, [customerId]);

    // Format boolean values correctly for the response
    const formattedRows = rows.map(item => ({
        ...item,
        is_liked: !!item.is_liked,
        is_in_cart: !!item.is_in_cart
    }));

    const result = {
        is_logged_in: customerId ? true : false,
        items: formattedRows
    };

    // 3. Store the result in Redis for future requests (TTL: 1 hour)
    await setToCache(cacheKey, result, 3600);

}



/**
 * Remove all products from the customer's wishlist
 */
const clearWishlist = async (customerId) => {
    await db.query(
        "DELETE FROM customers_wishlist WHERE customer_id = ?",
        [customerId]
    );

    // Invalidate Redis cache for this customer's wishlist
    await removeFromCache(`customer:wishlist:${customerId}`);

    return { 
        status: "success",
        message: "All products removed from wishlist"
    };
};

export default {
    toggleWishlist,
    getWishlist,
    clearWishlist
};
