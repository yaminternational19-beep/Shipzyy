import ApiResponse from "../../../utils/apiResponse.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import paymentService from "./payment_gateway.service.js";
import { RAZORPAY_KEY_ID } from "../../../config/razorpay.js";


export const initiatePayment = asyncHandler(async (req, res) => {
    const { amount } = req.query;
    
    // Define the list of payment methods
    const paymentMethods = [
        "UPI",
        "Credit / Debit Card",
        "Net Banking",
        "Wallets",
        "Cash on Delivery"
    ];

    const result = {
        payment_methods: paymentMethods,
        razorpay_key: RAZORPAY_KEY_ID
    };

    // Only create a Razorpay order if an amount is provided
    if (amount && !isNaN(amount)) {
        result.razorpay_order = await paymentService.createOrder(amount);
    }

    return ApiResponse.success(res, "Payment methods fetched successfully", result);
});

export default {
    initiatePayment
};
