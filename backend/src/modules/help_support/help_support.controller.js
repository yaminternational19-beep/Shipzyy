import { getContactsService, updateContactsService } from './help_support.service.js';
import ApiResponse from '../../utils/apiResponse.js';

export const getContacts = async (req, res) => {
    try {
        const { role } = req.query; // optional
        const contacts = await getContactsService(role);
        return ApiResponse.success(res, "Contacts fetched successfully", contacts);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to fetch contacts");
    }
};

export const updateContacts = async (req, res) => {
    try {
        const { role } = req.params;
        const { contacts } = req.body;
        
        await updateContactsService(role, contacts);
        return ApiResponse.success(res, "Contacts updated successfully");
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to update contacts");
    }
};
