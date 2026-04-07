import jwt from 'jsonwebtoken';

/**
 * Middleware for Optional Customer Token Verification
 * Allows the request to proceed even if the token is missing or invalid.
 * Sets req.user if a valid customer token is present.
 */
const optionalCustomerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verify it's actually a customer session
      if (decoded.role === "CUSTOMER") {
        // Attach customer info to request
        req.user = {
          id: decoded.id,
          role: decoded.role
        };
      }
    } catch (err) {
      // Just ignore the error and proceed as unauthenticated
    }
  }

  next();
};

export default optionalCustomerAuth;
