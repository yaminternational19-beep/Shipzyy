import ApiResponse from '../../utils/apiResponse.js';
import service from './banners.service.js';

export const createBanner = async (req, res) => {
  try {
    const banner = await service.createBanner(req.body, req.file);
    return ApiResponse.success(res, "Banner created successfully", banner);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to create banner");
  }
};

export const getBanners = async (req, res) => {
  try {
    const result = await service.getBanners(req.query);
    return ApiResponse.success(res, "Banners fetched successfully", result);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to fetch banners");
  }
};

export const updateBanner = async (req, res) => {
  try {
    const banner = await service.updateBanner(req.params.id, req.body, req.file);
    return ApiResponse.success(res, "Banner updated successfully", banner);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to update banner");
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const deleted = await service.deleteBanner(req.params.id);
    return ApiResponse.success(res, "Banner deleted successfully", deleted);
  } catch (error) {
    return ApiResponse.error(res, error.message || "Failed to delete banner");
  }
};

export default { createBanner, getBanners, updateBanner, deleteBanner };
