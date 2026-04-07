import ApiResponse from '../../utils/apiResponse.js';
import service from './customers.service.js';

export const getAllCustomers = async (req, res) => {
  try {

    const result = await service.getAllCustomers(req.query);

    return ApiResponse.success(
      res,
      "Customers fetched successfully",
      result
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to fetch customers"
    );

  }
};
export const getCustomerById = async (req, res) => {
  try {

    const result = await service.getCustomerById(req.params.id);

    return ApiResponse.success(
      res,
      "Customer fetched successfully",
      result
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to fetch customer"
    );

  }
};

export const updateStatus = async (req, res) => {
  try {

    await service.updateStatus(req.params.id, req.body.status);

    return ApiResponse.success(
      res,
      "Customer status updated successfully"
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to update customer status"
    );

  }
};

export const deleteCustomer = async (req, res) => {
  try {

    await service.deleteCustomer(req.params.id);

    return ApiResponse.success(
      res,
      "Customer deleted successfully"
    );

  } catch (error) {

    return ApiResponse.error(
      res,
      error.message || "Failed to delete customer"
    );

  }
};

export default {
    getAllCustomers,
    getCustomerById,
    updateStatus,
    deleteCustomer
};
