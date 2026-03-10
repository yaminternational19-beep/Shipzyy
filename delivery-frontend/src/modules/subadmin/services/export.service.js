import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportSubAdminsToPDF = (subAdmins) => {
    // Landscape mode to fit more columns
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Sub-Admins Report Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "ID", "Name", "Email", "Contact No",
        "Emergency No", "Role", "Status", "State", "Country", "Pincode", "Added Date"
    ];

    const tableRows = [];

    subAdmins.forEach(admin => {
        const adminData = [
            admin.id || "-",
            admin.name || "-",
            admin.email || "-",
            admin.contactNo || "-",
            admin.emergencyNo || "-",
            admin.role || "-",
            admin.status || "-",
            admin.state || "-",
            admin.country || "-",
            admin.pincode || "-",
            admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "-"
        ];
        tableRows.push(adminData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 35 }
    });

    doc.save(`SubAdmins_Report_${new Date().getTime()}.pdf`);
};

export const exportSubAdminsToExcel = (subAdmins) => {
    const exportData = subAdmins.map(admin => ({
        "ID": admin.id || "-",
        "Name": admin.name || "-",
        "Email Address": admin.email || "-",
        "Country Code": admin.countryCode || "-",
        "Mobile Number": admin.mobile || "-",
        "Merged Contact No": admin.contactNo || "-",
        "Emergency Country Code": admin.emergencyCountryCode || "-",
        "Emergency Mobile": admin.emergencyMobile || "-",
        "Merged Emergency No": admin.emergencyNo || "-",
        "Role": admin.role || "-",
        "Status": admin.status || "-",
        "Door No / Street Address": admin.address || "-",
        "State": admin.state || "-",
        "Country": admin.country || "-",
        "Pincode": admin.pincode || "-",
        "Full Built Address": admin.fullAddress || "-",
        "Profile Photo URL": admin.profilePhoto || "-",
        "Profile Photo Key": admin.profilePhotoKey || "-",
        "Permissions List": Array.isArray(admin.permissions) ? admin.permissions.join(", ") : "-",
        "Joined Date": admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "-"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    // Adjust column widths 
    const columnWidths = [
        { wch: 8 },  // ID
        { wch: 20 }, // Name
        { wch: 30 }, // Email
        { wch: 15 }, // CC
        { wch: 15 }, // Mob
        { wch: 20 }, // M Contact
        { wch: 25 }, // EC
        { wch: 20 }, // EMob
        { wch: 25 }, // MEmergency
        { wch: 15 }, // Role
        { wch: 12 }, // Status
        { wch: 30 }, // Street
        { wch: 15 }, // State
        { wch: 15 }, // Country
        { wch: 12 }, // Pin
        { wch: 45 }, // Full
        { wch: 50 }, // Photo
        { wch: 30 }, // Key
        { wch: 40 }, // Perms
        { wch: 20 }  // Joined
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Sub_Admins_Data");

    XLSX.writeFile(workbook, `SubAdmins_Export_${new Date().getTime()}.xlsx`);
};
