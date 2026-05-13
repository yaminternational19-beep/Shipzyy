import apiService from "./api";

export const getContentDetails = async () => {
  try {
    const response = await apiService.get("/customers/content");
    return response.data;
  } catch (error) {
    console.error("Error fetching content details:", error);
    throw error;
  }
};