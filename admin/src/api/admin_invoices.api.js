import API from './axios';

export const getAdminVendorInvoicesApi = (params) => API.get('/admin-invoices/vendor-invoices', { params });
export const getVendorInvoiceHistoryApi = (vendorId, params) => API.get(`/admin-invoices/vendor-invoices/history/${vendorId}`, { params });
export const downloadVendorInvoiceApi = (id) => API.get(`/admin-invoices/vendor-invoices/${id}/download`, { responseType: 'blob' });

export const getAdminCustomerInvoicesApi = (params) => API.get('/admin-invoices/customer-invoices', { params });
export const getCustomerInvoiceHistoryApi = (customerId, params) => API.get(`/admin-invoices/customer-invoices/history/${customerId}`, { params });
export const downloadCustomerInvoiceApi = (id) => API.get(`/admin-invoices/customer-invoices/${id}/download`, { responseType: 'blob' });
