/**
 * Invoice Service - Generates clean HTML templates for Customer and Vendor Invoices
 */

const getStatusBadge = (status) => {
    const colors = {
        'Paid': { bg: '#dcfce7', text: '#15803d' },
        'Pending': { bg: '#fef9c3', text: '#854d0e' },
        'Cancelled': { bg: '#fee2e2', text: '#b91c1c' },
        'Refunded': { bg: '#f1f5f9', text: '#475569' },
        'Failed': { bg: '#fef2f2', text: '#991b1b' }
    };
    const color = colors[status] || { bg: '#f1f5f9', text: '#475569' };
    return `<span style="background: ${color.bg}; color: ${color.text}; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase;">${status}</span>`;
};

const getWatermark = (status) => {
    if (status === 'Refunded' || status === 'Cancelled' || status === 'Failed') {
        return `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 80px; font-weight: 900; color: rgba(0,0,0,0.05); pointer-events: none; text-transform: uppercase;">${status}</div>`;
    }
    return '';
};

/**
 * Generate Customer Invoice HTML
 */
const generateCustomerInvoiceHTML = (data) => {
    const {
        invoiceNumber,
        date,
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        paymentMethod,
        status,
        items,
        subtotal,
        discount,
        deliveryCharges,
        totalAmount
    } = data;

    const tableRows = items.map((item, index) => `
        <tr class="item-row">
            <td>${index + 1}</td>
            <td>
                <span class="product-name">${item.name}</span>
                ${item.vendorName ? `<br><small>Sold by: ${item.vendorName}</small>` : ''}
            </td>
            <td>${item.qty}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td class="text-right">₹${(item.qty * item.price).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 40px; }
        .invoice-container { max-width: 800px; margin: auto; position: relative; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: 800; color: #4f46e5; text-transform: uppercase; }
        .invoice-title { font-size: 32px; font-weight: 700; color: #0f172a; margin: 0; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-section h3 { font-size: 14px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 12px; }
        .info-section p { margin: 4px 0; font-size: 15px; }
        
        .table-container { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f8fafc; padding: 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        td { padding: 16px 12px; font-size: 15px; border-bottom: 1px solid #f1f5f9; }
        .item-row:last-child td { border-bottom: none; }
        .product-name { font-weight: 600; color: #0f172a; }
        .text-right { text-align: right; }

        .totals-section { display: flex; justify-content: flex-end; }
        .totals-table { width: 250px; }
        .totals-table tr td { padding: 8px 0; border: none; font-size: 14px; }
        .total-bold { font-size: 18px; font-weight: 700; color: #4f46e5; border-top: 1px solid #f1f5f9 !important; padding-top: 15px !important; }

        .footer { margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    ${getWatermark(status)}
    <div class="invoice-container">
        <div class="header">
            <div>
                <div class="logo">SHIPZYY</div>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Premium Delivery Solutions</p>
            </div>
            <div class="text-right">
                <h1 class="invoice-title">INVOICE</h1>
                <p style="margin: 4px 0;"># ${invoiceNumber}</p>
                <div style="margin-top: 8px;">${getStatusBadge(status)}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-section">
                <h3>Billed To</h3>
                <p><strong>${customerName}</strong></p>
                <p>${customerAddress}</p>
                <p>${customerPhone}</p>
                <p>${customerEmail}</p>
            </div>
            <div class="info-section text-right">
                <h3>General Info</h3>
                <p>Order Date: <strong>${date}</strong></p>
                <p>Order ID: <strong>${orderNumber}</strong></p>
                <p>Payment Method: ${paymentMethod}</p>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th width="50">#</th>
                        <th>Product Details</th>
                        <th width="80">Qty</th>
                        <th width="120">Price</th>
                        <th width="120" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotal</td>
                    <td class="text-right">₹${subtotal.toFixed(2)}</td>
                </tr>
                ${discount > 0 ? `<tr><td style="color: #10b981;">Discount</td><td class="text-right" style="color: #10b981;">- ₹${discount.toFixed(2)}</td></tr>` : ''}
                <tr>
                    <td>Delivery Charges</td>
                    <td class="text-right">₹${deliveryCharges.toFixed(2)}</td>
                </tr>
                <tr>
                    <td class="total-bold">Grand Total</td>
                    <td class="total-bold text-right">₹${totalAmount.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Thank you for shopping with Shipzyy!</p>
            <p>&copy; 2026 Shipzyy Inc. | support@shipzyy.com</p>
        </div>
    </div>
</body>
</html>
    `;
};

/**
 * Generate Vendor Invoice HTML (Matches Customer Style but for specific vendor)
 */
const generateVendorInvoiceHTML = (data) => {
    const {
        invoiceNumber,
        date,
        orderNumber,
        vendorName,
        vendorCompany,
        vendorEmail,
        customerName,
        customerAddress,
        customerPhone,
        paymentMethod,
        status,
        items,
        totalSalesAmount
    } = data;

    const tableRows = items.map((item, index) => `
        <tr class="item-row">
            <td>${index + 1}</td>
            <td>
                <span class="product-name">${item.productName}</span>
            </td>
            <td>${item.qty}</td>
            <td>₹${item.productPrice.toFixed(2)}</td>
            <td class="text-right">₹${(item.qty * item.productPrice).toFixed(2)}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; line-height: 1.5; margin: 0; padding: 40px; }
        .invoice-container { max-width: 800px; margin: auto; position: relative; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
        .badge-vendor { background: #fef2f2; color: #991b1b; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 10px; display: inline-block; }
        .invoice-title { font-size: 32px; font-weight: 700; color: #0f172a; margin: 0; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
        .info-section h3 { font-size: 14px; font-weight: 600; text-transform: uppercase; color: #64748b; margin-bottom: 12px; }
        .info-section p { margin: 4px 0; font-size: 15px; }

        .table-container { margin-bottom: 40px; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background: #f8fafc; padding: 12px; font-size: 13px; font-weight: 600; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        td { padding: 16px 12px; font-size: 15px; border-bottom: 1px solid #f1f5f9; }
        .item-row:last-child td { border-bottom: none; }
        .product-name { font-weight: 600; color: #0f172a; }
        .text-right { text-align: right; }

        .totals-section { display: flex; justify-content: flex-end; }
        .totals-table { width: 250px; }
        .totals-table tr td { padding: 8px 0; border: none; font-size: 14px; }
        .total-bold { font-size: 18px; font-weight: 700; color: #0f172a; border-top: 1px solid #f1f5f9 !important; padding-top: 15px !important; }

        .footer { margin-top: 60px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
    </style>
</head>
<body>
    ${getWatermark(status)}
    <div class="invoice-container">
        <div class="header">
            <div>
                <span class="badge-vendor">VENDOR SALES REPORT</span>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Partner Transaction Invoice</p>
            </div>
            <div class="text-right">
                <h1 class="invoice-title">REPORT</h1>
                <p style="margin: 4px 0;"># ${invoiceNumber}</p>
                <div style="margin-top: 8px;">${getStatusBadge(status)}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-section">
                <h3>Vendor Details</h3>
                <p><strong>${vendorCompany}</strong></p>
                <p>${vendorName}</p>
                <p>${vendorEmail}</p>
                <p style="margin-top: 15px; color: #64748b; font-size: 12px; text-transform: uppercase;">Customer Billed</p>
                <p><strong>${customerName}</strong></p>
                <p>${customerAddress}</p>
            </div>
            <div class="info-section text-right">
                <h3>General Info</h3>
                <p>Order Date: <strong>${date}</strong></p>
                <p>Order ID: <strong>${orderNumber}</strong></p>
                <p>Payment Method: ${paymentMethod}</p>
                <p>Settlement: Platform Wallet</p>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th width="50">#</th>
                        <th>Product Details</th>
                        <th width="80">Qty</th>
                        <th width="120">Price</th>
                        <th width="120" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>

        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td class="total-bold">Total Sales Amount</td>
                    <td class="total-bold text-right">₹${totalSalesAmount.toFixed(2)}</td>
                </tr>
            </table>
        </div>

        <div class="footer">
            <p>Shipzyy Partner Program | Professional Merchant Account</p>
            <p>&copy; 2026 Admin Shipzyy Private Limited</p>
        </div>
    </div>
</body>
</html>
    `;
}

export default {
    generateCustomerInvoiceHTML,
    generateVendorInvoiceHTML
};
