import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Exports user profile data to a PDF report
 */
export const exportProfileToPDF = (userData, modules) => {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("User Profile Report", 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 30);
    doc.text(`System: Shipzyy Admin Portal`, 15, 35);

    let currentY = 55;

    // --- Profile Summary Section ---
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Account Information", 15, currentY);
    currentY += 10;

    const basicInfoTable = [
        ["Field", "Details"],
        ["Full Name", userData.fullName || "-"],
        ["Email Address", userData.email || "-"],
        ["Contact Number", `${userData.countryCode || ''} ${userData.mobile || ''}`],
        ["Emergency Contact", `${userData.emergencyCountryCode || ''} ${userData.emergencyContact || ''}`],
        ["Location", userData.location || "-"],
        ["Postal Code", userData.postalCode || "-"],
        ["Role", (userData.role || '').replace('_', ' ') || "-"],
        ["Account Status", userData.status || "-"]
    ];

    autoTable(doc, {
        body: basicInfoTable.slice(1),
        head: [basicInfoTable[0]],
        startY: currentY,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { fontStyle: 'bold', width: 50 }
        }
    });

    currentY = doc.lastAutoTable.finalY + 15;

    // --- Permissions Section ---
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("System Permissions & Access", 15, currentY);
    currentY += 10;

    const activeModules = modules.filter(m => {
        if (userData.role === 'SUPER_ADMIN' || userData.role === 'VENDOR_OWNER') return true;
        return (userData.permissions || []).map(p => String(p).toLowerCase()).includes(m.id.toLowerCase());
    });

    const permissionsTable = activeModules.length > 0 ? activeModules.map(m => [m.name, m.desc]) : [["No Permissions Found", "-"]];

    autoTable(doc, {
        head: [["Module Name", "Permission Scope"]],
        body: permissionsTable,
        startY: currentY,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }, // Emerald-600
        styles: { fontSize: 9, cellPadding: 4 }
    });

    // --- Footer ---
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Shipzyy Security - Confidential Report - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    }

    const reportName = (userData.fullName || 'User').replace(/[^a-z0-9]/gi, '_');
    doc.save(`Profile_Report_${reportName}_${new Date().getTime()}.pdf`);
};

/**
 * Exports user profile data to an Excel spreadsheet
 */
export const exportProfileToExcel = (userData, modules) => {
    try {
        const safeName = (userData.fullName || 'User').replace(/[^a-z0-9]/gi, '_');
        
        // 1. Prepare Basic Info Sheet
        const basicInfo = [
            { Field: "Full Name", Details: userData.fullName || "-" },
            { Field: "Email Address", Details: userData.email || "-" },
            { Field: "Contact Number", Details: `${userData.countryCode || ''} ${userData.mobile || ''}`.trim() || "-" },
            { Field: "Emergency Contact", Details: `${userData.emergencyCountryCode || ''} ${userData.emergencyContact || ''}`.trim() || "-" },
            { Field: "Location", Details: userData.location || "-" },
            { Field: "Postal Code", Details: userData.postalCode || "-" },
            { Field: "Role", Details: (userData.role || '').replace('_', ' ') || "-" },
            { Field: "Account Status", Details: userData.status || "-" },
            { Field: "Last Updated", Details: new Date().toLocaleString() }
        ];

        // 2. Prepare Permissions Sheet
        const activeModules = (modules || []).filter(m => {
            if (userData.role === 'SUPER_ADMIN' || userData.role === 'VENDOR_OWNER') return true;
            return (userData.permissions || []).map(p => String(p).toLowerCase()).includes(m.id.toLowerCase());
        });

        const permissionsData = activeModules.length > 0 ? activeModules.map(m => ({
            "Module Name": m.name || "-",
            "Description": m.desc || "-",
            "Access Level": "Enabled"
        })) : [{ "Module Name": "No Permissions Found", "Description": "-", "Access Level": "-" }];

        const workbook = XLSX.utils.book_new();
        
        const basicWorksheet = XLSX.utils.json_to_sheet(basicInfo);
        basicWorksheet["!cols"] = [{ wch: 25 }, { wch: 40 }];
        XLSX.utils.book_append_sheet(workbook, basicWorksheet, "Basic Info");

        const permissionsWorksheet = XLSX.utils.json_to_sheet(permissionsData);
        permissionsWorksheet["!cols"] = [{ wch: 30 }, { wch: 50 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(workbook, permissionsWorksheet, "Permissions");

        // Use a more standard write approach
        XLSX.writeFile(workbook, `Profile_Data_${safeName}_${new Date().getTime()}.xlsx`);
    } catch (error) {
        console.error("Excel Export Error:", error);
    }
};
