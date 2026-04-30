import db from "../../config/db.js";
import { getPagination, getPaginationMeta } from '../../utils/pagination.js';
import slugify from 'slugify';
import s3Service from '../../services/s3Service.js';
import { createProductSchema } from './product.validator.js';
import ApiError from '../../utils/ApiError.js';
import { getFromCache, setToCache, removeFromCache, removeByPattern } from "../../utils/cache.js";

const createProduct = async (data, files, existingConnection = null) => {
  // Handle JSON strings if from multipart
  if (typeof data.specification === 'string') data.specification = JSON.parse(data.specification);
  if (typeof data.images === 'string') data.images = JSON.parse(data.images);

  // Clean up empty strings, 'null' strings, or non-numeric names for numeric ID fields
  const idFields = ['category_id', 'subcategory_id', 'brand_id', 'vendor_id', 'user_id'];
  idFields.forEach(field => {
      const rawVal = data[field];
      const val = typeof rawVal === 'string' ? rawVal.trim() : rawVal;

      if (val === '' || val === 'null' || val === 'undefined' || val === undefined || val === null) {
          data[field] = null;
      } else if (isNaN(Number(val))) {
          data[field] = null;
      } else {
          data[field] = Number(val);
      }
  });

  const { error, value: validatedData } = createProductSchema.validate(data);
  if (error) {
      throw new ApiError(400, "Validation failed", "VALIDATION_ERROR", error.details[0].message);
  }

  const connection = existingConnection || await db.getConnection();
  try {
      if (!existingConnection) await connection.beginTransaction();

    const {
      vendor_id, category_id, subcategory_id, brand_id, custom_brand,
      name, description, specification, country_of_origin,
      manufacture_date, expiry_date, return_allowed, return_days,
      images,
      // Variant fields
      variant_name, unit, color, sku, mrp, sale_price,
      discount_value, discount_type, stock, min_order, low_stock_alert
    } = validatedData;

    // Fetch Vendor info for S3 path and approval policy
    const [vendorRows] = await connection.query(
      `SELECT business_name, auto_approve_products FROM vendors WHERE id = ?`,
      [vendor_id]
    );

    if (vendorRows.length === 0) throw new ApiError(404, "Vendor not found");
    const vendorInfo = vendorRows[0];

    // Fetch Category info if provided (now optional)
    let categoryName = "general";
    if (category_id) {
      const [categoryRows] = await connection.query(
        `SELECT name FROM categories WHERE id = ?`,
        [category_id]
      );
      if (categoryRows.length > 0) categoryName = categoryRows[0].name;
    }

    // 1. UNIQUE CHECK (Pre-insert)
    const [existing] = await connection.query(
      `SELECT p.id 
       FROM products p
       WHERE p.vendor_id = ?
       AND p.name = ?
       LIMIT 1`,
      [vendor_id, name]
    );

    if (existing.length > 0) {
      throw new ApiError(400, "Product already exists", "DUPLICATE_ERROR");
    }

    const vendorSlug = slugify(vendorInfo.business_name, { lower: true });
    const categorySlug = slugify(categoryName, { lower: true });
    const productPathName = slugify(name, { lower: true });
    const s3Folder = `${vendorSlug}/${categorySlug}/${productPathName}`;

    // Handle S3 Uploads
    const uploadedImages = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const upload = await s3Service.uploadFile(files[i], s3Folder);
        uploadedImages.push({
          image_url: upload.url,
          is_primary: i === 0,
          sort_order: i
        });
      }
    }

    const finalImages = [...(images || []), ...uploadedImages];

    if (finalImages.length === 0) {
      throw new ApiError(400, "At least one product image is required");
    }

    const m_date = manufacture_date ? new Date(manufacture_date).toISOString().split('T')[0] : null;
    const e_date = expiry_date ? new Date(expiry_date).toISOString().split('T')[0] : null;

    // Slug Unique Guard
    let productBaseSlug = slugify(name, { lower: true });
    let productSlug = productBaseSlug;
    let isUnique = false;
    let counter = 0;
    while (!isUnique) {
      const [duplicate] = await connection.query(`SELECT id FROM products WHERE slug = ?`, [productSlug]);
      if (duplicate.length === 0) {
        isUnique = true;
      } else {
        counter++;
        productSlug = `${productBaseSlug}-${counter}`;
      }
    }

    const autoApprove = vendorInfo.auto_approve_products === 1;
    const approvalStatus = autoApprove ? 'APPROVED' : 'PENDING';

    // Insert into products table
    const [productResult] = await connection.query(
      `INSERT INTO products 
      (vendor_id, category_id, subcategory_id, brand_id, custom_brand, name, slug, description, specification,
       country_of_origin, manufacture_date, expiry_date, return_allowed, return_days, approval_status, is_live, is_active, approved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor_id,
        category_id,
        subcategory_id,
        brand_id,
        custom_brand,
        name,
        productSlug,
        description,
        JSON.stringify(specification),
        country_of_origin, m_date, e_date,
        return_allowed ? 1 : 0, return_days,
        approvalStatus,
        autoApprove ? 1 : 0,
        autoApprove ? 1 : 0,
        autoApprove ? new Date() : null
      ]
    );

    const productId = productResult.insertId;

    // Insert SINGLE Variant (Always 1 variant per product)
    const [variantResult] = await connection.query(
      `INSERT INTO product_variants 
      (product_id, variant_name, unit, color, sku, mrp, sale_price, discount_value, discount_type, stock, min_order, low_stock_alert) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId, variant_name || 'Standard', unit || 'PCS', color || 'N/A',
        sku || `SKU-${productId}-${Date.now()}`,
        mrp, sale_price, discount_value || 0, discount_type || 'Percent',
        stock || 0, min_order || 1, low_stock_alert || 5
      ]
    );

    // Bulk Insert Images
    if (finalImages.length > 0) {
      const imageValues = finalImages.map((img, i) => [
        productId, img.image_url, img.is_primary ? 1 : 0, i
      ]);
      await connection.query(
        `INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ?`,
        [imageValues]
      );
    }

    if (!existingConnection) await connection.commit();

    // Invalidate caches (Skip if in bulk - bulk handler does it once)
    if (!existingConnection) {
        await removeByPattern("vendor:products:list:*");
        await removeByPattern("admin:products:list:*");
        await removeByPattern("customer:home:*");
        await removeByPattern("customer:products:*");
    }

    return { product_id: productId };
  } catch (error) {
    if (!existingConnection && connection) await connection.rollback();
    throw error;
  } finally {
    if (!existingConnection && connection) connection.release();
  }
};

