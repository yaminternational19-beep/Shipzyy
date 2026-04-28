import api from "./axios";

export const getVendorReturnsApi = (params) =>
    api.get("/vendor/returns", { params }).then(res => res.data);

export const updateVendorReturnStatusApi = (returnId, status, vendorNotes) =>
    api.patch(`/vendor/returns/${returnId}/status`, { status, vendor_notes: vendorNotes }).then(res => res.data);
