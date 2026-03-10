import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportCategoriesToPDF = (categories) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Categories Report Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "Category Code", "Name", "Description", "Sub-Categories", "Status", "Added Date"
    ];

    const tableRows = [];

    categories.forEach(cat => {
        const catData = [
            cat.category_code || cat.id || "-",
            cat.name || "-",
            cat.description || "-",
            cat.subCategoryCount?.toString() || "0",
            cat.status || "-",
            cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "-"
        ];
        tableRows.push(catData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35 }
    });

    doc.save(`Categories_Report_${new Date().getTime()}.pdf`);
};

export const exportCategoriesToExcel = (categories) => {
    const exportData = categories.map(cat => ({
        "Category Code": cat.category_code || cat.id || "-",
        "Name": cat.name || "-",
        "Description": cat.description || "-",
        "Icon URL": cat.icon || "-",
        "Sub-Categories Count": cat.subCategoryCount || 0,
        "Status": cat.status || "-",
        "Joined Date": cat.createdAt ? new Date(cat.createdAt).toLocaleString() : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 15 }, // ID
        { wch: 25 }, // Name
        { wch: 45 }, // Description
        { wch: 50 }, // Icon
        { wch: 25 }, // Subcat count
        { wch: 15 }, // Status
        { wch: 25 }  // Joined Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories_Data");

    XLSX.writeFile(workbook, `Categories_Export_${new Date().getTime()}.xlsx`);
};
