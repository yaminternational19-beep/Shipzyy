import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportTicketsToPDF = (tickets) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Support Tickets Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Records: ${tickets.length}`, 14, 36);

    const tableColumn = [
        "Ticket ID", "User Name", "Type", "Contact", "Recipient", "Subject", "Status", "Date"
    ];

    const tableRows = [];

    tickets.forEach(t => {
        const rowData = [
            t.support_ticket_id || "-",
            t.userName || "-",
            t.userType || "-",
            t.userPhone || "-",
            t.recipientName || "-",
            t.subject || "-",
            t.status || "-",
            t.created_at?.date || "-"
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

    doc.save(`Support_Tickets_${new Date().getTime()}.pdf`);
};

export const exportTicketsToExcel = (tickets) => {
    const exportData = tickets.map(t => ({
        "Ticket ID": t.support_ticket_id || "-",
        "User Name": t.userName || "-",
        "User Type": t.userType || "-",
        "User Phone": t.userPhone || "-",
        "User Email": t.userEmail || "-",
        "Recipient": t.recipientName || "-",
        "Recipient Phone": t.recipientPhone || "-",
        "Recipient Email": t.recipientEmail || "-",
        "Subject": t.subject || "-",
        "Message": t.message || "-",
        "Status": t.status || "-",
        "Date": t.created_at?.date || "-",
        "Time": t.created_at?.time || "-"
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, `Support_Tickets_Export_${new Date().getTime()}.xlsx`);
};
