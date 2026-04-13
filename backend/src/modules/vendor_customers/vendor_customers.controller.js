import ApiResponse from "../../utils/apiResponse.js";
import service from "./vendor_customers.service.js";

const getCustomers = async (req, res) => {
    try {
        const vendorId = req.user.vendor_id;
        const result = await service.getCustomers(vendorId, req.query);
        return ApiResponse.success(res, "Customers fetched successfully", result);
    } catch (err) {
        return ApiResponse.error(res, err.message);
    }
};

const getCustomerDetails = async (req, res) => {
    try {
        const vendorId = req.user.vendor_id;
        const result = await service.getCustomerDetails(vendorId, req.params.id);
        return ApiResponse.success(res, "Customer fetched successfully", result);
    } catch (err) {
        return ApiResponse.error(res, err.message);
    }
};

export default { getCustomers, getCustomerDetails };
