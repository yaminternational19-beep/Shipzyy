// middleware/loadPermissions.js
import db from '../config/db.js';

const loadPermissions = async (req, res, next) => {
  const { role, user_id } = req.user;

  try {
    if (role === "SUB_ADMIN") {
      const [rows] = await db.query(
        "SELECT permissions FROM sub_admins WHERE id = ?",
        [user_id]
      );
      req.user.permissions = rows[0]?.permissions || [];
    }

    if (role === "VENDOR_STAFF") {
      const [rows] = await db.query(
        "SELECT permissions FROM vendor_staff WHERE id = ?",
        [user_id]
      );
      req.user.permissions = rows[0]?.permissions || [];
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default loadPermissions;