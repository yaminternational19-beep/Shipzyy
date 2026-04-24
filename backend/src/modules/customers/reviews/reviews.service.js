import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";
import { uploadFile } from "../../../services/s3Service.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";
import formatCustomerDates from "../../../utils/formatCustomerDates.js";

/**
 * Submit a product review
 */

const createReview = async (customerId, reviewData, files = []) => {
    const { order_id, product_id, item_id, rating, review } = reviewData;

    // 1. Verify item belongs to customer, the correct order/product, and is Delivered
    const [items] = await db.query(
        `SELECT oi.*, o.customer_id
         FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE oi.id = ? AND oi.order_id = ? AND oi.product_id = ? AND o.customer_id = ?`,
        [item_id, order_id, product_id, customerId]
    );

    if (items.length === 0) {
        throw new ApiError(404, "Order item not found or details mismatch");
    }

    const item = items[0];

    if (item.item_status !== 'Delivered') {
        throw new ApiError(400, "You can only review items after they have been delivered.");
    }

    // 2. Check for existing review (One review per customer per product)
    const [existing] = await db.query(
        `SELECT id FROM customer_reviews WHERE customer_id = ? AND product_id = ?`,
        [customerId, product_id]
    );

    if (existing.length > 0) {
        throw new ApiError(400, "You have already reviewed this product.");
    }

    // 3. Handle images
    let imageUrls = [];
    if (files && files.length > 0) {
        for (const file of files) {
            const { url } = await uploadFile(file, 'reviews');
            imageUrls.push(url);
        }
    }

    // 4. Insert review
    const [result] = await db.query(
        `INSERT INTO customer_reviews (order_item_id, order_id, customer_id, vendor_id, product_id, rating, review, images)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            item_id,
            order_id, 
            customerId, 
            item.vendor_id, 
            product_id, 
            rating, 
            review, 
            imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
        ]
    );

    return {
        id: result.insertId,
        message: "Review submitted successfully"
    };
};

/**
 * Update an existing review
 */
const updateReview = async (customerId, reviewId, updateData, files = []) => {
    const { rating, review } = updateData;

    // 1. Verify ownership
    const [existing] = await db.query(
        `SELECT id, images FROM customer_reviews WHERE id = ? AND customer_id = ?`,
        [reviewId, customerId]
    );

    if (existing.length === 0) {
        throw new ApiError(403, "You can only edit your own reviews.");
    }

    // 2. Handle new images if provided
    let imageUrls = null;
    if (files && files.length > 0) {
        imageUrls = [];
        for (const file of files) {
            const { url } = await uploadFile(file, 'reviews');
            imageUrls.push(url);
        }
    }

    // 3. Update
    if (imageUrls) {
        await db.query(
            `UPDATE customer_reviews SET rating = ?, review = ?, images = ? WHERE id = ?`,
            [rating, review, JSON.stringify(imageUrls), reviewId]
        );
    } else {
        await db.query(
            `UPDATE customer_reviews SET rating = ?, review = ? WHERE id = ?`,
            [rating, review, reviewId]
        );
    }

    return { message: "Review updated successfully" };
};

/**
 * Delete a review
 */
const deleteReview = async (customerId, reviewId) => {
    // 1. Verify ownership
    const [existing] = await db.query(
        `SELECT id FROM customer_reviews WHERE id = ? AND customer_id = ?`,
        [reviewId, customerId]
    );

    if (existing.length === 0) {
        throw new ApiError(403, "You can only delete your own reviews.");
    }

    // 2. Delete
    await db.query(`DELETE FROM customer_reviews WHERE id = ?`, [reviewId]);

    return { message: "Review deleted successfully" };
};

/**
 * List reviews with optional filters (admin and vendor use)
 */

const listReviews = async (queryParams, vendorId = null) => {
    const { page, limit, skip } = getPagination(queryParams);

    const where = [];
    const params = [];

    const explicitVendorId = vendorId || queryParams.vendor_id || queryParams.vendorId || queryParams.vendor;
    if (explicitVendorId && explicitVendorId !== 'null' && explicitVendorId !== 'undefined' && explicitVendorId !== '') {
        where.push(`r.vendor_id = ?`);
        params.push(explicitVendorId);
    }

    if (queryParams.product_id) {
        where.push(`r.product_id = ?`);
        params.push(queryParams.product_id);
    }

    if (queryParams.rating) {
        where.push(`r.rating = ?`);
        params.push(queryParams.rating);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
        `SELECT 
            r.*, 
            c.name as customer_name, c.profile_image, c.mobile as customer_phone, c.country_code as customer_country_code,
            p.name as product_name, p.slug as product_slug,
            v.business_name as vendor_name, v.email as vendor_email, v.country_code as vendor_country_code, v.mobile as vendor_phone,
            o.order_number,
            pi.image_url as product_image
         FROM customer_reviews r
         JOIN customers c ON r.customer_id = c.id
         JOIN products p ON r.product_id = p.id
         LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
         JOIN vendors v ON r.vendor_id = v.id
         JOIN orders o ON r.order_id = o.id
         ${whereClause}
         ORDER BY r.id DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, skip]
    );

    const [[{ totalRecords }]] = await db.query(
        `SELECT COUNT(*) as totalRecords FROM customer_reviews r ${whereClause}`,
        params
    );

    return {
        records: formatCustomerDates(rows.map(r => ({
            ...r,
            images: r.images ? (typeof r.images === 'string' ? JSON.parse(r.images) : r.images) : []
        }))),
        pagination: getPaginationMeta(page, limit, totalRecords)
    };
};


export default { createReview, updateReview, deleteReview, listReviews };

