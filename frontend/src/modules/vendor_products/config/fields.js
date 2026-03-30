const productFields = {

  /* =========================
     1️⃣ BASIC INFORMATION (PRODUCT TABLE)
  ========================== */
  basicInfo: [
    {
      name: "category_id",
      label: "Category",
      type: "select",
      required: true,
      options: []
    },
    {
      name: "subcategory_id",
      label: "Sub Category",
      type: "select",
      options: []
    },
    {
      name: "name",
      label: "Product Name",
      type: "text",
      required: true,
      placeholder: "e.g. Wireless Smart Controller"
    },
    {
      name: "brand_id",
      label: "Brand Name",
      type: "select",
      options: []
    },
    {
      name: "custom_brand",
      label: "Custom Brand Name",
      type: "text",
      condition: { field: "brand_id", value: "Other" },
      placeholder: "Enter new brand name"
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Product description"
    },
    {
      name: "specification",
      label: "Brief Specification",
      type: "textarea",
      required: true,
      placeholder: "Key highlights (one per line)..."
    }
  ],

  /* =========================
     2️⃣ PRICING (VARIANT TABLE)
  ========================== */
  pricing: [
    {
      name: "mrp",
      label: "MRP (Base Price)",
      type: "number",
      required: true,
      placeholder: "0.00",
      group: "variant"
    },
    {
      name: "discount_value",
      label: "Discount Value",
      type: "number",
      placeholder: "0",
      group: "variant"
    },
    {
      name: "sale_price",
      label: "Selling Price",
      type: "number",
      placeholder: "0.00",
      group: "variant"
    }
  ],

  /* =========================
     4️⃣ VARIANT DETAILS (VARIANT TABLE)
  ========================== */
  variantDetails: [
    {
      name: "variant_name",
      label: "Variant Name (Size)",
      type: "text",
      placeholder: "e.g. 1kg, XL",
      group: "variant"
    },
    {
      name: "unit",
      label: "Unit",
      type: "select",
      options: ["kg", "gram", "liter", "ml", "piece", "box", "packet"],
      group: "variant"
    },
    {
      name: "color",
      label: "Color",
      type: "text",
      placeholder: "e.g. Red, Blue",
      group: "variant"
    },
    {
      name: "sku",
      label: "SKU (Internal Code)",
      type: "text",
      placeholder: "e.g. SKU-882910",
      group: "variant"
    }
  ],
  /* =========================
     3️⃣ INVENTORY (VARIANT TABLE)
  ========================== */
  inventory: [
    {
      name: "stock",
      label: "Current Stock",
      type: "number",
      required: true,
      placeholder: "0",
      group: "variant"
    },
    {
      name: "min_order",
      label: "Minimum Order Requirement",
      type: "number",
      required: true,
      placeholder: "1",
      group: "variant"
    },
    {
      name: "low_stock_alert",
      label: "Low Stock Alert",
      type: "number",
      placeholder: "10",
      group: "variant"
    }
  ],

  /* =========================
     5️⃣ MANUFACTURING DETAILS (PRODUCT TABLE)
  ========================== */
  manufacturing: [
    {
      name: "manufacture_date",
      label: "Manufacturing Date",
      type: "date"
    },
    {
      name: "expiry_date",
      label: "Expiry Date",
      type: "date"
    },
    {
      name: "country_of_origin",
      label: "Made In",
      type: "text",
      placeholder: "e.g. India"
    }
  ],

  /* =========================
     6️⃣ RETURN POLICY (PRODUCT TABLE)
  ========================== */
  returnPolicy: [
    {
      name: "return_allowed",
      label: "Return Applicable",
      type: "checkbox"
    },
    {
      name: "return_days",
      label: "Return Days",
      type: "number",
      condition: { field: "return_allowed", value: true },
      placeholder: "e.g. 7"
    }
  ]
};

export default productFields;


