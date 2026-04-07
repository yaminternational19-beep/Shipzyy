import { raw } from "express";
import db from "../../../config/db.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";

export const getHomeData = async (customerId, queryParams = {}) => {
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
    const { page, limit, skip } = getPagination(queryParams);

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

      // Fetch subcategories with product_count
      const [subcategories] = await db.query(
        `
        SELECT
          sc.id,
          sc.name,
          sc.icon AS image,
          sc.category_id,
          COUNT(p.id) AS product_count
        FROM subcategories sc
        LEFT JOIN products p
          ON p.subcategory_id = sc.id
          AND p.approval_status = 'APPROVED'
          AND p.is_live = 1
          AND p.is_active = 1
        WHERE sc.category_id IN (${placeholders})
          AND sc.status = 'Active'
        GROUP BY sc.id, sc.name, sc.icon, sc.category_id
        ORDER BY sc.created_at ASC
      `,
        categoryIds
      );

      // Fetch top 5 products for each category
      const [categoryProducts] = await db.query(
        `
        SELECT * FROM (
          SELECT 
            p.id,
            p.name,
            p.description,
            p.category_id,
            c.name AS category_name,
            p.subcategory_id,
            sc.name AS subcategory_name,
            pi.image_url AS product_image,
            ROW_NUMBER() OVER(PARTITION BY p.category_id ORDER BY p.created_at DESC) as rn
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
          LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
          LEFT JOIN (
            SELECT product_id, 
                   MIN(sale_price) AS min_price, 
                   MAX(mrp) AS max_mrp
            FROM product_variants 
            WHERE is_live = 1 
            GROUP BY product_id
          ) pv ON p.id = pv.product_id
          WHERE p.category_id IN (${placeholders})
          AND p.approval_status = 'APPROVED'
          AND p.is_live = 1
          AND p.is_active = 1
        ) t
        WHERE rn <= 5
      `,
        categoryIds
      );

      // Group subcategories by category_id and sum product_count
      const subMap = {};
      const countMap = {};
      for (const sub of subcategories) {
        if (!subMap[sub.category_id]) {
          subMap[sub.category_id] = [];
          countMap[sub.category_id] = 0;
        }
        subMap[sub.category_id].push({
          id: sub.id,
          name: sub.name,
          image: sub.image,
        });
        countMap[sub.category_id] += Number(sub.product_count);
      }

      // Group products by category_id
      const productMap = {};
      for (const prod of categoryProducts) {
        if (!productMap[prod.category_id]) {
          productMap[prod.category_id] = [];
        }
        delete prod.rn;
        productMap[prod.category_id].push(prod);
      }

      // Attach subcategories and products to each category
      categoriesWithSubcategories = categories.map((cat) => ({
        ...cat,
        product_count: countMap[cat.id] || 0,
        subcategories: subMap[cat.id] || [],
        products: productMap[cat.id] || [],
      }));
    }

    const pagination = getPaginationMeta(page, limit, totalRecords);

    return {
      banners,
      categories: categoriesWithSubcategories,
      recommended_products: [],
      pagination,
    };

  } catch (error) {
    console.error("Home Service Error:", error);
    throw error;
  }
};



export const getSubCategories = async (categoryId, queryParams = {}) => {
  try {
    /* ===============================
       PAGINATION
    =============================== */
    const { page = 1, limit = 20 } = queryParams;
    const skip = (page - 1) * limit;

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

    return {
      records: subcategories,
      pagination
    };

  } catch (error) {
    console.error("Subcategories Service Error:", error);
    throw error;
  }
};


const getProducts = async (customerId, queryParams = {}) => {
  try {
    const { page = 1, limit = 20, category_id, subcategory_id } = queryParams;
    const skip = (page - 1) * limit;

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
        pi.image_url AS product_image,
        pv.min_price AS offer_price,
        pv.max_mrp AS mrp,
        pv.discount_percentage
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
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...values, limit, skip]
    );

    const enhancedProducts = products.map(p => ({
      ...p,
      is_liked: false,
      is_in_cart: false
    }));

    const pagination = getPaginationMeta(page, limit, totalRecords);

    return {
      is_logged_in: customerId ? true : false,
      Products: enhancedProducts,
      pagination
    };
  } catch (error) {
    console.error("Get Products Service Error:", error);
    throw error;
  }
};

const getProductById = async (customerId, productId, queryParams = {}) => {
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
        pi.image_url AS primary_image,
        pv.min_price, pv.max_mrp, pv.total_stock, pv.unit, pv.discount_percentage
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
               MAX(unit) AS unit,
               MAX(discount_value) AS discount_percentage
        FROM product_variants 
        WHERE is_live = 1 
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      WHERE p.id = ? AND p.approval_status = 'APPROVED' AND p.is_live = 1 AND p.is_active = 1
    `, [productId]);

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

    // 3. Similar products (logic: same subcategory if present, else same category)
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
        pi.image_url AS product_image,
        pv.min_price AS offer_price, 
        pv.max_mrp AS mrp, 
        pv.discount_percentage
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
      WHERE ${similarWhere} 
        AND p.id != ? 
        AND p.approval_status = 'APPROVED' 
        AND p.is_live = 1 
        AND p.is_active = 1
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [similarValue, productId, parseInt(limit), skip]);

    const pagination = getPaginationMeta(page, limit, totalSimilar);

    // Build the final response structure
    return {
      is_logged_in: customerId ? true : false,
      product: {
        id: rawProduct.id,
        name: rawProduct.name,
        description: rawProduct.description,
        specification: specificationStr,
        offer_price: rawProduct.min_price,
        mrp: rawProduct.max_mrp,
        discount_percentage: rawProduct.discount_percentage,
        stock_available: stockAvailable,
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
        is_liked: false,
        is_in_cart: false,
        company_name: rawProduct.vendor_name,
        images,
        similar_products: similarProducts.map(sp => ({
          ...sp,
          is_liked: false,
          is_in_cart: false
        })),
        pagination
      }
    };

  } catch (error) {
    console.error("Get Product By ID Service Error:", error);
    throw error;
  }
};

export default { getHomeData, getSubCategories, getProducts, getProductById };
