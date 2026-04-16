import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportReviewsToPDF = (reviews) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Product Reviews Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Records: ${reviews.length}`, 14, 36);

    const tableColumn = [
        "Order #", "Product", "Customer", "Rating", "Review", "Date"
    ];

    const tableRows = [];

    reviews.forEach(review => {
        const rowData = [
            review.order_number || "-",
            review.product_name || "-",
            review.customer_name || "-",
            `${review.rating} Stars`,
            review.review || "-",
            review.created_at || "-"
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

    doc.save(`Reviews_Report_${new Date().getTime()}.pdf`);
};

export const exportReviewsToExcel = (reviews) => {
    const exportData = reviews.map(review => ({
        "Order Number": review.order_number || "-",
        "Product Name": review.product_name || "-",
        "Product ID": review.product_id || "-",
        "Customer Name": review.customer_name || "-",
        "Customer ID": review.customer_id || "-",
        "Rating": review.rating || 0,
        "Review Text": review.review || "-",
        "Date": review.created_at || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 25 }, // Order #
        { wch: 30 }, // Product
        { wch: 15 }, // Product ID
        { wch: 20 }, // Customer
        { wch: 15 }, // Cust ID
        { wch: 10 }, // Rating
        { wch: 50 }, // Review
        { wch: 20 }  // Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reviews");
    XLSX.writeFile(workbook, `Reviews_Export_${new Date().getTime()}.xlsx`);
};
