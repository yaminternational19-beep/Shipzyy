import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * VENDOR PRODUCT EXPORT SERVICE
 */

export const exportVendorProductsToPDF = (products) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Vendor Products Inventory Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "Product ID/Slug", "Product Name", "Category", "Sub-Category", "Brand", 
        "MRP", "Sale Price", "Discount", "Stock", "Status", "Approval", "Rejection Reason", "MFG/EXP Date"
    ];

    const tableRows = [];

    products.forEach(product => {
        const productData = [
            product.itemId || "-",
            product.name || "-",
            product.category || "-",
            product.subCategory || "-",
            product.brand || "-",
            product.MRP ? `Rs. ${product.MRP}` : "-",
            product.salePrice ? `Rs. ${product.salePrice}` : "-",
            product.discountValue ? `${product.discountValue} ${product.discountType === 'Percent' ? '%' : 'Fix'}` : "-",
            product.stock || "0",
            product.isActive ? "LIVE" : "HIDDEN",
            product.isApproved ? "APPROVED" : (product.rejectionReason ? "REJECTED" : "PENDING"),
            product.rejectionReason || "-",
            `${product.manufactureDate || '--'} / ${product.expiryDate || '--'}`
        ];
        tableRows.push(productData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35, horizontal: 10 }
    });

    doc.save(`Vendor_Products_Report_${new Date().getTime()}.pdf`);
};

export const exportVendorProductsToExcel = (products) => {
    const exportData = products.map(product => ({
        "Product ID/Slug": product.itemId || "-",
        "Product Name": product.name || "-",
        "Category": product.category || "-",
        "Sub-Category": product.subCategory || "-",
        "Brand": product.brand || "-",
        "MRP": product.MRP || 0,
        "Sale Price": product.salePrice || 0,
        "Discount Value": product.discountValue || 0,
        "Discount Type": product.discountType || "-",
        "Stock": product.stock || 0,
        "Live Status": product.isActive ? "LIVE" : "HIDDEN",
        "Approval Status": product.isApproved ? "APPROVED" : (product.rejectionReason ? "REJECTED" : "PENDING"),
        "Rejection Reason": product.rejectionReason || "-",
        "Manufacture Date": product.manufactureDate || "-",
        "Expiry Date": product.expiryDate || "-",
        "Return Allowed": product.returnAllowed ? "YES" : "NO",
        "Return Days": product.returnDays || 0,
        "Primary Image URL": product.image || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths
    const columnWidths = [
        { wch: 25 }, // ID
        { wch: 30 }, // Name
        { wch: 20 }, // Category
        { wch: 20 }, // Sub-Category
        { wch: 20 }, // Brand
        { wch: 10 }, // MRP
        { wch: 10 }, // Sale
        { wch: 15 }, // Discount
        { wch: 15 }, // Disc Type
        { wch: 10 }, // Stock
        { wch: 15 }, // Live
        { wch: 15 }, // Approval
        { wch: 30 }, // Reason
        { wch: 15 }, // MFG
        { wch: 15 }, // EXP
        { wch: 10 }, // Return
        { wch: 10 }, // Return Days
        { wch: 60 }  // Image
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor_Inventory");

    XLSX.writeFile(workbook, `Vendor_Products_Export_${new Date().getTime()}.xlsx`);
};
