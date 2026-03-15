const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

/**
 * Verify JWT from Authorization header or cookie
 */
function authenticate(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return error(res, 'Authentication required', 401);
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401);
  }
}

/**
 * Restrict to specific roles
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return error(res, 'You do not have permission to perform this action', 403);
    }
    next();
  };
}

/**
 * Optional auth — attaches user if token present, doesn't fail if missing
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      req.user = verifyToken(token);
    }
  } catch {
    // Token invalid — treat as unauthenticated
  }
  next();
}

module.exports = { authenticate, authorize, optionalAuth };
