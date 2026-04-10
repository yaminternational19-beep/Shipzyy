import express from 'express';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement, resendAnnouncement } from './announcements.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';
import validate from '../../middlewares/validate.js';
import { createAnnouncementSchema, updateAnnouncementSchema } from './announcements.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAnnouncements);
router.post('/', validate(createAnnouncementSchema), createAnnouncement);
router.put('/:id', validate(updateAnnouncementSchema), updateAnnouncement);
router.delete('/:id', deleteAnnouncement);
router.post('/:id/resend', resendAnnouncement);

export default router;
