import db from "../../../config/db.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";
import { getFromCache, setToCache } from "../../../utils/cache.js";

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export const getHomeData = async (customerId, queryParams = {}) => {
  const { page, limit, skip } = getPagination(queryParams);
  const cacheKey = `customer:home:v2:${customerId || 'guest'}:${page}:${limit}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    const [banners] = await db.query(`
      SELECT 
        id,
        banner_name,
        banner_image,
        description
      FROM banners
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const [countResult] = await db.query(`
      SELECT COUNT(*) AS total
      FROM categories
      WHERE status = 'Active'
    `);

    const totalRecords = countResult[0].total;

    const [categories] = await db.query(`
      SELECT 
        id,
        name,
        icon,
        banner_name,
        banner_image
      FROM categories
      WHERE status = 'Active'
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `, [limit, skip]);

    // Fetch subcategories and products for all fetched categories in one query
    let categoriesWithSubcategories = categories;
    if (categories.length > 0) {
      const categoryIds = categories.map((c) => c.id);
      const placeholders = categoryIds.map(() => "?").join(", ");

      // Fetch category-level totals (subcategory count and total product count)
      const [categoryTotals] = await db.query(`
        SELECT 
          c.id AS category_id,
          (SELECT COUNT(*) FROM subcategories sc WHERE sc.category_id = c.id AND sc.status = 'Active') AS subcategory_count,
          (SELECT COUNT(*) FROM products p 
           WHERE p.category_id = c.id 
           AND p.approval_status = 'APPROVED' 
           AND p.is_live = 1 
           AND p.is_active = 1) AS total_product_count
        FROM categories c
        WHERE c.id IN (${placeholders})
      `, categoryIds);

      const categoryTotalMap = {};
      for (const row of categoryTotals) {
        categoryTotalMap[row.category_id] = {
          subcategory_count: row.subcategory_count,
          product_count: row.total_product_count
        };
      }

      // Fetch subcategories with their own product_count
      const [subcategories] = await db.query(
        `
        SELECT
          sc.id,
          sc.name,
          sc.icon AS image,
          sc.category_id,
          (SELECT COUNT(*) FROM products p 
           WHERE p.subcategory_id = sc.id 
           AND p.approval_status = 'APPROVED' 
           AND p.is_live = 1 
           AND p.is_active = 1) AS product_count
        FROM subcategories sc
        WHERE sc.category_id IN (${placeholders})
          AND sc.status = 'Active'
        ORDER BY sc.created_at ASC
      `,
        categoryIds
      );

      // Fetch top 5 products per Subcategory (nested list)
      const [subcategoryProducts] = await db.query(
        `
        SELECT * FROM (
          SELECT 
            p.id, p.name, p.description, p.category_id, c.name AS category_name,
            p.subcategory_id, sc.name AS subcategory_name,
            COALESCE(NULLIF(pi.image_url, ''), 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png') AS product_image, pv.min_price AS offer_price,
            pv.max_mrp AS mrp, pv.discount_percentage,
            IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
            IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart,
            (SELECT COALESCE(AVG(rating), 0) FROM customer_reviews WHERE product_id = p.id) AS avg_rating,
            ROW_NUMBER() OVER(PARTITION BY p.subcategory_id ORDER BY p.created_at DESC) as rn
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
          LEFT JOIN (
            SELECT product_id, MIN(sale_price) AS min_price, MAX(mrp) AS max_mrp,
                   MAX(discount_value) AS discount_percentage
            FROM product_variants WHERE is_live = 1 GROUP BY product_id
          ) pv ON p.id = pv.product_id
          LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
          LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
          WHERE p.category_id IN (${placeholders})
          AND p.subcategory_id IS NOT NULL
          AND p.approval_status = 'APPROVED' AND p.is_live = 1 AND p.is_active = 1
        ) t WHERE rn <= 5
      `,
        [customerId, customerId, ...categoryIds]
      );

      const subProductMap = {};
      for (const prod of subcategoryProducts) {
        if (!subProductMap[prod.subcategory_id]) subProductMap[prod.subcategory_id] = [];
        subProductMap[prod.subcategory_id].push({
          ...prod,
          is_liked: !!prod.is_liked,
          is_in_cart: !!prod.is_in_cart
        });
      }

      // Group subcategories by category_id
      const subMap = {};
      for (const sub of subcategories) {
        if (!subMap[sub.category_id]) subMap[sub.category_id] = [];
        subMap[sub.category_id].push({
          id: sub.id,
          name: sub.name,
          image: sub.image,
          product_count: Number(sub.product_count),
          products: subProductMap[sub.id] || []
        });
      }

      // Final Assembly (No flat products list at category level)
      categoriesWithSubcategories = categories.map((cat) => ({
        ...cat,
        subcategory_count: categoryTotalMap[cat.id]?.subcategory_count || 0,
        product_count: categoryTotalMap[cat.id]?.product_count || 0,
        // Filter out subcategories with 0 products ("ig no sub ignore that")
        subcategories: (subMap[cat.id] || []).filter(sub => sub.product_count > 0)
      }));
    }


    // Count total diverse products for best_sellers (Top 3 per subcategory)
    const [bestSellersCountResult] = await db.query(`
      SELECT COUNT(*) AS total FROM (
        SELECT id, ROW_NUMBER() OVER(PARTITION BY subcategory_id ORDER BY created_at DESC) as rn
        FROM products 
        WHERE approval_status = 'APPROVED' AND is_live = 1 AND is_active = 1
        AND subcategory_id IS NOT NULL
      ) t WHERE rn <= 3
    `);
    const totalBestSellers = bestSellersCountResult[0].total;

    // Fetch "Best Sellers" (Latest 3 products from each subcategory, with pagination)
    const [bestSellers] = await db.query(
      `
      SELECT * FROM (
        SELECT 
          p.id, p.name, p.description, p.category_id, c.name AS category_name,
          p.subcategory_id, sc.name AS subcategory_name,
          COALESCE(NULLIF(pi.image_url, ''), 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png') AS product_image, pv.min_price AS offer_price,
          pv.max_mrp AS mrp, pv.discount_percentage,
          IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
          IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart,
          (SELECT COALESCE(AVG(rating), 0) FROM customer_reviews WHERE product_id = p.id) AS avg_rating,
          ROW_NUMBER() OVER(PARTITION BY p.subcategory_id ORDER BY p.created_at DESC) as rn
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        LEFT JOIN (
          SELECT product_id, MIN(sale_price) AS min_price, MAX(mrp) AS max_mrp,
                 MAX(discount_value) AS discount_percentage
          FROM product_variants WHERE is_live = 1 GROUP BY product_id
        ) pv ON p.id = pv.product_id
        LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
        LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
        WHERE p.approval_status = 'APPROVED' AND p.is_live = 1 AND p.is_active = 1
        AND p.subcategory_id IS NOT NULL
      ) t 
      WHERE rn <= 3
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `,
      [customerId, customerId, limit, skip]
    );

    const result = {
      is_logged_in: customerId ? true : false,
      banners,
      categories: categoriesWithSubcategories,
      best_sellers: {
        records: bestSellers.map(p => ({ ...p, is_liked: !!p.is_liked, is_in_cart: !!p.is_in_cart, rn: undefined })),
        pagination: getPaginationMeta(page, limit, totalBestSellers)
      }
    };

    // Cache for 10 minutes (static content)
    await setToCache(cacheKey, result, 600);

    return result;
  } catch (error) {
    console.error("Home Service Error:", error);
    throw error;
  }
};



