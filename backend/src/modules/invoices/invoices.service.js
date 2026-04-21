import db from "../../config/db.js";
import invoiceService from "../../services/invoiceService.js";
import s3Service from "../../services/s3Service.js";
import pdfService from "../../services/pdfService.js";

/**
 * Generate and save invoices for an order (Customer + Vendor Payouts)
 */
export const createInvoicesForOrder = async (orderId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Fetch Order Details with Customer and Items
        const [orderRows] = await connection.query(`
            SELECT o.*, c.name, c.email, c.mobile, ca.address_line_1, ca.address_line_2, ca.city, ca.state, ca.pincode
            FROM orders o
            JOIN customers c ON o.customer_id = c.id
            JOIN customers_addresses ca ON o.address_id = ca.id
            WHERE o.id = ?
        `, [orderId]);

        if (orderRows.length === 0) throw new Error("Order not found");
        const order = orderRows[0];

        // 2. Fetch Order Items
        const [items] = await connection.query(`
            SELECT oi.*, p.name as product_name, v.business_name as vendor_name, v.email as vendor_email, v.owner_name as vendor_owner, v.commission_percent
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN vendors v ON oi.vendor_id = v.id
            WHERE oi.order_id = ?
        `, [orderId]);

        // --- A. CUSTOMER INVOICE ---
        const customerInvoiceId = `INV-C-${Date.now()}`;
        const custInvoiceData = {
            invoiceNumber: customerInvoiceId,
            date: new Date().toLocaleDateString(),
            orderNumber: order.order_number,
            customerName: order.name,
            customerPhone: order.mobile,
            customerEmail: order.email,
            customerAddress: `${order.address_line_1}, ${order.address_line_2 || ''}, ${order.city}, ${order.state} - ${order.pincode}`,
            paymentMethod: order.payment_method,
            status: 'Paid',
            items: items.map(i => ({ name: i.product_name, qty: i.quantity, price: parseFloat(i.price), vendorName: i.vendor_name })),
            subtotal: parseFloat(order.subtotal),
            discount: parseFloat(order.discount || 0),
            deliveryCharges: parseFloat(order.delivery_charges || 0),
            totalAmount: parseFloat(order.total_amount)
        };

        const custHtml = invoiceService.generateCustomerInvoiceHTML(custInvoiceData);
        const custPdfBuffer = await pdfService.generatePDFFromHTML(custHtml);
        const custS3Path = `invoices/customers/${customerInvoiceId}.pdf`; 
        const custS3Url = await s3Service.uploadContent(custPdfBuffer, custS3Path, 'application/pdf');

        await connection.query(`
            INSERT INTO customer_invoices (invoice_id, order_id, customer_id, amount, payment_method, status, invoice_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [customerInvoiceId, orderId, order.customer_id, order.total_amount, order.payment_method, 'Paid', custS3Url]);


        // --- B. CONSOLIDATED VENDOR INVOICES ---
        // Group items by vendor
        const itemsByVendor = items.reduce((acc, item) => {
            if (!acc[item.vendor_id]) acc[item.vendor_id] = [];
            acc[item.vendor_id].push(item);
            return acc;
        }, {});

        for (const vendorId in itemsByVendor) {
            const vendorItems = itemsByVendor[vendorId];
            const firstItem = vendorItems[0];
            const vendorInvoiceId = `INV-V-${Date.now()}-${vendorId}`;

            let totalSales = 0;

            const processedItems = vendorItems.map(item => {
                const salesAmount = parseFloat(item.price) * item.quantity;
                totalSales += salesAmount;

                return {
                    productName: item.product_name,
                    qty: item.quantity,
                    productPrice: parseFloat(item.price)
                };
            });

            const vendorInvoiceData = {
                invoiceNumber: vendorInvoiceId,
                date: new Date().toLocaleDateString(),
                orderNumber: order.order_number,
                vendorName: firstItem.vendor_owner,
                vendorCompany: firstItem.vendor_name,
                vendorEmail: firstItem.vendor_email,
                customerName: order.name,
                customerAddress: `${order.address_line_1}, ${order.address_line_2 || ''}, ${order.city}, ${order.state} - ${order.pincode}`,
                customerPhone: order.mobile,
                items: processedItems,
                totalSalesAmount: totalSales,
                status: 'Paid',
                paymentMethod: order.payment_method
            };

            const vendHtml = invoiceService.generateVendorInvoiceHTML(vendorInvoiceData);
            const vendPdfBuffer = await pdfService.generatePDFFromHTML(vendHtml);
            const vendS3Path = `invoices/vendors/${vendorInvoiceId}.pdf`;
            const vendS3Url = await s3Service.uploadContent(vendPdfBuffer, vendS3Path, 'application/pdf');

            await connection.query(`
                INSERT INTO vendor_invoices (invoice_id, order_id, vendor_id, amount, payment_method, status, invoice_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [vendorInvoiceId, orderId, vendorId, totalSales, order.payment_method, 'Paid', vendS3Url]);
        }

        await connection.commit();
        console.log(`✅ Invoices generated for order ${orderId}`);
    } catch (error) {
        await connection.rollback();
        console.error(`❌ Invoice generation failed: ${error.message}`);
        throw error;
    } finally {
        connection.release();
    }
};
