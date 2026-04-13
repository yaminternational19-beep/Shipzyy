import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from "../../utils/pagination.js";
import { getFromCache, setToCache } from "../../utils/cache.js";


const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day   = date.getDate();
    const month = date.getMonth() + 1;
    const year  = date.getFullYear();
    return `${day}-${month}-${year}`;
};


/* ===============================
   GET ALL ORDERS (Admin View)
================================ */

const getOrders = async (queryParams) => {
    const cacheKey = `admin:orders:list:${JSON.stringify(queryParams)}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const { page, limit, skip } = getPagination(queryParams);

    let where  = [];
    let values = [];

    if (queryParams.status) {
        where.push("o.order_status = ?");
        values.push(queryParams.status);
    }

    if (queryParams.payment_status) {
        where.push("o.payment_status = ?");
        values.push(queryParams.payment_status);
    }

    if (queryParams.search) {
        where.push("(o.order_number LIKE ? OR c.name LIKE ? OR c.email LIKE ?)");
        const s = `%${queryParams.search}%`;
        values.push(s, s, s);
    }

    if (queryParams.fromDate) {
        where.push("o.created_at >= ?");
        values.push(queryParams.fromDate);
    }

    if (queryParams.toDate) {
        where.push("o.created_at <= ?");
        values.push(queryParams.toDate + " 23:59:59");
    }

    const baseJoin = `
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
    `;

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    /* ---------- COUNT ---------- */
    const [countResult] = await db.query(
        `SELECT COUNT(DISTINCT o.id) as total ${baseJoin} ${whereClause}`,
        values
    );
    const totalRecords = countResult[0].total;

    /* ---------- STATS ---------- */
    const [statsResult] = await db.query(
        `SELECT
            COUNT(DISTINCT o.id)                                                              AS totalCount,
            SUM(CASE WHEN o.order_status = 'Pending'          THEN 1 ELSE 0 END)             AS pendingCount,
            SUM(CASE WHEN o.order_status = 'Confirmed'        THEN 1 ELSE 0 END)             AS confirmedCount,
            SUM(CASE WHEN o.order_status = 'Processing'       THEN 1 ELSE 0 END)             AS processingCount,
            SUM(CASE WHEN o.order_status = 'Out for Delivery' THEN 1 ELSE 0 END)             AS outForDeliveryCount,
            SUM(CASE WHEN o.order_status = 'Delivered'        THEN 1 ELSE 0 END)             AS deliveredCount,
            SUM(CASE WHEN o.order_status = 'Cancelled'        THEN 1 ELSE 0 END)             AS cancelledCount
         ${baseJoin} ${whereClause}`,
        values
    );

    const stats = {
        total:          statsResult[0].totalCount,
        pending:        statsResult[0].pendingCount,
        confirmed:      statsResult[0].confirmedCount,
        processing:     statsResult[0].processingCount,
        outForDelivery: statsResult[0].outForDeliveryCount,
        delivered:      statsResult[0].deliveredCount,
        cancelled:      statsResult[0].cancelledCount
    };

    /* ---------- RECORDS ----------
       Left join a derived table (fi) that picks the ROW_NUMBER = 1
       (i.e. first order_item) per order, giving us the primary product/vendor.
    ---------------------------------*/
    const [rows] = await db.query(
        `SELECT
            o.id,
            o.order_number,
            o.total_amount,
            o.payment_method,
            o.payment_status,
            o.order_status   AS status,
            o.created_at,
            o.updated_at,

            MAX(c.id)             AS customerId,
            MAX(c.name)           AS customerName,
            MAX(c.email)          AS customerEmail,
            MAX(c.mobile)         AS customerPhone,
            MAX(c.country_code)   AS customerCountryCode,

            MAX(fi.product_id)    AS itemId,
            MAX(fi.product_name)  AS itemName,
            MAX(fi.category_name) AS category,
            MAX(fi.sub_category_name) AS subCategory,
            MAX(fi.brand_name)    AS brand,
            MAX(fi.image_url)     AS productImage,

            MAX(fi.vendor_id)               AS vendorId,
            MAX(fi.vendor_business_name)    AS vendorCompanyName,
            MAX(fi.vendor_owner_name)       AS vendorName,
            MAX(fi.vendor_email)            AS vendorEmail,
            MAX(fi.vendor_phone)            AS vendorPhone,
            MAX(fi.vendor_country_code)     AS vendorCountryCode,

            (SELECT COUNT(*)           FROM order_items WHERE order_id = o.id) AS totalItems,
            (SELECT COUNT(DISTINCT vendor_id) FROM order_items WHERE order_id = o.id) AS totalVendors

        ${baseJoin}
        LEFT JOIN (
            SELECT
                oi.order_id,
                oi.product_id,
                p.name                              AS product_name,
                cat.name                            AS category_name,
                sc.name                             AS sub_category_name,
                COALESCE(b.name, p.custom_brand)    AS brand_name,
                (
                    SELECT image_url FROM product_images pi2
                    WHERE pi2.product_id = p.id AND pi2.is_primary = 1
                    LIMIT 1
                )                                   AS image_url,
                v.id                                AS vendor_id,
                v.business_name                     AS vendor_business_name,
                v.owner_name                        AS vendor_owner_name,
                v.email                             AS vendor_email,
                v.mobile                            AS vendor_phone,
                v.country_code                      AS vendor_country_code,
                ROW_NUMBER() OVER (
                    PARTITION BY oi.order_id ORDER BY oi.id ASC
                )                                   AS rn
            FROM order_items oi
            JOIN  products p   ON p.id  = oi.product_id
            JOIN  vendors  v   ON v.id  = oi.vendor_id
            LEFT JOIN categories   cat ON cat.id = p.category_id
            LEFT JOIN subcategories sc  ON sc.id  = p.subcategory_id
            LEFT JOIN brands        b   ON b.id   = p.brand_id
        ) fi ON fi.order_id = o.id AND fi.rn = 1
        ${whereClause}
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?`,
        [...values, limit, skip]
    );

    const records = rows.map(row => ({
        id:             row.id.toString(),
        orderNumber:    row.order_number,
        totalAmount:    parseFloat(row.total_amount || 0),
        paymentMethod:  row.payment_method  || "-",
        paymentStatus:  row.payment_status  || "-",
        status:         row.status,
        totalItems:     row.totalItems,
        totalVendors:   row.totalVendors,
        productImage:   row.productImage    || null,
        createdDate:    formatDate(row.created_at),
        deliveredDate:  row.status === "Delivered" ? formatDate(row.updated_at) : "-",

        customerId:     `CUST-${row.customerId}`,
        customerName:   row.customerName    || "-",
        customerEmail:  row.customerEmail   || "-",
        customerPhone:  row.customerCountryCode
            ? `${row.customerCountryCode} ${row.customerPhone}`
            : (row.customerPhone || "-"),

        itemId:         row.itemId    ? `ITEM-${row.itemId}` : "-",
        itemName:       row.itemName  || "-",
        category:       row.category    || "-",
        subCategory:    row.subCategory || "-",
        brand:          row.brand       || "-",

        vendorCompanyName: row.vendorCompanyName || "-",
        vendorName:        row.vendorName        || "-",
        vendorEmail:       row.vendorEmail       || "-",
        vendorPhone:       row.vendorCountryCode
            ? `${row.vendorCountryCode} ${row.vendorPhone}`
            : (row.vendorPhone || "-")
    }));

    const pagination = getPaginationMeta(page, limit, totalRecords);

    const result = { stats, records, pagination };
    await setToCache(cacheKey, result, 120); // 2 mins
    return result;
};


/* ===============================
   GET SINGLE ORDER BY ID
================================ */

const getOrderById = async (orderId) => {
    const cacheKey = `admin:order:detail:${orderId}`;
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) return cachedData;

    const [rows] = await db.query(
        `SELECT
            o.id,
            o.order_number,
            o.total_amount,
            o.discount         AS discount_amount,
            o.delivery_charges AS delivery_charge,
            o.coupon_code,
            o.payment_method,
            o.payment_status,
            o.order_status   AS status,
            o.created_at,
            o.updated_at,

            c.id             AS customerId,
            c.name           AS customerName,
            c.email          AS customerEmail,
            c.mobile         AS customerPhone,
            c.country_code   AS customerCountryCode,

            ca.address_line_1,
            ca.address_line_2,
            ca.landmark,
            ca.city,
            ca.state,
            ca.pincode,
            ca.contact_person_name,
            ca.contact_phone

         FROM orders o
         JOIN customers c ON c.id = o.customer_id
         LEFT JOIN customers_addresses ca ON ca.id = o.address_id
         WHERE o.id = ?`,
        [orderId]
    );

    if (!rows.length) {
        throw new Error("Order not found");
    }

    const order = rows[0];

    const [items] = await db.query(
        `SELECT
            oi.id,
            oi.product_id,
            oi.quantity,
            oi.price,
            p.name                              AS productName,
            p.slug                              AS productSlug,
            COALESCE(b.name, p.custom_brand)    AS brand,
            cat.name                            AS category,
            sc.name                             AS subCategory,
            v.id                                AS vendorId,
            v.business_name                     AS vendorCompanyName,
            v.owner_name                        AS vendorName,
            v.email                             AS vendorEmail,
            v.mobile                            AS vendorPhone,
            v.country_code                      AS vendorCountryCode,
            (
                SELECT image_url FROM product_images
                WHERE product_id = p.id AND is_primary = 1
                LIMIT 1
            )                                   AS productImage
         FROM order_items oi
         JOIN  products p   ON p.id  = oi.product_id
         JOIN  vendors  v   ON v.id  = oi.vendor_id
         LEFT JOIN categories   cat ON cat.id = p.category_id
         LEFT JOIN subcategories sc  ON sc.id  = p.subcategory_id
         LEFT JOIN brands        b   ON b.id   = p.brand_id
         WHERE oi.order_id = ?`,
        [orderId]
    );

    const result = {
        id:             order.id.toString(),
        orderNumber:    order.order_number,
        totalAmount:    parseFloat(order.total_amount    || 0),
        discountAmount: parseFloat(order.discount_amount || 0),
        deliveryCharge: parseFloat(order.delivery_charge || 0),
        couponCode:     order.coupon_code    || null,
        paymentMethod:  order.payment_method || "-",
        paymentStatus:  order.payment_status || "-",
        status:         order.status,
        createdDate:    formatDate(order.created_at),
        updatedDate:    formatDate(order.updated_at),

        customer: {
            id:    `CUST-${order.customerId}`,
            name:  order.customerName  || "-",
            email: order.customerEmail || "-",
            phone: order.customerCountryCode
                ? `${order.customerCountryCode} ${order.customerPhone}`
                : (order.customerPhone || "-")
        },

        deliveryAddress: {
            line1:        order.address_line_1      || "-",
            line2:        order.address_line_2      || "",
            landmark:     order.landmark            || "",
            city:         order.city                || "-",
            state:        order.state               || "-",
            pincode:      order.pincode             || "-",
            contactName:  order.contact_person_name || order.customerName,
            contactPhone: order.contact_phone       || order.customerPhone
        },

        items: items.map(item => ({
            id:            item.id,
            productId:     item.product_id,
            productName:   item.productName,
            productImage:  item.productImage || null,
            category:      item.category     || "-",
            subCategory:   item.subCategory  || "-",
            brand:         item.brand        || "-",
            quantity:      item.quantity,
            price:         parseFloat(item.price || 0),
            lineTotal:     parseFloat(item.price || 0) * item.quantity,
            vendorId:      item.vendorId,
            vendorCompany: item.vendorCompanyName,
            vendorName:    item.vendorName,
            vendorEmail:   item.vendorEmail,
            vendorPhone:   item.vendorCountryCode
                ? `${item.vendorCountryCode} ${item.vendorPhone}`
                : item.vendorPhone
        }))
    };

    await setToCache(cacheKey, result, 300); // 5 mins
    return result;
};


export default {
    getOrders,
    getOrderById
};
