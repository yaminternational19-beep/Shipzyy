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

    const pagination = getPaginationMeta(page, limit, totalRecords);

    return {
      banners,
      categories,
      recommended_products: [], // Placeholder for future recommended products logic
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


const getProducts = async (queryParams = {}) => {
  try {
    const { page = 1, limit = 20, category_id, subcategory_id } = queryParams;
    const skip = (page - 1) * limit;

    let where = ["approval_status = 'APPROVED'", "is_live = 1", "is_active = 1"];
    let values = [];

    if (category_id) {
      where.push("category_id = ?");
      values.push(category_id);
    }

    if (subcategory_id) {
      where.push("subcategory_id = ?");
      values.push(subcategory_id);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // Total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) AS total FROM products ${whereClause}`,
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
        p.custom_brand,
        p.country_of_origin,
        p.return_allowed,
        p.return_days,
        p.view_count,
        p.sold_count,
        p.created_at,
        pi.image_url AS primary_image,
        pv.min_price,
        pv.max_mrp
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
      LEFT JOIN (
        SELECT product_id, 
               MIN(sale_price) AS min_price, 
               MAX(mrp) AS max_mrp,
               SUM(stock) AS total_stock
        FROM product_variants 
        WHERE is_live = 1 
        GROUP BY product_id
      ) pv ON p.id = pv.product_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?`,
      [...values, limit, skip]
    );

    const pagination = getPaginationMeta(page, limit, totalRecords);

    return {
      records: products,
      pagination
    };
  } catch (error) {
    console.error("Get Products Service Error:", error);
    throw error;
  }
};

export default { getHomeData, getSubCategories, getProducts };
