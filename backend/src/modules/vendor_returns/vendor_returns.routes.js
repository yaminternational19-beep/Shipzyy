import express from "express";
import * as controller from "./vendor_returns.controller.js";
import authenticate from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.js";
import { getReturnsQuerySchema, updateReturnStatusSchema } from "./vendor_returns.validator.js";

const router = express.Router();

router.use(authenticate);

router.get("/", validate(getReturnsQuerySchema, "query"), controller.getVendorReturns);
router.patch("/:returnId/status", validate(updateReturnStatusSchema, "body"), controller.updateReturnStatus);

export default router;
