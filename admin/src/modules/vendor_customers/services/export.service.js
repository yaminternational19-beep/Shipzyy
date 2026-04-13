import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportCustomersToPDF = (customers) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Vendor Customers Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "Customer ID", "Name", "Phone", "Email", "Orders (Yours)", "Spent (Yours)", "Status", "Joined"
    ];

    const tableRows = [];

    customers.forEach(customer => {
        const customerData = [
            `CUST-${customer.id}`,
            customer.name || "-",
            customer.phone || "-",
            customer.email || "-",
            customer.orders?.toString() || "0",
            `INR ${customer.total_spent ? customer.total_spent.toFixed(2) : "0.00"}`,
            customer.status ? customer.status.toUpperCase() : "ACTIVE",
            new Date(customer.created_at).toLocaleDateString('en-GB')
        ];
        tableRows.push(customerData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // specific vendor green tint
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35 }
    });

    doc.save(`Vendor_Customers_${new Date().getTime()}.pdf`);
};

export const exportCustomersToExcel = (customers) => {
    const exportData = customers.map(customer => ({
        "Customer ID": `CUST-${customer.id}`,
        "Name": customer.name || "-",
        "Phone": customer.phone || "-",
        "Email": customer.email || "-",
        "Total Orders (Yours)": customer.orders || 0,
        "Total Spent (Yours, INR)": customer.total_spent || 0,
        "Status": customer.status ? customer.status.toUpperCase() : "ACTIVE",
        "Joined Date": new Date(customer.created_at).toLocaleDateString('en-GB')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 15 }, // ID
        { wch: 25 }, // Name
        { wch: 20 }, // Phone
        { wch: 30 }, // Email
        { wch: 22 }, // Orders
        { wch: 25 }, // Spent
        { wch: 15 }, // Status
        { wch: 20 }  // Joined Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor_Customers");

    XLSX.writeFile(workbook, `Vendor_Customers_${new Date().getTime()}.xlsx`);
};
