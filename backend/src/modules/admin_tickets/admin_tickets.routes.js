import express from 'express';
const router = express.Router();

import adminTicketsController from './admin_tickets.controller.js';
import authenticate from '../../middlewares/auth.middleware.js';

router.get("/", authenticate, adminTicketsController.getTickets);
router.post("/:ticketId/reply", authenticate, adminTicketsController.replyToTicket);

export default router;
