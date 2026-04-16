import { Router } from "express";
import optionalCustomerAuth from "../../../middlewares/optionalCustomerAuth.middleware.js";
import validate from "../../../middlewares/validate.js";
import { createTicketSchema } from "./support.validator.js";
import supportController from "./support.controller.js";

const router = Router();

router.get("/help-support", supportController.getHelpSupport);
router.get("/content", supportController.getContent);
router.get("/content/:page_key", supportController.getContentByKey);
router.get("/faqs", supportController.getFaqs);
router.get("/announcements", optionalCustomerAuth, supportController.getAnnouncements);
router.post("/tickets", optionalCustomerAuth, validate(createTicketSchema), supportController.createTicket);


export default router;
