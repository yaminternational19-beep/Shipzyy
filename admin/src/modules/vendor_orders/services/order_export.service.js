import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportOrdersToPDF = (orders) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("Vendor Order Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text(`Total Records: ${orders.length}`, 14, 36);

    const tableColumn = [
        "Order #", "Customer", "Contact", "Product", "Qty", "Total", "Payment", "Status", "Date"
    ];

    const tableRows = [];

    orders.forEach(order => {
        const rowData = [
            order.orderNumber || "-",
            order.customerName || "-",
            order.customerPhone || "-",
            order.items[0]?.name || "-",
            order.productsCount || "-",
            new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.totalAmount || 0),
            order.paymentStatus || "Pending",
            order.status || "-",
            order.createdDate || "-"
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

    doc.save(`Orders_Report_${new Date().getTime()}.pdf`);
};

export const exportOrdersToExcel = (orders) => {
    const exportData = orders.map(order => ({
        "Order Number": order.orderNumber || "-",
        "Customer Name": order.customerName || "-",
        "Customer ID": order.customerId || "-",
        "Mobile": order.customerPhone || "-",
        "Email": order.customerEmail || "-",
        "Product": order.items[0]?.name || "-",
        "Item Qty": order.productsCount || "-",
        "Total Amount": order.totalAmount || 0,
        "Payment Method": order.paymentMethod || "-",
        "Payment Status": order.paymentStatus || "-",
        "Order Status": order.status || "-",
        "Delivery Address": order.deliveryAddress || "-",
        "Created At": order.createdDate || "-",
        "Delivered At": order.deliveredDate || "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 25 }, // Order #
        { wch: 20 }, // Customer
        { wch: 15 }, // Cust ID
        { wch: 15 }, // Mobile
        { wch: 25 }, // Email
        { wch: 30 }, // Product
        { wch: 10 }, // Qty
        { wch: 15 }, // Total
        { wch: 15 }, // Pay Method
        { wch: 15 }, // Pay Status
        { wch: 15 }, // Status
        { wch: 50 }, // Address
        { wch: 20 }, // Created
        { wch: 20 }  // Delivered
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `Orders_Export_${new Date().getTime()}.xlsx`);
};
