import ApiResponse from "../../utils/apiResponse.js";
import service from "./admin_orders.service.js";

const getOrders = async (req, res) => {
    try {
        const result = await service.getOrders(req.query);
        return ApiResponse.success(res, "Orders fetched successfully", result);
    } catch (err) {
        return ApiResponse.error(res, err.message);
    }
};

const getOrderById = async (req, res) => {
    try {
        const result = await service.getOrderById(req.params.id);
        return ApiResponse.success(res, "Order fetched successfully", result);
    } catch (err) {
        return ApiResponse.error(res, err.message);
    }
};

export default {
    getOrders,
    getOrderById
};
