// middleware/moduleAccess.js
import ApiError from '../utils/ApiError.js';

const checkModuleAccess = (moduleName) => {
  return (req, res, next) => {
    const { role, permissions } = req.user;

    // Super Admin → full access
    if (role === "SUPER_ADMIN") return next();

    // Vendor Owner → full vendor panel
    if (role === "VENDOR_OWNER") return next();

    // Sub Admin / Vendor Staff → check permission
    if (!permissions || !permissions.includes(moduleName)) {
      throw new ApiError(403, "Access denied for this module");
    }

    next();
  };
};

export default checkModuleAccess;