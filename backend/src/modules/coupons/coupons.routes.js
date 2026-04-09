import express from 'express';
import { createCoupon, getCoupons, updateCoupon, deleteCoupon, toggleStatus } from './coupons.controller.js';
import { createCouponSchema, updateCouponSchema } from './coupons.validator.js';
import validate from '../../middlewares/validate.js';
import authenticate from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createCouponSchema), createCoupon);
router.get('/', getCoupons);
router.put('/:id', validate(updateCouponSchema), updateCoupon);
router.delete('/:id', deleteCoupon);
router.patch('/:id/status', toggleStatus);

export default router;
