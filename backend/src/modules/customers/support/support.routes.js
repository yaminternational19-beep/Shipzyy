import { Router } from "express";
import supportController from "./support.controller.js";

const router = Router();

router.get("/help-support", supportController.getHelpSupport);
router.get("/content", supportController.getContent);
router.get("/content/:page_key", supportController.getContentByKey);

export default router;
