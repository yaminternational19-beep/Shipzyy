import Joi from 'joi';

const createProductSchema = Joi.object({
      vendor_id: Joi.number().required(),
      user_id: Joi.number().allow(null, ""),
      category_id: Joi.number().allow(null, ""),
      subcategory_id: Joi.number().allow(null, ""),
      brand_id: Joi.number().allow(null, ""),
      custom_brand: Joi.string().allow(null, ""),

      name: Joi.string().required(),
      description: Joi.string().allow("", null),
      specification: Joi.object().allow(null),

      country_of_origin: Joi.string().allow("", null),
      manufacture_date: Joi.date().allow(null),
      expiry_date: Joi.date().allow(null),

      return_allowed: Joi.boolean().default(false).allow(null, ""),
      return_days: Joi.number().default(0).allow(null, ""),

      // Flattened variant fields
      variant_name: Joi.string().allow("", null).default("Standard"),
      unit: Joi.string().allow("", null),
      color: Joi.string().allow("", null),
      sku: Joi.string().allow("", null),
      mrp: Joi.number().required(),
      sale_price: Joi.number().required(),
      discount_value: Joi.number().allow(0, null),
      discount_type: Joi.string().valid("Flat", "Percent").default("Percent").allow(null, ""),
      stock: Joi.number().default(0),
      min_order: Joi.number().default(1),
      low_stock_alert: Joi.number().default(5),

      // Images can still be an array or handled via files
      images: Joi.array().items(
      Joi.object({
      image_url: Joi.string().required(),
      is_primary: Joi.boolean().default(false),
      sort_order: Joi.number().default(0)
      })
      ).min(1).optional()
});

const updateStockSchema = Joi.object({
  product_id: Joi.number().required(),
  variant_id: Joi.number().required(),
  change_type: Joi.string().valid('ADD', 'REMOVE', 'ORDER', 'RETURN').required(),
  quantity: Joi.number().integer().min(1).required(),
  note: Joi.string().allow('', null)
});

export { createProductSchema, updateStockSchema };