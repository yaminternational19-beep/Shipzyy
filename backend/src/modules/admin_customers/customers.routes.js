import express from 'express';
const router = express.Router();

import controller from './customers.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';

import validate from '../../middlewares/validate.js';
import { updateStatusSchema } from './customers.validator.js';

router.get("/", authenticate, controller.getAllCustomers);
router.get("/:id", authenticate, controller.getCustomerById);
router.patch("/:id/status", authenticate, validate(updateStatusSchema), controller.updateStatus);
router.delete("/:id", authenticate, controller.deleteCustomer);

export default router;