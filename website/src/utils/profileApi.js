import apiService from "./api";

export const getProfileDetails = async () => {
  try {
    const response = await apiService.get("/customers/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile details:", error);
    throw error;
  }
};


export const updateProfileDetails = async (formData) => {
  try {
    const response = await apiService.put("/customers/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const deleteAccount = async (reason = "Delete") => {
  try {
    const response = await apiService.delete("/customers/delete", {
      data: { reason }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};