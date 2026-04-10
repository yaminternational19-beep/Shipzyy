import { getAnnouncementsService, createAnnouncementService, updateAnnouncementService, deleteAnnouncementService } from './announcements.service.js';
import ApiResponse from '../../utils/apiResponse.js';
import { getPagination, getPaginationMeta } from '../../utils/pagination.js';

export const getAnnouncements = async (req, res) => {
    try {
        const { target_type } = req.query;
        const { page, limit, skip } = getPagination(req.query);
        const { announcements, totalCount } = await getAnnouncementsService(limit, skip, target_type);
        const meta = getPaginationMeta(page, limit, totalCount);
        
        return res.status(200).json({
            success: true,
            message: "Announcements fetched successfully",
            data: announcements,
            meta
        });
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to fetch announcements");
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const id = await createAnnouncementService(req.body);
        return ApiResponse.success(res, "Announcement created successfully", { id }, 201);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to create announcement");
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, message } = req.body;
        const success = await updateAnnouncementService(id, title, message);
        if (success) {
            return ApiResponse.success(res, "Announcement updated successfully");
        } else {
            return ApiResponse.error(res, "Announcement not found", 404);
        }
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update announcement");
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await deleteAnnouncementService(id);
        if (success) {
            return ApiResponse.success(res, "Announcement deleted successfully");
        } else {
            return ApiResponse.error(res, "Announcement not found", 404);
        }
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to delete announcement");
    }
};

export const resendAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        // In reality, this would trigger FCM/Push Notifications again
        return ApiResponse.success(res, "Announcement pushed to queues to resend");
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to resend announcement");
    }
};
