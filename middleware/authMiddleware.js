// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from cookie or header
  const token = req.cookies.auth_token || req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// Admin role validation Middleware
module.exports.isAdmin = function (req, res, next) {
  if (req.user && req.user.roles && req.user.roles.includes("admin")) {
    next();
  } else {
    res.status(403).json({ msg: "Access denied. Admins only." });
  }
};
