import express from 'express';
import { createDeliveryCharge, getDeliveryCharges, updateDeliveryCharge, deleteDeliveryCharge, toggleStatus } from './delivery_charges.controller.js';
import { createDeliveryChargeSchema, updateDeliveryChargeSchema } from './delivery_charges.validator.js';
import validate from '../../middlewares/validate.js';
import authenticate from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createDeliveryChargeSchema), createDeliveryCharge);
router.get('/', getDeliveryCharges);
router.put('/:id', validate(updateDeliveryChargeSchema), updateDeliveryCharge);
router.delete('/:id', deleteDeliveryCharge);
router.patch('/:id/status', toggleStatus);

export default router;
