import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportSubCategoriesToPDF = (subcategories, parentCategories) => {
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Sub-Categories Report Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "SubCategory ID", "Name", "Category", "Description", "Status", "Added Date"
    ];

    const tableRows = [];

    const getCategoryName = (id) => {
        const cat = parentCategories?.find(c => c.id === id);
        return cat ? cat.name : id;
    };

    subcategories.forEach(sub => {
        const rowData = [
            sub.id || "-",
            sub.name || "-",
            getCategoryName(sub.categoryId) || "-",
            sub.description || "-",
            sub.status || "-",
            sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "-"
        ];
        tableRows.push(rowData);
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

    doc.save(`SubCategories_Report_${new Date().getTime()}.pdf`);
};

export const exportSubCategoriesToExcel = (subcategories, parentCategories) => {
    const getCategoryName = (id) => {
        const cat = parentCategories?.find(c => c.id === id);
        return cat ? cat.name : id;
    };

    const exportData = subcategories.map(sub => ({
        "SubCategory ID": sub.id || "-",
        "Name": sub.name || "-",
        "Parent Category": getCategoryName(sub.categoryId) || "-",
        "Category ID": sub.categoryId || "-",
        "Description": sub.description || "-",
        "Icon URL": sub.icon || "-",
        "Status": sub.status || "-",
        "Joined Date": sub.createdAt ? new Date(sub.createdAt).toLocaleString() : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 18 }, // ID
        { wch: 25 }, // Name
        { wch: 25 }, // Parent Cat Name
        { wch: 15 }, // Parent Cat ID
        { wch: 45 }, // Description
        { wch: 50 }, // Icon
        { wch: 15 }, // Status
        { wch: 25 }  // Joined Date
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "SubCategories_Data");

    XLSX.writeFile(workbook, `SubCategories_Export_${new Date().getTime()}.xlsx`);
};
