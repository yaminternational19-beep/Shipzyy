const productFields = {

    /* =========================
       1️⃣ BASIC INFORMATION
    ========================== */
    basicInfo: [

        {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: []
        },

        {
            name: "subCategory",
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
            name: "brand",
            label: "Brand Name",
            type: "select",
            options: []
        },

        {
            name: "customBrand",
            label: "Custom Brand Name",
            type: "text",
            condition: { field: "brand", value: "Other" },
            placeholder: "Enter new brand name"
        },

        {
            name: "sku",
            label: "SKU (Internal Code)",
            type: "text",
            placeholder: "e.g. SKU-882910"
        },

        {
            name: "specification",
            label: "Brief Specification",
            type: "textarea",
            required: true,
            placeholder: "Key highlights (one per line)..."
        },
    ],

    /* =========================
       2️⃣ PRICING
    ========================== */
    pricing: [
        {
            name: "price",
            label: "MRP (Base Price)",
            type: "number",
            required: true,
            placeholder: "0.00"
        },


        // {
        //     name: "discountType",
        //     label: "Discount Type",
        //     type: "select",
        //     options: ["None", "Percentage", "Flat"]
        // },

        {
            name: "discountValue",
            label: "Discount Value",
            type: "number",
            placeholder: "0"
        },

        {
            name: "salePrice",
            label: "Selling Price",
            type: "number",
            autoCalculate: true,
            placeholder: "0.00"
        },

        // {
        //   name: "gst",
        //   label: "GST (%)",
        //   type: "number",
        //   placeholder: "e.g. 18"
        // },

    ],

    /* =========================
       3️⃣ INVENTORY
    ========================== */
    inventory: [
        {
            name: "stock",
            label: "Current Stock",
            type: "number",
            required: true,
            placeholder: "0"
        },

        {
            name: "minOrder",
            label: "Minimum Order Requirement",
            type: "number",
            required: true,
            placeholder: "1"
        },

        {
            name: "minStock",
            label: "Low Stock Alert",
            type: "number",
            placeholder: "10"
        }
    ],

    /* =========================
       4️⃣ QUANTITY
    ========================== */
    //   quantity: [
    //     {
    //       name: "quantityValue",
    //       label: "Quantity Value",
    //       type: "number",
    //       placeholder: "e.g. 500"
    //     },
    //     {
    //       name: "unit",
    //       label: "Unit",
    //       type: "select",
    //       options: ["kg", "gram", "liter", "ml", "piece", "box", "packet"]
    //     }
    //   ],

    /* =========================
       7️⃣ SPECIFICATIONS
    ========================== */
    specifications: [

        {
            name: "unit",
            label: "Unit",
            type: "select",
            options: ["kg", "gram", "liter", "ml", "piece", "box", "packet"]
        },
        {
            name: "size",
            label: "Available Sizes",
            type: "text",
            placeholder: "Small, Medium, XL"
        },

        {
            name: "colors",
            label: "Available Colors",
            type: "text",
            placeholder: "Blue, Charcoal, White"
        },

        {
            name: "specification",
            label: "Brief Specification",
            type: "textarea",
            placeholder: "Key highlights (one per line)..."
        },

    ],

    /* =========================
       5️⃣ MANUFACTURING DETAILS
    ========================== */
    manufacturing: [
        {
            name: "manufactureDate",
            label: "Manufacturing Date",
            type: "date"
        },
        {
            name: "expiryDate",
            label: "Expiry Date",
            type: "date"
        },
        {
            name: "countryOfOrigin",
            label: "Country of Origin",
            type: "text",
            placeholder: "e.g. India"
        }
    ],

    /* =========================
       6️⃣ RETURN POLICY
    ========================== */
    returnPolicy: [
        {
            name: "returnAllowed",
            label: "Return Applicable",
            type: "checkbox"
        },
        {
            name: "returnDays",
            label: "Return Days",
            type: "number",
            condition: { field: "returnAllowed", value: true },
            placeholder: "e.g. 7"
        }
    ],



    /* =========================
       8️⃣ VISIBILITY & STATUS
    ========================== */
    //   visibility: [


    //     {
    //       name: "isFeatured",
    //       label: "Mark as Featured Product",
    //       type: "checkbox"
    //     },
    //   ],

    /* =========================
       9️⃣ SEO
    ========================== */
    //   seo: [
    //     {
    //       name: "metaTitle",
    //       label: "Meta Title",
    //       type: "text"
    //     },
    //     {
    //       name: "metaDescription",
    //       label: "Meta Description",
    //       type: "textarea"
    //     },
    //     {
    //       name: "slug",
    //       label: "Product Slug",
    //       type: "text"
    //     }
    //   ]
};

export default productFields;
