// middleware/vendorIsolation.js
const vendorIsolation = (req, res, next) => {
  const { role, vendor_id } = req.user;

  // Super Admin & Sub Admin → access all data
  if (role === "SUPER_ADMIN" || role === "SUB_ADMIN") {
    return next();
  }

  // Vendor Owner & Vendor Staff → restrict data
  req.vendor_id = vendor_id;

  next();
};

export default vendorIsolation;