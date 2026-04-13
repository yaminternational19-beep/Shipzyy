import express from 'express';
const router = express.Router();

import controller from './vendor_customers.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import authorize from '../../middlewares/role.middleware.js';

router.use(authenticate);
router.use(authorize("VENDOR_OWNER", "VENDOR_STAFF"));

router.get("/", controller.getCustomers);
router.get("/:id", controller.getCustomerDetails);

export default router;
