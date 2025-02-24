// middleware/userActivityMiddleware.js

const UserActivity = require("../models/UserActivity");

module.exports = async function (req, res, next) {
  if (req.user && req.user.id) {
    const activity = new UserActivity({
      userId: req.user.id,
      action: `${req.method} ${req.path}`, // e.g., "GET /api/products"
      details: {
        query: req.query,
        body: req.body,
      },
    });
    await activity.save();
  }
  next();
};