const getAllProducts = async (queryParams) => {
  const cacheKey = `vendor:products:list:${JSON.stringify(queryParams)}`;
  // const cachedData = await getFromCache(cacheKey);
  // if (cachedData) return cachedData;

  const { page, limit, skip } = getPagination(queryParams);

  let where = [];
  let values = [];

  // Filters
  const vendorId = queryParams.vendor_id;
  if (vendorId) {
    where.push("p.vendor_id = ?");
    values.push(vendorId);
  }
  
  // Only add filters if they have a non-empty value
  if (queryParams.category_id && queryParams.category_id !== '') {
    if (isNaN(Number(queryParams.category_id))) {
      where.push("c.name = ?");
    } else {
      where.push("p.category_id = ?");
    }
    values.push(queryParams.category_id);
  }
  
  if (queryParams.subcategory_id && queryParams.subcategory_id !== '') {
     if (isNaN(Number(queryParams.subcategory_id))) {
      where.push("sc.name = ?");
    } else {
      where.push("p.subcategory_id = ?");
    }
    values.push(queryParams.subcategory_id);
  }

  if (queryParams.brand_id && queryParams.brand_id !== '') {
    if (isNaN(Number(queryParams.brand_id))) {
      where.push("b.name = ?");
    } else {
      where.push("p.brand_id = ?");
    }
    values.push(queryParams.brand_id);
  }

  if (queryParams.approval_status && queryParams.approval_status !== '') {
    where.push("p.approval_status = ?");
    values.push(queryParams.approval_status);
  }

  if (queryParams.stock_status && queryParams.stock_status !== '') {
    if (queryParams.stock_status === 'out') {
      where.push("p.id IN (SELECT product_id FROM product_variants GROUP BY product_id HAVING SUM(stock) = 0)");
    } else if (queryParams.stock_status === 'low') {
      where.push("p.id IN (SELECT product_id FROM product_variants GROUP BY product_id HAVING SUM(stock) > 0 AND SUM(stock) <= 10)");
    } else if (queryParams.stock_status === 'high') {
      where.push("p.id IN (SELECT product_id FROM product_variants GROUP BY product_id HAVING SUM(stock) > 10)");
    }
  }

  if (queryParams.is_live !== undefined && queryParams.is_live !== null && queryParams.is_live !== '') {
    where.push("p.is_live = ?");
    values.push(queryParams.is_live === 'true' || queryParams.is_live == 1 ? 1 : 0);
  }

  if (queryParams.search && queryParams.search.trim() !== '') {
    where.push("(p.name LIKE ? OR p.custom_brand LIKE ? OR p.description LIKE ?)");
    const searchVal = `%${queryParams.search.trim()}%`;
    values.push(searchVal, searchVal, searchVal);
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Total Count
  const countSql = `SELECT COUNT(*) as total 
     FROM products p 
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
     LEFT JOIN brands b ON p.brand_id = b.id
     ${whereClause}`;
     
  const [countResult] = await db.query(countSql, values);
  const totalRecords = countResult[0].total;

  // Fetch Products
  const selectQuery = `
    SELECT 
      p.id, p.vendor_id, p.category_id, p.subcategory_id, p.brand_id, p.custom_brand, 
      p.name, p.slug, p.description, p.specification, p.country_of_origin,
      DATE_FORMAT(p.manufacture_date, '%Y-%m-%d') as manufacture_date,
      DATE_FORMAT(p.expiry_date, '%Y-%m-%d') as expiry_date,
      p.return_allowed, p.return_days, p.approval_status, p.rejection_reason, p.rejected_at, p.approved_by, p.approved_at,
      p.is_live, p.is_active, p.view_count, p.sold_count,
      DATE_FORMAT(p.created_at, '%Y-%m-%d') as created_at,
      DATE_FORMAT(p.updated_at, '%Y-%m-%d') as updated_at,
      DATE_FORMAT(p.rejected_at, '%Y-%m-%d') as rejected_at,
      COALESCE(NULLIF(v.business_name, ''), 'Shipzyy User') as vendor_name,
      c.name as category_name,
      sc.name as subcategory_name,
      COALESCE(b.name, p.custom_brand) as brand_name
    FROM products p
    LEFT JOIN vendors v ON p.vendor_id = v.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    LEFT JOIN brands b ON p.brand_id = b.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(selectQuery, [...values, limit, skip]);

  if (rows.length > 0) {
    const productIds = rows.map(p => p.id);

    // Fetch ALL images for these products
    const [images] = await db.query(
      `SELECT product_id, image_url, is_primary FROM product_images WHERE product_id IN (?) ORDER BY sort_order ASC`,
      [productIds]
    );
    const imagesMap = {};
    images.forEach(img => {
      if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
      imagesMap[img.product_id].push(img.image_url);
    });

    // Fetch prices and inventory summary
    const [variants] = await db.query(
      `SELECT 
        product_id, 
        MAX(id) as variant_id,
        SUM(stock) as total_stock, 
        MIN(sale_price) as min_price, 
        MIN(mrp) as min_mrp,
        MAX(discount_value) as max_discount,
        MAX(discount_type) as discount_type,
        MAX(low_stock_alert) as low_stock_alert,
        MAX(min_order) as min_order,
        MAX(unit) as unit,
        MAX(color) as color,
        MAX(sku) as sku,
        MAX(variant_name) as variant_name
       FROM product_variants 
       WHERE product_id IN (?) 
       GROUP BY product_id`,
      [productIds]
    );

    const variantMap = {};
    variants.forEach(v => {
      variantMap[v.product_id] = {
        variant_id: v.variant_id,
        stock: v.total_stock || 0,
        sale_price: v.min_price || 0,
        mrp: v.min_mrp || 0,
        discount_value: v.max_discount || 0,
        discount_type: v.discount_type || 'Percent',
        low_stock_alert: v.low_stock_alert || 5,
        min_order: v.min_order || 1,
        unit: v.unit || 'PCS',
        color: v.color || 'N/A',
        sku: v.sku || '',
        variant_name: v.variant_name || 'Standard'
      };
    });

    rows.forEach((p, idx) => {
      const v = variantMap[p.id] || {};

      // Structure for VendorProductsPage mapping
      p.inventory_info = {
          variant_id: v.variant_id,
          total_stock: v.stock || 0,
          min_price: v.sale_price || 0,
          min_mrp: v.mrp || 0,
          max_discount: v.discount_value || 0,
          discount_type: v.discount_type || 'Percent',
          low_stock_alert: v.low_stock_alert || 5,
          min_order: v.min_order || 1,
          unit: v.unit || 'PCS',
          color: v.color || 'N/A',
          sku: v.sku || '',
          variant_name: v.variant_name || 'Standard'
      }; 
      p.primary_image = imagesMap[p.id]?.[0] || null;
      p.all_images = (imagesMap[p.id] || []).map(url => ({ image_url: url }));

      // Flat keys for extra compatibility
      p.variant_id = v.variant_id;
      p.stock = v.stock;
      p.sale_price = v.sale_price;
      p.mrp = v.mrp;
      p.offer_price = v.sale_price; 
      p.discount_value = v.discount_value;
      p.discount_type = v.discount_type;
      p.low_stock_alert = v.low_stock_alert;
      p.min_order = v.min_order;
      p.unit = v.unit;
      p.color = v.color;
      p.sku = v.sku;
      p.variant_name = v.variant_name;
      p.images = imagesMap[p.id] || [];

      // Map to camelCase for frontend components
      p.salePrice = v.sale_price;
      p.MRP = v.mrp;
      p.manufactureDate = p.manufacture_date;
      p.expiryDate = p.expiry_date;
      p.category = p.category_name;
      p.subCategory = p.subcategory_name;
      p.brand = p.brand_name;
      p.isActive = p.is_live === 1;
    });
  }

  const result = {
    records: rows,
    pagination: getPaginationMeta(page, limit, totalRecords)
  };

  await setToCache(cacheKey, result, 3600);
  return result;
};

const updateProduct = async (productId, data, files) => {
  // Handle JSON strings
  if (typeof data.specification === 'string') data.specification = JSON.parse(data.specification);
  if (typeof data.images === 'string') data.images = JSON.parse(data.images);

  // Clean up IDs
  const idFields = ['category_id', 'subcategory_id', 'brand_id', 'vendor_id', 'user_id'];
  idFields.forEach(field => {
    const rawVal = data[field];
    const val = Number(rawVal);

    // If it's effectively empty or not a valid number, set to null
    if (rawVal === '' || rawVal === 'null' || rawVal === 'undefined' || rawVal === undefined || rawVal === null || isNaN(val)) {
      data[field] = null;
    } else {
      data[field] = val;
    }
  });

  const { error, value: validatedData } = createProductSchema.validate({ ...data, vendor_id: data.vendor_id });
  if (error) throw new ApiError(400, "Validation error: " + error.details[0].message);

  const {
    name, description, specification, country_of_origin,
    manufacture_date, expiry_date, return_allowed, return_days,
    category_id, subcategory_id, brand_id, custom_brand,
    variant_name, unit, color, sku, mrp, sale_price,
    discount_value, discount_type, stock, min_order, low_stock_alert,
    images: incomingImages
  } = validatedData;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if product exists
    const [existingRows] = await connection.query(`SELECT * FROM products WHERE id = ?`, [productId]);
    if (existingRows.length === 0) throw new ApiError(404, "Product not found");

    // Fetch Vendor info for pathing
    const [metaRows] = await connection.query(
      `SELECT v.business_name, c.name as category_name 
             FROM vendors v, categories c 
             WHERE v.id = ? AND c.id = ?`,
      [validatedData.vendor_id, category_id]
    );
    if (metaRows.length === 0) throw new Error("Vendor or Category not found");
    const vendorInfo = metaRows[0];

    // 1. Update Product details
    await connection.query(
      `UPDATE products SET 
            name = ?, description = ?, specification = ?, country_of_origin = ?,
            manufacture_date = ?, expiry_date = ?, return_allowed = ?, return_days = ?,
            category_id = ?, subcategory_id = ?, brand_id = ?, custom_brand = ?, updated_at = NOW()
            WHERE id = ?`,
      [
        name, description, JSON.stringify(specification), country_of_origin,
        manufacture_date, expiry_date, return_allowed ? 1 : 0, return_days,
        category_id, subcategory_id, brand_id, custom_brand, productId
      ]
    );

    // 2. Update the SINGLE variant
    await connection.query(
      `UPDATE product_variants SET 
            variant_name = ?, unit = ?, color = ?, sku = ?, mrp = ?, sale_price = ?,
            discount_value = ?, discount_type = ?, stock = ?, min_order = ?, low_stock_alert = ?, updated_at = NOW()
            WHERE product_id = ?`,
      [
        variant_name, unit, color, sku, mrp, sale_price,
        discount_value, discount_type, stock, min_order, low_stock_alert, productId
      ]
    );

    // 3. Image handling (simplified for this task)
    const vendorSlug = slugify(vendorInfo.business_name, { lower: true });
    const categorySlug = slugify(vendorInfo.category_name, { lower: true });
    const productPathName = slugify(name, { lower: true });
    const s3Folder = `${vendorSlug}/${categorySlug}/${productPathName}`;

    const newlyUploadedImages = [];
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const upload = await s3Service.uploadFile(files[i], s3Folder);
        newlyUploadedImages.push({
          image_url: upload.url,
          is_primary: i === 0 && (!incomingImages || incomingImages.length === 0),
          sort_order: (incomingImages ? incomingImages.length : 0) + i
        });
      }
    }

    const finalImages = [...(incomingImages || []), ...newlyUploadedImages];
    if (finalImages.length > 0) {
      const [oldImages] = await connection.query(`SELECT image_url FROM product_images WHERE product_id = ?`, [productId]);
      const incomingUrls = finalImages.map(img => img.image_url);
      const removedImages = oldImages.filter(img => !incomingUrls.includes(img.image_url));

      for (const img of removedImages) {
        try {
          const key = img.image_url.split('.amazonaws.com/')[1];
          if (key) await s3Service.deleteFile(key);
        } catch (err) { console.warn("Failed to delete S3 file:", err.message); }
      }

      await connection.query(`DELETE FROM product_images WHERE product_id = ?`, [productId]);
      const imageValues = finalImages.map((img, i) => [productId, img.image_url, img.is_primary ? 1 : 0, i]);
      await connection.query(`INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES ?`, [imageValues]);
    }

    await connection.commit();
    await removeByPattern("vendor:products:*");
    await removeByPattern("admin:products:*");
    await removeFromCache(`admin:product:profile:${productId}`);
    await removeByPattern("customer:*");

    return { success: true };
  } catch (err) {
    if (connection) await connection.rollback();
    throw err;
  } finally {
    if (connection) connection.release();
  }
};

const toggleProductLiveStatus = async (productId, isLive) => {
  const [productRows] = await db.query(
    `SELECT approval_status FROM products WHERE id = ?`,
    [productId]
  );

  if (productRows.length === 0) {
    throw new ApiError(404, "Product not found");
  }

  const { approval_status } = productRows[0];

  if (approval_status !== 'APPROVED') {
    throw new ApiError(400, "Only fully APPROVED products can be made LIVE. This product is currently " + approval_status, "STATUS_RESTRICTION");
  }

  // Update live status
  await db.query(
    `UPDATE products SET is_live = ? WHERE id = ?`,
    [isLive ? 1 : 0, productId]
  );

  // Invalidate caches
  await removeFromCache(`admin:product:profile:${productId}`);
  await removeFromCache(`customer:product:${productId}`);
  await removeByPattern("vendor:products:list:*");
  await removeByPattern("customer:home:*");
  await removeByPattern("customer:products:*");

  return { product_id: productId, is_live: isLive ? 1 : 0 };
};

const updateStock = async (vendorId, payload) => {
  const { product_id, variant_id, change_type, quantity, note } = payload;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get Stock and Actual Vendor ID (Super Admin bypass vs Vendor lock)
    let query = `SELECT v.stock, p.vendor_id FROM product_variants v JOIN products p ON p.id = v.product_id WHERE v.id = ? AND v.product_id = ?`;
    const params = [variant_id, product_id];

    if (vendorId) {
      query += ` AND p.vendor_id = ?`;
      params.push(vendorId);
    }
    query += ` FOR UPDATE`;

    const [existing] = await connection.query(query, params);

    if (existing.length === 0) {
      throw new ApiError(404, "Product variant not found or unauthorized access");
    }

    const previous_stock = existing[0].stock;
    const actualVendorId = existing[0].vendor_id;
    let new_stock = previous_stock;

    // 2. Calculate New Stock
    if (change_type === 'ADD' || change_type === 'RETURN') {
      new_stock = previous_stock + quantity;
    } else if (change_type === 'REMOVE' || change_type === 'ORDER') {
      new_stock = previous_stock - quantity;
    }

    // 3. Prevent Negative Stock
    if (new_stock < 0) {
      throw new ApiError(400, "Insufficient stock. Current stock: " + previous_stock);
    }

    // 4. Update Product Variant
    await connection.query(
      `UPDATE product_variants SET stock = ? WHERE id = ?`,
      [new_stock, variant_id]
    );

    // 5. Insert Stock Log
    await connection.query(
      `INSERT INTO product_stock_logs 
       (product_id, variant_id, vendor_id, change_type, quantity, previous_stock, new_stock, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_id, variant_id, actualVendorId, change_type, quantity, previous_stock, new_stock, note || '']
    );


    await connection.commit();

    // Invalidate caches
    await removeFromCache(`admin:product:profile:${product_id}`);
    await removeFromCache(`customer:product:${product_id}`);
    await removeByPattern("vendor:products:list:*");
    await removeByPattern("customer:cart:*");

    return { previous_stock, change: (new_stock - previous_stock), new_stock };
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const deleteProduct = async (productId, vendorId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let query = `SELECT image_url FROM product_images WHERE product_id = ?`;
    let params = [productId];

    if (vendorId) {
      const [own] = await connection.query(`SELECT id FROM products WHERE id = ? AND vendor_id = ?`, [productId, vendorId]);
      if (own.length === 0) throw new ApiError(403, "Access denied - unauthorized item deletion");
    }

    const [images] = await connection.query(query, params);

    for (const img of images) {
      const key = img.image_url.split('.amazonaws.com/')[1];
      if (key) await s3Service.deleteFile(key);
    }

    await connection.query(`DELETE FROM products WHERE id = ?`, [productId]);

    await connection.commit();

    await removeFromCache(`admin:product:profile:${productId}`);
    await removeFromCache(`customer:product:${productId}`);
    await removeByPattern("vendor:products:list:*");
    await removeByPattern("admin:products:list:*");
    await removeByPattern("customer:home:*");
    await removeByPattern("customer:products:*");

    return { success: true, deleted_id: productId };
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

const bulkCreateProducts = async (vendorId, userId, productsArray) => {
  if (!Array.isArray(productsArray)) throw new ApiError(400, "Invalid products data format - expected array");
  if (productsArray.length > 100) throw new ApiError(400, "Bulk upload limited to 100 products per request");

  const results = { total: productsArray.length, saved: 0, failed: 0, errors: [] };
  const connection = await db.getConnection();

  try {
    for (const [index, productData] of productsArray.entries()) {
      try {
        // Each product gets its own transaction so one failure doesn't block the rest
        await connection.beginTransaction();

        // Inject identity
        const data = { ...productData, vendor_id: vendorId, user_id: userId };

        // Reuse the core logic (assuming no files for this JSON-based bulk API)
        await createProduct(data, null, connection);

        await connection.commit();
        results.saved++;
      } catch (err) {
        if (connection) await connection.rollback();
        results.failed++;
        results.errors.push({
          index,
          productName: productData.name || "Unknown",
          error: err.message || "Unknown error"
        });
      }
    }

    // Invalidate caches once after the whole loop
    await removeByPattern("vendor:products:list:*");
    await removeByPattern("admin:products:list:*");
    await removeByPattern("customer:home:*");
    await removeByPattern("customer:products:*");

    return results;
  } finally {
    if (connection) connection.release();
  }
};

export default {
  createProduct,
  bulkCreateProducts,
  updateProduct,
  getAllProducts,
  toggleProductLiveStatus,
  updateStock,
  deleteProduct
};
