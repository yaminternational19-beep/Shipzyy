import db from "../../config/db.js";
import s3Service from "../../services/s3Service.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { getFromCache, setToCache, removeFromCache, removeByPattern } from "../../utils/cache.js";


const getProducts = async (queryParams) => {
    const cacheKey = `admin:products:list:v2:${JSON.stringify(queryParams)}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const { page, limit, skip } = getPagination(queryParams);

    let where = [];
    let values = [];

    const sanitizeId = (val) => {
        if (!val || val === 'null' || val === 'undefined' || val === '') return null;
        return isNaN(Number(val)) ? null : Number(val);
    };

    const vendorId = sanitizeId(queryParams.vendor_id || queryParams.vendorId || queryParams.vendor);
    if (vendorId) {
        where.push("p.vendor_id = ?");
        values.push(vendorId);
    }

    const categoryId = sanitizeId(queryParams.category_id || queryParams.categoryId || queryParams.category);
    if (categoryId) {
        where.push("p.category_id = ?");
        values.push(categoryId);
    }

    const subCategoryId = sanitizeId(queryParams.subcategory_id || queryParams.subCategoryId || queryParams.subCategory);
    if (subCategoryId) {
        where.push("p.subcategory_id = ?");
        values.push(subCategoryId);
    }

    const brandId = sanitizeId(queryParams.brand_id || queryParams.brandId || queryParams.brand);
    if (brandId) {
        where.push("p.brand_id = ?");
        values.push(brandId);
    }

    const status = queryParams.status || queryParams.approval_status || queryParams.isApproved;
    if (status && status !== 'null' && status !== 'undefined' && status !== '') {
        where.push("p.approval_status = ?");
        values.push(status);
    }

    if (queryParams.search) {
        where.push("(p.name LIKE ? OR v.business_name LIKE ?)");
        values.push(`%${queryParams.search}%`, `%${queryParams.search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM products p LEFT JOIN vendors v ON p.vendor_id = v.id ${whereClause}`,
        values
    );

    const totalRecords = countResult[0].total;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const [rows] = await db.query(
`SELECT 
    p.id,
    p.name,
    p.slug,
    p.custom_brand,
    p.created_at,
    p.approved_at,
    p.approval_status,
    p.rejection_reason,
    p.rejected_at,

    c.name AS categoryName,
    sc.name AS subCategoryName,
    b.name AS brandName,
    

    v.business_name AS BusinessName,
    COALESCE(NULLIF(v.owner_name, ''), 'Shipzyy User') AS vendorName,
    COALESCE(NULLIF(v.email, ''), 'noemail') AS vendorEmail,
    v.country_code AS vendorCountryCode,
    COALESCE(NULLIF(v.mobile, ''), 'No Phone') AS vendorMobile,
    pv.mrp,
    pv.sale_price,
    pv.stock,
    pi.image_url AS primaryImage

FROM products p

LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN vendors v ON p.vendor_id = v.id

LEFT JOIN (
    SELECT product_id,
           MAX(mrp) as mrp,
           MAX(sale_price) as sale_price,
           SUM(stock) as stock
    FROM product_variants
    GROUP BY product_id
) pv ON pv.product_id = p.id

LEFT JOIN product_images pi 
    ON pi.product_id = p.id AND pi.is_primary = 1

${whereClause}
ORDER BY p.created_at DESC
LIMIT ? OFFSET ?`,
[...values, limit, skip]
);

    const records = rows.map(product => ({
    ...product,
    created_at: formatDate(product.created_at),
    approved_at: product.approved_at ? formatDate(product.approved_at) : "-",
    rejected_at: product.rejected_at ? formatDate(product.rejected_at) : "-"    
}));

    const pagination = getPaginationMeta(page, limit, totalRecords);

    const [stats] = await db.query(
        `SELECT
            COUNT(*) as totalCount,
            SUM(CASE WHEN approval_status = 'PENDING' THEN 1 ELSE 0 END) as pendingCount,
            SUM(CASE WHEN approval_status = 'APPROVED' THEN 1 ELSE 0 END) as approvedCount,
            SUM(CASE WHEN approval_status = 'REJECTED' THEN 1 ELSE 0 END) as rejectedCount
        FROM products p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        ${whereClause}`,
        values
    );

    const statsData = {
        totalCount: stats[0].totalCount,
        pendingCount: stats[0].pendingCount,
        approvedCount: stats[0].approvedCount,
        rejectedCount: stats[0].rejectedCount
    }

    const result = { 
        stats: statsData,
        records,
        pagination,
    };

    await setToCache(cacheKey, result, 300); // 5 mins
    return result;
};


const getProductById = async (productId) => {
    const cacheKey = `admin:product:profile:${productId}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const [rows] = await db.query(`
        SELECT 
            p.id, p.vendor_id, p.category_id, p.subcategory_id, p.brand_id, p.custom_brand, 
            p.name, p.slug, p.description, p.specification, p.country_of_origin,
            DATE_FORMAT(p.manufacture_date, '%Y-%m-%d') as manufacture_date,
            DATE_FORMAT(p.expiry_date, '%Y-%m-%d') as expiry_date,
            p.return_allowed, p.return_days, p.approval_status, p.rejection_reason, p.approved_by, p.approved_at,
            p.is_live, p.is_active, p.view_count, p.sold_count,
            p.created_at, p.updated_at,

            COALESCE(NULLIF(v.business_name, ''), 'Shipzyy User') as vendor_name,
            COALESCE(NULLIF(v.owner_name, ''), 'Shipzyy User') as vendor_owner_name,
            COALESCE(NULLIF(v.email, ''), 'noemail') as vendor_email,
            v.country_code as vendor_country_code,
            COALESCE(NULLIF(v.mobile, ''), 'No Phone') as vendor_mobile,
            c.name as category_name,
            sc.name as subcategory_name,
            COALESCE(b.name, p.custom_brand) as brand_name

        FROM products p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
        LEFT JOIN brands b ON p.brand_id = b.id
        WHERE p.id = ?
    `, [productId]);

    if (rows.length === 0) {
        throw new Error("Product not found");
    }

    const product = rows[0];

    // All images
    const [images] = await db.query(`
        SELECT id, image_url, is_primary
        FROM product_images
        WHERE product_id = ?
        ORDER BY sort_order ASC
    `, [productId]);

    // Variant summary
    const [variantSummary] = await db.query(`
        SELECT 
            SUM(stock) as total_stock, 
            MIN(sale_price) as min_price, 
            MIN(mrp) as min_mrp,
            MAX(discount_value) as max_discount,
            MAX(discount_type) as discount_type,
            MAX(low_stock_alert) as low_stock_alert
        FROM product_variants 
        WHERE product_id = ?
    `, [productId]);

    // All variants
    const [variants] = await db.query(`
        SELECT id, sku, variant_name, mrp, sale_price, stock, unit, color
        FROM product_variants
        WHERE product_id = ?
    `, [productId]);

    const result = {
        ...product,
        created_at: formatDate(product.created_at),
        approved_at: formatDate(product.approved_at),
        updated_at: formatDate(product.updated_at),
        images,
        primary_image: images.length ? images[0].image_url : null,
        inventory_summary: variantSummary[0],
        variants
    };

    await setToCache(cacheKey, result, 3600); // 1 hour
    return result;
};


const updateProductStatus = async (productId, status, reason, adminId) => {
    if (status === 'REJECTED' && !reason) {
        throw new Error("Rejection reason is required when status is REJECTED");
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existing] = await connection.query(
            `SELECT id FROM products WHERE id = ?`,
            [productId]
        );

        if (existing.length === 0) {
            throw new Error("Product not found");
        }

        const now = new Date();
        const isApproved = status === 'APPROVED';
        const isRejected = status === 'REJECTED';

        const updateQuery = `
            UPDATE products 
            SET 
                approval_status = ?,
                rejection_reason = ?,
                approved_by = ?,
                approved_at = ?,
                rejected_by = ?,
                rejected_at = ?,
                is_live = ?,
                is_active = ?
            WHERE id = ?
        `;

        const updateValues = [
            status,
            isRejected ? reason : null,
            isApproved ? adminId : null,
            isApproved ? now : null,
            isRejected ? adminId : null,
            isRejected ? now : null,
            isApproved ? 1 : 0,
            isApproved ? 1 : 0,
            productId
        ];

        await connection.query(updateQuery, updateValues);

        await connection.commit();

        // Invalidate caches
        await removeFromCache(`admin:product:profile:${productId}`);
        await removeFromCache(`customer:product:${productId}`);
        await removeByPattern("admin:products:list:*");
        await removeByPattern("customer:home:*");
        await removeByPattern("customer:products:*");

        return { 
            id: productId, 
            status: status 
        };

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export default {
    getProducts,
    getProductById,
    updateProductStatus
}