export const getSubCategories = async (categoryId, queryParams = {}) => {
  const { page = 1, limit = 20 } = queryParams;
  const skip = (page - 1) * limit;
  const cacheKey = `customer:subcategories:${categoryId}:${page}:${limit}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    /* ===============================
       TOTAL COUNT
    =============================== */
    const [countResult] = await db.query(`
      SELECT COUNT(*) AS total
      FROM subcategories
      WHERE category_id = ?
      AND status = 'Active'
    `, [categoryId]);

    const totalRecords = countResult[0].total;

    /* ===============================
       FETCH SUBCATEGORIES
    =============================== */
    const [subcategories] = await db.query(`
      SELECT 
        id,
        name,
        icon,
        description
      FROM subcategories
      WHERE category_id = ?
      AND status = 'Active'
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `, [categoryId, limit, skip]);

    /* ===============================
       PAGINATION META
    =============================== */
    const pagination = getPaginationMeta(page, limit, totalRecords);

    const result = {
      records: subcategories,
      pagination
    };

    await setToCache(cacheKey, result, 1800); // 30 mins
    return result;

  } catch (error) {
    console.error("Subcategories Service Error:", error);
    throw error;
  }
};


const getProducts = async (customerId, queryParams = {}) => {
  const { page = 1, limit = 20, category_id, subcategory_id } = queryParams;
  const skip = (page - 1) * limit;
  const cacheKey = `customer:products:v2:${customerId || 'guest'}:${category_id || 0}:${subcategory_id || 0}:${page}:${limit}`;

  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    let where = ["p.approval_status = 'APPROVED'", "p.is_live = 1", "p.is_active = 1"];
    let values = [];

    if (category_id) {
      where.push("p.category_id = ?");
      values.push(category_id);
    }

    if (subcategory_id) {
      where.push("p.subcategory_id = ?");
      values.push(subcategory_id);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
      values
    );
    const totalRecords = countResult[0].total;

    // Fetch products with category, subcategory, primary image, and pricing
    const [products] = await db.query(
      `SELECT 
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
        COALESCE(NULLIF(pi.image_url, ''), 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png') AS product_image,
        pv.min_price AS offer_price,
        pv.max_mrp AS mrp,
        pv.discount_percentage,
        IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
        IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart,
        (SELECT COALESCE(AVG(rating), 0) FROM customer_reviews WHERE product_id = p.id) AS avg_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN (
        SELECT product_id, 
               MIN(sale_price) AS min_price, 
               MAX(mrp) AS max_mrp,
               SUM(stock) AS total_stock,
               MAX(discount_value) AS discount_percentage
        FROM product_variants 
        WHERE is_live = 1 
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
      LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [customerId, customerId, ...values, limit, skip]
    );

    const enhancedProducts = products.map(p => ({
      ...p,
      is_liked: !!p.is_liked,
      is_in_cart: !!p.is_in_cart
    }));

    const pagination = getPaginationMeta(page, limit, totalRecords);

    const result = {
      is_logged_in: customerId ? true : false,
      Products: enhancedProducts,
      pagination
    };

    await setToCache(cacheKey, result, 300); // 5 mins
    return result;

  } catch (error) {
    console.error("Get Products Service Error:", error);
    throw error;
  }
};

