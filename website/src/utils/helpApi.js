import apiService from "./api";

// 1. Fetch Help Support Contacts
export const getHelpSupportContacts = async () => {
  try {
    const response = await apiService.get("/customers/help-support");
    return response.data;
  } catch (error) {
    console.error("Error fetching help support contacts:", error);
    throw error;
  }
};

// 2. Fetch FAQs
export const getFAQs = async () => {
  try {
    const response = await apiService.get("/customers/faqs");
    return response.data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw error;
  }
};

// 3. Fetch Announcements
export const getAnnouncements = async () => {
  try {
    const response = await apiService.get("/customers/announcements");
    return response.data;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

// 4. Create a Support Ticket
export const createSupportTicket = async (ticketData) => {
  try {
    const response = await apiService.post("/customers/tickets", ticketData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating support ticket:", error);
    throw error;
  }
};