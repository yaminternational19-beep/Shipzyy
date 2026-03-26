import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportVendorStaffToPDF = (vendorStaff) => {
    // Landscape mode to fit more columns
    const doc = new jsPDF("landscape");

    // Header
    doc.setFontSize(18);
    doc.text("Vendor Staff Report Export", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);

    const tableColumn = [
        "ID", "Name", "Email", "Contact No",
        "Emergency No", "Role", "Status", "State", "Country", "Pincode", "Added Date"
    ];

    const tableRows = [];

    vendorStaff.forEach(staff => {
        const staffData = [
            staff.id || "-",
            staff.name || "-",
            staff.email || "-",
            staff.contactNo || "-",
            staff.emergencyNo || "-",
            staff.role || "-",
            staff.status || "-",
            staff.state || "-",
            staff.country || "-",
            staff.pincode || "-",
            staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : "-"
        ];
        tableRows.push(staffData);
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

    doc.save(`VendorStaff_Report_${new Date().getTime()}.pdf`);
};

export const exportVendorStaffToExcel = (vendorStaff) => {
    const exportData = vendorStaff.map(staff => ({
        "ID": staff.id || "-",
        "Name": staff.name || "-",
        "Email Address": staff.email || "-",
        "Country Code": staff.countryCode || "-",
        "Mobile Number": staff.mobile || "-",
        "Merged Contact No": staff.contactNo || "-",
        "Emergency Country Code": staff.emergencyCountryCode || "-",
        "Emergency Mobile": staff.emergencyMobile || "-",
        "Merged Emergency No": staff.emergencyNo || "-",
        "Role": staff.role || "-",
        "Status": staff.status || "-",
        "Door No / Street Address": staff.address || "-",
        "State": staff.state || "-",
        "Country": staff.country || "-",
        "Pincode": staff.pincode || "-",
        "Full Built Address": staff.fullAddress || "-",
        "Profile Photo URL": staff.profilePhoto || "-",
        "Profile Photo Key": staff.profilePhotoKey || "-",
        "Permissions List": Array.isArray(staff.permissions) ? staff.permissions.join(", ") : "-",
        "Joined Date": staff.createdAt ? new Date(staff.createdAt).toLocaleString() : "-"
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Vendor_Staff_Data");

    XLSX.writeFile(workbook, `VendorStaff_Export_${new Date().getTime()}.xlsx`);
};
