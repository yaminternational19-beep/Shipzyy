const express = require("express");
const router = express.Router();

const controller = require("./subadmin.controller");
const {
  createSubAdminSchema,
  updateSubAdminSchema,
  updatePermissionsSchema,
} = require("./subadmin.validator");
const upload = require("../../middlewares/upload.middleware.js");
const validate = require("../../middlewares/validate");

/* ===============================
   GET SUB ADMINS
================================= */
router.get("/", controller.getSubAdmins);

router.get("/logs", controller.getAccessLogs);


/* ===============================
   CREATE SUB ADMIN
================================= */
router.post("/",upload.single("profilePhoto"),validate(createSubAdminSchema),controller.createSubAdmin);


/* ===============================
   UPDATE SUB ADMIN
================================= */
router.put("/:id",upload.single("profilePhoto"),validate(updateSubAdminSchema),controller.updateSubAdmin);


/* ===============================
   DELETE SUB ADMIN
================================= */
router.delete("/:id", controller.deleteSubAdmin);


/* ===============================
   TOGGLE STATUS
================================= */
router.patch("/:id/status",controller.toggleStatus);


/* ===============================
   UPDATE PERMISSIONS
================================= */
router.patch("/:id/permissions",validate(updatePermissionsSchema),controller.updatePermissions);



module.exports = router;

