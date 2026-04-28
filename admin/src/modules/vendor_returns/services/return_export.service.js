import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportReturnsToPDF = (returns) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Vendor Returns Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Records: ${returns.length}`, 14, 36);

    const tableColumn = [
        "Return #", "Order #", "Product", "Customer", "Contact", "Qty", "Reason", "Status", "Date"
    ];

    const tableRows = [];

    returns.forEach(ret => {
        const rowData = [
            ret.return_id || "-",
            ret.order_number || "-",
            ret.product_name || "-",
            ret.customer_name || "-",
            ret.customer_phone || "-",
            ret.quantity || "-",
            ret.reason || "-",
            ret.return_status || "-",
            new Date(ret.return_requested_at).toLocaleDateString() || "-"
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

    doc.save(`Returns_Report_${new Date().getTime()}.pdf`);
};

export const exportReturnsToExcel = (returns) => {
    const exportData = returns.map(ret => ({
        "Return ID": ret.return_id || "-",
        "Order Number": ret.order_number || "-",
        "Product Name": ret.product_name || "-",
        "Customer Name": ret.customer_name || "-",
        "Contact": ret.customer_phone || "-",
        "Quantity": ret.quantity || "-",
        "Price": ret.price || "-",
        "Reason": ret.reason || "-",
        "Status": ret.return_status || "-",
        "Requested At": new Date(ret.return_requested_at).toLocaleString() || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    const columnWidths = [
        { wch: 15 }, // Return ID
        { wch: 25 }, // Order #
        { wch: 30 }, // Product
        { wch: 20 }, // Customer
        { wch: 15 }, // Contact
        { wch: 10 }, // Qty
        { wch: 15 }, // Price
        { wch: 40 }, // Reason
        { wch: 15 }, // Status
        { wch: 20 }  // Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Returns");
    XLSX.writeFile(workbook, `Returns_Export_${new Date().getTime()}.xlsx`);
};
