import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * ADMIN PRODUCT EXPORT SERVICE
 */

export const exportProductsToPDF = (products) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Admin Products Approval Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "Product ID/Slug", "Product Name", "Brand", "Vendor Business", "Vendor Name", "Category", 
        "Sub-Category", "MRP", "Sale Price", "Stock", "Approval", "Rejection Reason", "Raised Date", "Action Date"
    ];

    const tableRows = [];

    products.forEach(product => {
        const productData = [
            product.itemId || "-",
            product.name || "-",
            product.brand || "-",
            product.vendorCompanyName || "-",
            product.vendorName || "-",
            product.category || "-",
            product.subCategory || "-",
            product.MRP ? `Rs. ${product.MRP}` : "-",
            product.Sale ? `Rs. ${product.Sale}` : "-",
            product.stockQuantity || "0",
            product.isApproved ? "APPROVED" : (product.rejectionReason ? "REJECTED" : "PENDING"),
            product.rejectionReason || "-",
            product.raisedDate || "-",
            product.actionDate || "-"
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

    doc.save(`Admin_Products_Report_${new Date().getTime()}.pdf`);
};

export const exportProductsToExcel = (products) => {
    const exportData = products.map(product => ({
        "Product ID/Slug": product.itemId || "-",
        "Product Name": product.name || "-",
        "Brand": product.brand || "-",
        "Vendor Company": product.vendorCompanyName || "-",
        "Vendor Name": product.vendorName || "-",
        "Vendor Email": product.vendorEmail || "-",
        "Vendor Mobile": product.vendorPhone || "-",
        "Category": product.category || "-",
        "Sub-Category": product.subCategory || "-",
        "MRP": product.MRP || 0,
        "Sale Price": product.Sale || 0,
        "Stock": product.stockQuantity || 0,
        "Approval Status": product.isApproved ? "APPROVED" : (product.rejectionReason ? "REJECTED" : "PENDING"),
        "Rejection Reason": product.rejectionReason || "-",
        "Raised Date": product.raisedDate || "-",
        "Action Date": product.actionDate || "-",
        "Primary Image URL": product.image || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths
    const columnWidths = [
        { wch: 25 }, // ID
        { wch: 30 }, // Name
        { wch: 20 }, // Brand
        { wch: 30 }, // Vendor Company
        { wch: 25 }, // Vendor Name
        { wch: 30 }, // Email
        { wch: 20 }, // Phone
        { wch: 20 }, // Category
        { wch: 20 }, // Sub-Category
        { wch: 10 }, // MRP
        { wch: 10 }, // Sale
        { wch: 10 }, // Stock
        { wch: 15 }, // Status
        { wch: 30 }, // Reason
        { wch: 15 }, // Raised
        { wch: 15 }, // Action
        { wch: 60 }  // Image
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Products_Data");

    XLSX.writeFile(workbook, `Admin_Products_Export_${new Date().getTime()}.xlsx`);
};
