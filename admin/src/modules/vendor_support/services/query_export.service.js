import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportQueriesToPDF = (queries) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Vendor Support Queries", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Records: ${queries.length}`, 14, 36);

    const tableColumn = [
        "Ticket ID", "User Name", "Type", "Contact", "Recipient", "Subject", "Status", "Date"
    ];

    const tableRows = [];

    queries.forEach(q => {
        const rowData = [
            q.support_ticket_id || "-",
            q.userName || "-",
            q.userType || "-",
            q.userPhone || "-",
            q.recipientName || "-",
            q.subject || "-",
            q.status || "-",
            q.created_at?.date || "-"
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

    doc.save(`Support_Queries_${new Date().getTime()}.pdf`);
};

export const exportQueriesToExcel = (queries) => {
    const exportData = queries.map(q => ({
        "Ticket ID": q.support_ticket_id || "-",
        "User Name": q.userName || "-",
        "User Type": q.userType || "-",
        "User Phone": q.userPhone || "-",
        "User Email": q.userEmail || "-",
        "Recipient": q.recipientName || "-",
        "Recipient Phone": q.recipientPhone || "-",
        "Recipient Email": q.recipientEmail || "-",
        "Subject": q.subject || "-",
        "Message": q.message || "-",
        "Status": q.status || "-",
        "Date": q.created_at?.date || "-",
        "Time": q.created_at?.time || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    const columnWidths = [
        { wch: 20 }, // Ticket ID
        { wch: 25 }, // User Name
        { wch: 15 }, // Type
        { wch: 20 }, // Phone
        { wch: 25 }, // Email
        { wch: 20 }, // Recipient
        { wch: 20 }, // Recipient Phone
        { wch: 25 }, // Recipient Email
        { wch: 30 }, // Subject
        { wch: 50 }, // Message
        { wch: 10 }, // Status
        { wch: 15 }, // Date
        { wch: 10 }  // Time
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Queries");
    XLSX.writeFile(workbook, `Support_Queries_Export_${new Date().getTime()}.xlsx`);
};
