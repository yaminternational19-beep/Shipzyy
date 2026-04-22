import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Export selected invoices to PDF as a table report
 */
export const exportInvoicesToPDF = (invoices) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Vendor Invoices Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "Invoice ID", "Order ID", "Customer", "Phone", "Amount", "Method", "Date", "Status"
    ];

    const tableRows = [];

    invoices.forEach(inv => {
        const invData = [
            inv.id,
            inv.orderId,
            inv.customerId,
            inv.customerPhone,
            `INR ${inv.amount?.toFixed(2)}`,
            inv.paymentMethod,
            inv.date,
            inv.status.toUpperCase()
        ];
        tableRows.push(invData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35 }
    });

    doc.save(`Vendor_Invoices_${new Date().getTime()}.pdf`);
};

/**
 * Export selected invoices to Excel
 */
export const exportInvoicesToExcel = (invoices) => {
    const exportData = invoices.map(inv => ({
        "Invoice ID": inv.id,
        "Order ID": inv.orderId,
        "Customer ID": inv.customerId,
        "Phone": inv.customerPhone,
        "Amount (INR)": inv.amount,
        "Items": inv.itemCount,
        "Payment Method": inv.paymentMethod,
        "Date": inv.date,
        "Status": inv.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 25 }, // Invoice ID
        { wch: 25 }, // Order ID
        { wch: 15 }, // Customer
        { wch: 20 }, // Phone
        { wch: 15 }, // Amount
        { wch: 10 }, // Items
        { wch: 15 }, // Method
        { wch: 15 }, // Date
        { wch: 12 }  // Status
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor_Invoices");
    XLSX.writeFile(workbook, `Vendor_Invoices_${new Date().getTime()}.xlsx`);
};

/**
 * Triggered for "PDF Zip" - Since we are following the vendor_customers pattern, 
 * we provide a robust PDF report. If actual PDF zipping is needed, jszip would be required.
 */
export const exportInvoicesToZip = (invoices) => {
    // For now, since the user pattern doesn't have zip yet, 
    // we use the PDF report but with a special name or single combined file.
    // Proposing to use exportInvoicesToPDF for now or implementing combined files.
    exportInvoicesToPDF(invoices);
};
