import db from "../../../config/db.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";
import { getFromCache, setToCache } from "../../../utils/cache.js";

/**
 * Optimized Cascading Search for Customer App
 * Hierarchy: Category Match > Subcategory Match > General Search
 * Note: Shortcut triggers only if the category/subcategory contains products.
 */
export const searchAll = async (customerId, queryParams = {}) => {
  const { page, limit, skip } = getPagination(queryParams);
  const search = queryParams.search || "";
  
  const cacheKey = `customer:search:v5:${customerId || "guest"}:${search}:${page}:${limit}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    let whereClause = "";
    let values = [];
    let isGenericSearch = false;

    const baseFilters = "p.approval_status = 'APPROVED' AND p.is_live = 1 AND p.is_active = 1";

    // --- STEP 1: Detect Category Match (Only if it has products) ---
    const [catMatch] = await db.query(
      `SELECT c.id 
       FROM categories c
       INNER JOIN products p ON p.category_id = c.id
       WHERE c.name LIKE ? AND c.status = 'Active' AND ${baseFilters}
       LIMIT 1`,
      [`%${search}%`]
    );

    if (catMatch.length > 0) {
      whereClause = "p.category_id = ?";
      values = [catMatch[0].id];
    } else {
      // --- STEP 2: Detect Subcategory Match (Only if it has products) ---
      const [subMatch] = await db.query(
        `SELECT sc.id 
         FROM subcategories sc
         INNER JOIN products p ON p.subcategory_id = sc.id
         WHERE sc.name LIKE ? AND sc.status = 'Active' AND ${baseFilters}
         LIMIT 1`,
        [`%${search}%`]
      );

      if (subMatch.length > 0) {
        whereClause = "p.subcategory_id = ?";
        values = [subMatch[0].id];
      } else {
        // --- STEP 3: General Keyword Search ---
        const searchVal = `%${search}%`;
        whereClause = `(
          p.name LIKE ? 
          OR sc.name LIKE ? 
          OR c.name LIKE ? 
          OR b.name LIKE ? 
          OR p.custom_brand LIKE ?
          OR p.description LIKE ?
        )`;
        values = [searchVal, searchVal, searchVal, searchVal, searchVal, searchVal];
        isGenericSearch = true;
      }
    }

    const finalWhere = `WHERE ${baseFilters} AND ${whereClause}`;

    // 1. Unified Total Count Query
    const [countResult] = await db.query(
      `SELECT COUNT(DISTINCT p.id) AS total 
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
       LEFT JOIN brands b ON p.brand_id = b.id
       ${finalWhere}`,
      values
    );
    const totalRecords = countResult[0].total;

    // 2. Fetch Products
    const scoreSql = isGenericSearch 
      ? `((CASE WHEN p.name LIKE ? THEN 3 ELSE 0 END) +
          (CASE WHEN sc.name LIKE ? THEN 2 ELSE 0 END) +
          (CASE WHEN c.name LIKE ? THEN 1 ELSE 0 END) +
          (CASE WHEN b.name LIKE ? OR p.custom_brand LIKE ? THEN 2 ELSE 0 END) +
          (CASE WHEN LOWER(p.name) = LOWER(?) THEN 5 ELSE 0 END))`
      : `0`;

    const scoreValues = isGenericSearch ? [values[0], values[1], values[2], values[3], values[4], search] : [];

    const [products] = await db.query(
      `SELECT 
        p.id, p.name, p.slug, p.description, p.category_id, c.name AS category_name,
        p.subcategory_id, sc.name AS subcategory_name, p.brand_id,
        COALESCE(b.name, p.custom_brand) AS brand_name,
        p.country_of_origin AS made_in, p.return_allowed, p.return_days,
        COALESCE(NULLIF(pi.image_url, ''), '') AS product_image,
        pv.min_price AS offer_price, pv.max_mrp AS mrp, pv.discount_percentage,
        IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
        IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart,
        (SELECT COALESCE(AVG(rating), 0) FROM customer_reviews WHERE product_id = p.id) AS avg_rating,
        ${scoreSql} AS relevance_score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN (
        SELECT product_id, MIN(sale_price) AS min_price, MAX(mrp) AS max_mrp,
               MAX(discount_value) AS discount_percentage
        FROM product_variants WHERE is_live = 1 GROUP BY product_id
      ) pv ON p.id = pv.product_id
      LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
      LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
      ${finalWhere}
      ORDER BY relevance_score DESC, p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...scoreValues, customerId, customerId, ...values, limit, skip]
    );

    const enhancedProducts = products.map(p => ({
      ...p,
      is_liked: !!p.is_liked,
      is_in_cart: !!p.is_in_cart,
      avg_rating: parseFloat(p.avg_rating || 0).toFixed(1),
      relevance_score: undefined
    }));

    const pagination = getPaginationMeta(page, limit, totalRecords);

    const result = {
      search_query: search,
      products: enhancedProducts,
      pagination
    };

    await setToCache(cacheKey, result, 300);
    return result;
  } catch (error) {
    console.error("Search Service Error:", error);
    throw error;
  }
};

export default {
  searchAll
};
