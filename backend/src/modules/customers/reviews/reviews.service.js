import db from "../../../config/db.js";
import ApiError from "../../../utils/ApiError.js";
import { uploadFile } from "../../../services/s3Service.js";
import { getPagination, getPaginationMeta } from "../../../utils/pagination.js";
import formatCustomerDates from "../../../utils/formatCustomerDates.js";

/**
 * Submit a product review
 */
const createReview = async (customerId, reviewData, files = []) => {
    const { order_id, product_id, rating, review } = reviewData;

    // 1. Verify order belongs to customer and is Delivered
    const [orders] = await db.query(
        `SELECT id, order_status FROM orders WHERE id = ? AND customer_id = ?`,
        [order_id, customerId]
    );

    if (orders.length === 0) {
        throw new ApiError(404, "Order not found");
    }

    if (orders[0].order_status !== 'Delivered') {
        throw new ApiError(400, "You can only review products after they have been delivered.");
    }

    // 2. Verify product is in that order and get vendor_id
    const [orderItems] = await db.query(
        `SELECT vendor_id FROM order_items WHERE order_id = ? AND product_id = ?`,
        [order_id, product_id]
    );

    if (orderItems.length === 0) {
        throw new ApiError(400, "This product was not part of the specified order.");
    }

    const { vendor_id } = orderItems[0];

    // 3. Check for existing review (One review per product per order)
    const [existing] = await db.query(
        `SELECT id FROM customer_reviews WHERE customer_id = ? AND order_id = ? AND product_id = ?`,
        [customerId, order_id, product_id]
    );

    if (existing.length > 0) {
        throw new ApiError(400, "You have already reviewed this product for this order.");
    }

    // 4. Handle images
    let imageUrls = [];
    if (files && files.length > 0) {
        for (const file of files) {
            const { url } = await uploadFile(file, 'reviews');
            imageUrls.push(url);
        }
    }

    // 5. Insert review
    const [result] = await db.query(
        `INSERT INTO customer_reviews (order_id, customer_id, vendor_id, product_id, rating, review, images)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            order_id, 
            customerId, 
            vendor_id, 
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


export default { createReview };
