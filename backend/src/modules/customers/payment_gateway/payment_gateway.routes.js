import express from "express";
import * as paymentController from "./payment_gateway.controller.js";
import optionalCustomerAuth from "../../../middlewares/optionalCustomerAuth.middleware.js";

const router = express.Router();


router.get("/payment", optionalCustomerAuth, paymentController.initiatePayment);

export default router;
