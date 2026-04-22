import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Exports vendor dashboard data to a comprehensive PDF report
 */
export const exportDashboardToPDF = (data) => {
    const { stats, revenueAnalytics, recentOrders, topProducts, inventoryAlerts, period } = data;
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFillColor(99, 102, 241); // Indigo color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Shipzyy Vendor Analytics Report", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report Period: ${period.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 15, 30);

    let currentY = 50;

    // --- Stats Summary Section ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Business Performance Summary", 15, currentY);
    currentY += 10;

    const statsTable = [
        ["Metric Group", "Value 1", "Value 2"],
        ["Financials", `Weekly: ₹${parseFloat(stats.revenue?.weekly || 0).toLocaleString()}`, `Monthly: ₹${parseFloat(stats.revenue?.monthly || 0).toLocaleString()}`],
        ["Sales & Orders", `Total Orders: ${stats.orders?.total || 0}`, `Pending: ${stats.orders?.pending || 0}`],
        ["Catalog & Staff", `Total Products: ${stats.products?.total || 0}`, `Active Staff: ${stats.staff?.active || 0}`],
        ["Engagement", `Avg Rating: ${stats.reviews?.avg || 0}`, `Total Reviews: ${stats.reviews?.total || 0}`]
    ];

    autoTable(doc, {
        body: statsTable.slice(1),
        head: [statsTable[0]],
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // --- Revenue & Activity Analytics ---
    doc.setFontSize(14);
    doc.text("Revenue & Activity Analytics", 15, currentY);
    currentY += 10;

    const analyticsTable = revenueAnalytics.map(row => [
        row.day,
        `₹${parseFloat(row.revenue || 0).toLocaleString()}`,
        row.orders || 0,
        row.products || 0
    ]);

    autoTable(doc, {
        head: [["Period", "Revenue", "Order Volume", "Unique Products"]],
        body: analyticsTable,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // Green
        styles: { fontSize: 8 }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // --- Recent Orders & Top Products (Side by Side in next page if needed) ---
    if (currentY > 220) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(14);
    doc.text("Recent Transactions", 15, currentY);
    currentY += 10;

    const ordersTable = recentOrders.map(ord => [
        ord.id,
        ord.time,
        ord.amt,
        ord.label
    ]);

    autoTable(doc, {
        head: [["Order ID", "Date/Time", "Amount", "Status"]],
        body: ordersTable,
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] }, // Amber
        styles: { fontSize: 8 }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // --- Inventory Alerts ---
    if (currentY > 240) {
        doc.addPage();
        currentY = 20;
    }

    doc.setFontSize(14);
    doc.text("Critical Inventory Alerts", 15, currentY);
    currentY += 10;

    const alertsTable = inventoryAlerts.map(item => [
        item.name,
        item.stock,
        item.unit
    ]);

    autoTable(doc, {
        head: [["Product Name", "Stock Level", "Status"]],
        body: alertsTable,
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [220, 38, 38] }, // Red
        styles: { fontSize: 9 }
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Shipzyy Vendor Admin - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    doc.save(`Vendor_Analytics_Report_${new Date().getTime()}.pdf`);
};
