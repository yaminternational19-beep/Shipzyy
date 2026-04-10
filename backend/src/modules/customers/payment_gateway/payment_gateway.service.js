import razorpay from "../../../config/razorpay.js";
import ApiError from "../../../utils/ApiError.js";


const createOrder = async (amount, currency = "INR", receipt = "receipt_" + Date.now()) => {
    try {
        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise for INR)
            currency,
            receipt,
            payment_capture: 1 // auto capture
        };

        const order = await razorpay.orders.create(options);
        
        if (!order) {
            throw new ApiError(500, "Failed to create Razorpay order");
        }

        return order;
    } catch (error) {
        throw new ApiError(500, error.message || "Razorpay order creation failed");
    }
};


const getPaymentMethods = async () => {
    // Razorpay standard checkout handles all methods including UPI and PhonePe
    return {
        methods: ["upi", "card", "netbanking", "wallet"],
        upi_apps: ["phonepe", "google_pay", "paytm"]
    };
};

export default {
    createOrder,
    getPaymentMethods
};
