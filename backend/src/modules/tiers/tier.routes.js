// routes/tier.routes.js

import express from 'express';
const router = express.Router();

import controller from './tier.controller.js';
import validate from '../../middlewares/validate.js';
import { createTierSchema, updateTierSchema } from './tier.validator.js';
import authenticate from '../../middlewares/auth.middleware.js';

/* ===============================
   GET TIERS
================================= */
router.get("/", authenticate, controller.getTiers);
router.post("/", authenticate, validate(createTierSchema), controller.createTier);
router.put("/:id", authenticate, validate(updateTierSchema), controller.updateTier);
router.delete("/:id", authenticate, controller.deleteTier);

export default router;