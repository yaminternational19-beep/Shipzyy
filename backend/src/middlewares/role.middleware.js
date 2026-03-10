const ApiError = require("../utils/ApiError");

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "Forbidden - Access denied");
    }

    next();
  };
};

module.exports = authorize;