const getProductById = async (customerId, productId, queryParams = {}) => {
  const cacheKey = `customer:product:v4:${customerId || 'guest'}:${productId}`;
  const cachedData = await getFromCache(cacheKey);
  if (cachedData) return cachedData;

  try {
    // 1. Fetch base product details with vendor info
    const [productResult] = await db.query(`
      SELECT 
        p.id, p.name, p.slug, p.description, p.specification,
        p.category_id, c.name AS category_name,
        p.subcategory_id, sc.name AS subcategory_name,
        p.brand_id, p.custom_brand,
        p.country_of_origin AS made_in,
        p.manufacture_date, p.expiry_date,
        p.return_allowed, p.return_days,
        p.vendor_id, v.business_name AS vendor_name,
        p.brand_id, p.custom_brand, COALESCE(b.name, p.custom_brand) AS brand_name,
        COALESCE(NULLIF(pi.image_url, ''), 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png') AS primary_image,
        pv.min_price, pv.max_mrp, pv.total_stock, pv.variant_name, pv.unit, pv.discount_percentage,
        IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
        IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart,
        (SELECT COALESCE(AVG(rating), 0) FROM customer_reviews WHERE product_id = p.id) AS avg_rating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN (
        SELECT product_id, 
               MIN(sale_price) AS min_price, 
               MAX(mrp) AS max_mrp,
               SUM(stock) AS total_stock,
               MAX(variant_name) AS variant_name,
               MAX(unit) AS unit,
               MAX(discount_value) AS discount_percentage
        FROM product_variants 
        WHERE is_live = 1 
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
      LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
      WHERE p.id = ? AND p.approval_status = 'APPROVED' AND p.is_live = 1 AND p.is_active = 1
    `, [customerId, customerId, productId]);

    if (productResult.length === 0) {
      return null;
    }

    const rawProduct = productResult[0];
    const stockAvailable = rawProduct.total_stock || 0;

    // Convert specification array into a clean string
    let specificationStr = "";
    try {
      const specObj = typeof rawProduct.specification === 'string'
        ? JSON.parse(rawProduct.specification)
        : (rawProduct.specification || {});

      if (specObj.details && Array.isArray(specObj.details)) {
        // Join the array and clean up redundant "details:" text
        specificationStr = specObj.details
          .map(item => item.replace(/details:\s*/gi, ""))
          .join(", ")
          .trim();
      } else {
        specificationStr = typeof rawProduct.specification === 'string' ? rawProduct.specification : "";
      }
    } catch (e) {
      specificationStr = "";
    }

    // 2. Fetch all images (id and URL only)
    const [images] = await db.query(`
      SELECT id, image_url
      FROM product_images 
      WHERE product_id = ?
      ORDER BY is_primary DESC, created_at ASC
    `, [productId]);

    // 3. Fetch product reviews
    const [reviews] = await db.query(`
      SELECT 
        r.id, r.rating, r.review, r.images, r.created_at,
        COALESCE(NULLIF(c.name, ''), 'Shipzyy User') as customer_name
      FROM customer_reviews r
      JOIN customers c ON r.customer_id = c.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
      LIMIT 20
    `, [productId]);

    const formattedReviews = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      review: r.review,
      review_given_by: r.customer_name || "Customer",
      created_at: formatDate(r.created_at),
      images: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images) : r.images) : []
    }));

    // 4. Similar products (logic: same subcategory if present, else same category)
    let similarWhere = "p.subcategory_id = ?";
    let similarValue = rawProduct.subcategory_id;

    if (!similarValue) {
      similarWhere = "p.category_id = ?";
      similarValue = rawProduct.category_id;
    }

    const { page = 1, limit = 10 } = queryParams;
    const skip = (page - 1) * limit;

    // Get count for similarity pagination
    const [similarityCount] = await db.query(`
      SELECT COUNT(*) AS total 
      FROM products p 
      WHERE ${similarWhere} AND p.id != ? AND p.approval_status = 'APPROVED' AND p.is_live = 1 AND p.is_active = 1
    `, [similarValue, productId]);
    const totalSimilar = similarityCount[0].total;

    const [similarProducts] = await db.query(`
      SELECT 
        p.id, p.name, p.description,
        p.category_id, c.name AS category_name,
        p.subcategory_id, sc.name AS subcategory_name,
        p.brand_id, COALESCE(b.name, p.custom_brand) AS brand_name,
        COALESCE(NULLIF(pi.image_url, ''), 'https://shipzzy-files-094794931012-ap-south-1-an.s3.ap-south-1.amazonaws.com/placeholders/no-image.png') AS product_image,
        pv.min_price AS offer_price, 
        pv.max_mrp AS mrp, 
        pv.discount_percentage,
        IF(cw.id IS NOT NULL, 1, 0) AS is_liked,
        IF(cc.id IS NOT NULL, 1, 0) AS is_in_cart,
        (SELECT COALESCE(AVG(rating), 0) FROM customer_reviews WHERE product_id = p.id) AS avg_rating
      FROM products p
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
      LEFT JOIN customers_wishlist cw ON cw.customer_id = ? AND cw.product_id = p.id
      LEFT JOIN customers_cart cc ON cc.customer_id = ? AND cc.product_id = p.id
      WHERE ${similarWhere} 
        AND p.id != ? 
        AND p.approval_status = 'APPROVED' 
        AND p.is_live = 1 
        AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [customerId, customerId, similarValue, productId, parseInt(limit), skip]);

    const pagination = getPaginationMeta(page, limit, totalSimilar);

    // Build the final response structure
    const result = {
      is_logged_in: customerId ? true : false,
      product: {
        id: rawProduct.id,
        name: rawProduct.name,
        description: rawProduct.description,
        specification: specificationStr,
        offer_price: rawProduct.min_price,
        mrp: rawProduct.max_mrp,
        discount_percentage: rawProduct.discount_percentage,
        avg_rating: rawProduct.avg_rating,
        stock_available: stockAvailable,
        variant_name: rawProduct.variant_name || null,
        unit: rawProduct.unit || "N/A",
        category_id: rawProduct.category_id,
        category_name: rawProduct.category_name,
        subcategory_id: rawProduct.subcategory_id,
        subcategory_name: rawProduct.subcategory_name,
        brand_id: rawProduct.brand_id,
        brand_name: rawProduct.brand_name,
        made_in: rawProduct.made_in,
        return_allowed: rawProduct.return_allowed,
        return_days: rawProduct.return_days,
        is_liked: !!rawProduct.is_liked,
        is_in_cart: !!rawProduct.is_in_cart,
        company_name: rawProduct.vendor_name,
        images,
        reviews: formattedReviews,
        similar_products: similarProducts.map(sp => ({
          ...sp,
          is_liked: !!sp.is_liked,
          is_in_cart: !!sp.is_in_cart
        })),
        pagination
      }
    };

    await setToCache(cacheKey, result, 600); // 10 mins
    return result;

  } catch (error) {
    console.error("Get Product By ID Service Error:", error);
    throw error;
  }
};

export default { getHomeData, getSubCategories, getProducts, getProductById };
