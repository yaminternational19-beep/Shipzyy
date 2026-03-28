import Joi from 'joi';

const createProductSchema = Joi.object({
      vendor_id: Joi.number().required(),
      category_id: Joi.number().required(),
      subcategory_id: Joi.number().allow(null),
      brand_id: Joi.number().allow(null),
      custom_brand: Joi.string().allow(null, ""),

      name: Joi.string().required(),
      description: Joi.string().allow("", null),
      specification: Joi.object().allow(null),

      country_of_origin: Joi.string().allow("", null),
      manufacture_date: Joi.date().allow(null),
      expiry_date: Joi.date().allow(null),

      return_allowed: Joi.boolean().default(false),
      return_days: Joi.number().default(0),

      variants: Joi.array().items(
      Joi.object({
      variant_name: Joi.string().required(),
      unit: Joi.string().allow("", null),
      color: Joi.string().allow("", null),
      sku: Joi.string().allow("", null),
      mrp: Joi.number().required(),
      sale_price: Joi.number().required(),
      discount_value: Joi.number().allow(0),
      discount_type: Joi.string().valid("Flat", "Percent").allow(null),
      stock: Joi.number().default(0),
      min_order: Joi.number().default(1),
      low_stock_alert: Joi.number().default(5)
      })
      ).required(),

      images: Joi.array().items(
      Joi.object({
      image_url: Joi.string().required(),
      is_primary: Joi.boolean().default(false),
      sort_order: Joi.number().default(0)
      })
      ).required()
});

export { createProductSchema };