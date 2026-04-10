import Razorpay from "razorpay";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createTestOrder = async () => {
  try {
    const options = {
      amount: 500 * 100, // ₹500 → paise
      currency: "INR",
      receipt: "test_receipt_1"
    };

    const order = await razorpay.orders.create(options);

    console.log("✅ Order created successfully:");
    console.log(order);

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

createTestOrder();