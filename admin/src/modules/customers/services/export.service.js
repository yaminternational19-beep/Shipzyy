import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportCustomersToPDF = (customers) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Customers Report Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "Customer ID", "Name", "Phone", "Email", "Location", "Orders", "Completion", "Joined", "Status"
    ];

    const tableRows = [];

    customers.forEach(customer => {
        const customerData = [
            `CUST-${customer.id}`,
            customer.name || "-",
            customer.phone || "-",
            customer.email || "-",
            customer.location || "-",
            customer.orders?.toString() || "0",
            `${customer.profile_completion || 0}%`,
            customer.joined || "-",
            customer.status || "Active"
        ];
        tableRows.push(customerData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35 }
    });

    doc.save(`Customers_Report_${new Date().getTime()}.pdf`);
};

export const exportCustomersToExcel = (customers) => {
    const exportData = customers.map(customer => ({
        "Customer ID": `CUST-${customer.id}`,
        "Name": customer.name || "-",
        "Phone": customer.phone || "-",
        "Email": customer.email || "-",
        "Location": customer.location || "-",
        "Total Orders": customer.orders || 0,
        "Profile Completion (%)": customer.profile_completion || 0,
        "Status": customer.status || "Active",
        "Joined Date": customer.joined || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 15 }, // ID
        { wch: 25 }, // Name
        { wch: 20 }, // Phone
        { wch: 30 }, // Email
        { wch: 30 }, // Location
        { wch: 15 }, // Orders
        { wch: 20 }, // Completion
        { wch: 15 }, // Status
        { wch: 20 }  // Joined Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers_Data");

    XLSX.writeFile(workbook, `Customers_Export_${new Date().getTime()}.xlsx`);
};
