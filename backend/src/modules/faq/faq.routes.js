import express from 'express';
import * as faqController from './faq.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import { createFAQSchema, updateFAQSchema } from './faq.validator.js';

const router = express.Router();

// Public routes (for app/website users)
router.get('/', faqController.getFAQs);

// Admin protected routes
router.use(authenticate); // Applied to all subsequent routes

router.post(
    '/', 
    validate(createFAQSchema), 
    faqController.createFAQ
);

router.patch(
    '/:id', 
    validate(updateFAQSchema), 
    faqController.updateFAQ
);

router.delete(
    '/:id', 
    faqController.deleteFAQ
);

export default router;
