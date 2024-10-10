const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT
const authMiddleware = (requiredUserType) => (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get token from Authorization header

  if (!token) {
    return res.status(401).json({ message: 'No token provided', success: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token', success: false });
    }

    // Check if the user type matches the required user type
    if (requiredUserType && decoded.user_type !== requiredUserType) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions', success: false });
    }

    req.user = decoded; // Save decoded user data to request object
    next();
  });
};

module.exports = authMiddleware;
