import express from "express";
import * as controller from "./orders.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.js";
import { updateStatusSchema, getOrdersQuerySchema } from "./orders.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", validate(getOrdersQuerySchema, 'query'), controller.getAllOrders);
router.patch("/:orderId/status", validate(updateStatusSchema), controller.updateOrderStatus);

export default router;
