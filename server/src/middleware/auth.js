const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate a user by verifying their JWT token.
 * It checks the 'Authorization' header for a Bearer token.
 */
const authenticate = (req, res, next) => {
  try {
    // 1. Get the Authorization header from the request
    const authHeader = req.headers.authorization;

    // 2. Check if it exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication failed. Please provide a valid Bearer token.' 
      });
    }

    // 3. Extract the token string (remove 'Bearer ' prefix)
    const token = authHeader.split(' ')[1];

    // 4. Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

    // 5. Attach the decoded user information (like id and role) to the request object
    // This allows subsequent route handlers to know WHO made the request
    req.user = decoded;

    // 6. Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token. Please log in again.' 
    });
  }
};

/**
 * Middleware to authorize specific roles (e.g., only 'DRIVER' or only 'PASSENGER')
 * MUST be used AFTER the `authenticate` middleware, because it relies on `req.user`.
 * 
 * @param {...String} roles - List of allowed roles
 */
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is in the list of allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Requires one of these roles: ${roles.join(', ')}` 
      });
    }
    // User has the correct role, proceed
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRole
};
