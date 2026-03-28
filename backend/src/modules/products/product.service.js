import db from "../../config/db.js";

/**
 * Creates a new product along with its variants and images.
 * @param {Object} data - The product data.
 * @param {number} data.vendor_id - The vendor ID.
 * @param {number} data.category_id - The category ID.
 * @param {number} data.subcategory_id - The subcategory ID.
 * @param {number} data.brand_id - The brand ID.
 * @param {string} data.custom_brand - Custom brand name if applicable.
 * @param {string} data.name - Product name.
 * @param {string} data.description - Product description.
 * @param {Object} data.specification - Product specifications.
 * @param {string} data.country_of_origin - Country of origin.
 * @param {string} data.manufacture_date - Manufacture date.
 * @param {string} data.expiry_date - Expiry date.
 * @param {boolean} data.return_allowed - Whether return is allowed.
 * @param {number} data.return_days - Number of return days.
 * @param {Array} data.variants - Array of product variants.
 * @param {Array} data.images - Array of product images.
 * @returns {Object} - Object containing the product ID.
 */
const createProduct = async (data) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Destructure the product data
    const {
      vendor_id,
      category_id,
      subcategory_id,
      brand_id,
      custom_brand,
      name,
      description,
      specification,
      country_of_origin,
      manufacture_date,
      expiry_date,
      return_allowed,
      return_days,
      variants,
      images
    } = data;

    // Insert into products table
    const [productResult] = await connection.query(
      `INSERT INTO products 
      (vendor_id, category_id, subcategory_id, brand_id, custom_brand, name, description, specification,
       country_of_origin, manufacture_date, expiry_date, return_allowed, return_days)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendor_id,
        category_id,
        subcategory_id,
        brand_id,
        custom_brand,
        name,
        description,
        JSON.stringify(specification),
        country_of_origin,
        manufacture_date,
        expiry_date,
        return_allowed,
        return_days
      ]
    );

    const productId = productResult.insertId;

    // Insert product variants
    for (const variant of variants) {
      await connection.query(
        `INSERT INTO product_variants
        (product_id, variant_name, unit, color, sku, mrp, sale_price, discount_value, discount_type, stock, min_order, low_stock_alert)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          variant.variant_name,
          variant.unit,
          variant.color,
          variant.sku,
          variant.mrp,
          variant.sale_price,
          variant.discount_value,
          variant.discount_type,
          variant.stock,
          variant.min_order,
          variant.low_stock_alert
        ]
      );
    }

    // Insert product images
    for (const image of images) {
      await connection.query(
        `INSERT INTO product_images
        (product_id, image_url, is_primary, sort_order)
        VALUES (?, ?, ?, ?)`,
        [
          productId,
          image.image_url,
          image.is_primary,
          image.sort_order
        ]
      );
    }

    await connection.commit();

    return { product_id: productId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Retrieves all products from the database.
 * @returns {Array} - Array of product objects.
 */
const getAllProducts = async () => {
  const [rows] = await db.query(`SELECT * FROM products ORDER BY id DESC`);
  return rows;
};

export default {
createProduct,
getAllProducts
};
