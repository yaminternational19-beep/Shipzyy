import ApiResponse from "../../utils/apiResponse.js";
import service from "./admin_products.service.js";

const getProducts = async (req, res) => {
    try{
        const result = await service.getProducts(req.query);
        return ApiResponse.success(res, "Products fetched successfully", result);   
    }catch(err){
        return ApiResponse.error(res, err.message);
    }
};


const getProductById = async (req, res) => {
    try{
        const result = await service.getProductById(req.params.id);
        return ApiResponse.success(res, "Product fetched successfully", result);
    }catch(err){
        return ApiResponse.error(res, err.message);
    }
};


const updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        const result = await service.updateProductStatus(id, status, rejection_reason, req.user.id);
        return ApiResponse.success(res, "Product status updated successfully", result);
    } catch (err) {
        return ApiResponse.error(res, err.message);
    }
};


export default {
    getProducts,
    getProductById,
    updateProductStatus
}