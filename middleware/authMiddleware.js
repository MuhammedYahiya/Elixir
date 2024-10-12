const jwt = require('jsonwebtoken');


const authMiddleware = (requiredUserType) => (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'No token provided', success: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token', success: false });
    }
    console.log("Decoded User Type:", decoded.user_type); 
   
    if (requiredUserType && decoded.user_type !== requiredUserType) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions', success: false });
    }

    req.user = decoded; 
    next();
  });
};

module.exports = authMiddleware;
