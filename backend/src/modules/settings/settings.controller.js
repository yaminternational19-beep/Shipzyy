import { getPagesService, updatePageService, createPageService, deletePageService } from './settings.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const getPages = async (req, res) => {
    try {
        const pages = await getPagesService();
        return ApiResponse.success(res, "Content fetched successfully", pages);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to fetch content");
    }
};

export const updatePage = async (req, res) => {
    try {
        const { key } = req.params;
        const { content } = req.body;
        const success = await updatePageService(key, content);
        if (success) {
            return ApiResponse.success(res, "Page updated successfully");
        } else {
            return ApiResponse.error(res, "Page not found", 404);
        }
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update page");
    }
};

export const createPage = async (req, res) => {
    try {
        const { page_key, title, content, type, icon } = req.body;
        await createPageService(page_key, title, content, type, icon);
        return ApiResponse.success(res, "Page created successfully", undefined, 201);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to create page");
    }
};

export const deletePage = async (req, res) => {
    try {
        const { key } = req.params;
        const success = await deletePageService(key);
        if (success) {
            return ApiResponse.success(res, "Page deleted successfully");
        } else {
            return ApiResponse.error(res, "Page not found or not deletable", 404);
        }
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to delete page");
    }
};
