import apiService from "./api";

export const getCheckoutDetails = async (addressId = null, couponCode = null) => {
    try {
        const params = {};
        if (addressId) params.address_id = addressId;
        if (couponCode) params.coupon_code = couponCode;

        const response = await apiService.get("/customers/checkout", { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

//  Place  Order
export const placeOrder = async (orderData) => {
    try {
        const response = await apiService.post("/customers/place-order", orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};