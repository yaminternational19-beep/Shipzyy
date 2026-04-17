import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportReviewsToPDF = (reviews) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Global Product Reviews Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Records: ${reviews.length}`, 14, 36);

    const tableColumn = [
        "Order #", "Vendor", "Product", "Customer", "Rating", "Review", "Date"
    ];

    const tableRows = [];

    reviews.forEach(review => {
        const rowData = [
            review.order_number || "-",
            review.vendor_name || "-",
            review.product_name || "-",
            review.customer_name || "-",
            `${review.rating} Stars`,
            review.review || "-",
            review.created_at || review.createdDate || "-"
        ];
        tableRows.push(rowData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 42,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, halign: 'center' },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { top: 40 }
    });

    doc.save(`Global_Reviews_Report_${new Date().getTime()}.pdf`);
};

export const exportReviewsToExcel = (reviews) => {
    const exportData = reviews.map(review => ({
        "Order Number": review.order_number || "-",
        "Vendor Name": review.vendor_name || "-",
        "Vendor Phone": review.vendor_phone || "-",
        "Vendor Email": review.vendor_email || "-",
        "Product Name": review.product_name || "-",
        "Product ID": review.product_id || "-",
        "Customer Name": review.customer_name || "-",
        "Customer Phone": review.customer_phone || "-",
        "Customer ID": review.customer_id || "-",
        "Rating": review.rating || 0,
        "Review Text": review.review || "-",
        "Date": review.created_at || review.createdDate || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 15 }, // Order #
        { wch: 25 }, // Vendor Name
        { wch: 15 }, // Vendor Phone
        { wch: 25 }, // Vendor Email
        { wch: 30 }, // Product Name
        { wch: 15 }, // Product ID
        { wch: 20 }, // Customer Name
        { wch: 15 }, // Customer Phone
        { wch: 15 }, // Cust ID
        { wch: 10 }, // Rating
        { wch: 50 }, // Review Text
        { wch: 20 }  // Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Global Reviews");
    XLSX.writeFile(workbook, `Global_Reviews_Export_${new Date().getTime()}.xlsx`);
};
