import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export vendor summaries to Excel
 */
export const exportVendorSummariesToExcel = (vendors) => {
    const data = vendors.map(v => ({
        'Vendor ID': v.vendorId,
        'Business Name': v.vendorName,
        'Owner Name': v.vendorOwnerName,
        'Email': v.vendorEmail,
        'Phone': v.vendorPhone,
        'Total Invoices': v.totalInvoices,
        'Total Amount': v.totalAmount,
        'Pending Amount': v.pendingAmount,
        'Last Invoice': v.lastInvoiceDate ? new Date(v.lastInvoiceDate).toLocaleDateString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor Invoices');
    XLSX.writeFile(workbook, `Vendor_Invoices_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export vendor summaries to PDF
 */
export const exportVendorSummariesToPDF = (vendors) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text('Vendor Invoice Summary', 14, 15);

    const tableData = vendors.map(v => [
        v.vendorId,
        v.vendorName,
        v.vendorOwnerName,
        v.vendorPhone,
        v.totalInvoices,
        `INR ${v.totalAmount.toLocaleString()}`,
        `INR ${v.pendingAmount.toLocaleString()}`,
        v.lastInvoiceDate ? new Date(v.lastInvoiceDate).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
        startY: 20,
        head: [['ID', 'Business', 'Owner', 'Phone', 'Count', 'Total', 'Pending', 'Last Date']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Vendor_Invoices_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export individual vendor history to Excel
 */
export const exportVendorHistoryToExcel = (invoices, vendorId) => {
    const data = invoices.map(i => ({
        'Invoice ID': i.id,
        'Order ID': i.orderId,
        'Amount': i.amount,
        'Items': i.itemCount,
        'Method': i.paymentMethod,
        'Date': i.date ? new Date(i.date).toLocaleDateString() : 'N/A',
        'Status': i.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice History');
    XLSX.writeFile(workbook, `Vendor_${vendorId}_History_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export individual vendor history to PDF
 */
export const exportVendorHistoryToPDF = (invoices, vendorId) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.text(`Invoice History - ${vendorId}`, 14, 15);

    const tableData = invoices.map(i => [
        i.id,
        i.orderId,
        `INR ${i.amount.toLocaleString()}`,
        i.paymentMethod,
        i.date ? new Date(i.date).toLocaleDateString() : 'N/A',
        i.status
    ]);

    autoTable(doc, {
        startY: 20,
        head: [['Invoice ID', 'Order ID', 'Amount', 'Method', 'Date', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Vendor_${vendorId}_History_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export customer summaries to Excel
 */
export const exportCustomerSummariesToExcel = (customers) => {
    const data = customers.map(c => ({
        'Customer ID': c.customerId,
        'Name': c.customerName,
        'Email': c.customerEmail,
        'Phone': c.customerPhone,
        'Total Invoices': c.totalInvoices,
        'Total Amount': c.totalAmount,
        'Pending Amount': c.pendingAmount,
        'Last Invoice': c.lastInvoiceDate ? new Date(c.lastInvoiceDate).toLocaleDateString() : 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Invoices');
    XLSX.writeFile(workbook, `Customer_Invoices_Summary_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export customer summaries to PDF
 */
export const exportCustomerSummariesToPDF = (customers) => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text('Customer Invoice Summary', 14, 15);

    const tableData = customers.map(c => [
        c.customerId,
        c.customerName,
        c.customerEmail,
        c.customerPhone,
        c.totalInvoices,
        `INR ${c.totalAmount.toLocaleString()}`,
        `INR ${c.pendingAmount.toLocaleString()}`,
        c.lastInvoiceDate ? new Date(c.lastInvoiceDate).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
        startY: 20,
        head: [['ID', 'Name', 'Email', 'Phone', 'Count', 'Total', 'Pending', 'Last Date']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Customer_Invoices_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Export individual customer history to Excel
 */
export const exportCustomerHistoryToExcel = (invoices, customerId) => {
    const data = invoices.map(i => ({
        'Invoice ID': i.id,
        'Order ID': i.orderId,
        'Amount': i.amount,
        'Items': i.itemCount,
        'Method': i.paymentMethod,
        'Date': i.date ? new Date(i.date).toLocaleDateString() : 'N/A',
        'Status': i.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoice History');
    XLSX.writeFile(workbook, `Customer_${customerId}_History_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export individual customer history to PDF
 */
export const exportCustomerHistoryToPDF = (invoices, customerId) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.text(`Invoice History - ${customerId}`, 14, 15);

    const tableData = invoices.map(i => [
        i.id,
        i.orderId,
        `INR ${i.amount.toLocaleString()}`,
        i.paymentMethod,
        i.date ? new Date(i.date).toLocaleDateString() : 'N/A',
        i.status
    ]);

    autoTable(doc, {
        startY: 20,
        head: [['Invoice ID', 'Order ID', 'Amount', 'Method', 'Date', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Customer_${customerId}_History_${new Date().toISOString().split('T')[0]}.pdf`);
};
