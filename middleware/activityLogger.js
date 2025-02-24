// middleware/activityLogger.js
const ActivityLog = require("../models/ActivityLog");

module.exports = async function (req, res, next) {
  const userId = req.user ? req.user.id : null; // Get userId if user is authenticated
  const activity = {
    userId: userId,
    method: req.method,
    route: req.originalUrl,
    ip: req.ip,
    timestamp: new Date(),
    statusCode: res.statusCode,
  };

  try {
    await ActivityLog.create(activity);
    console.log(`User activity logged: ${activity.method} ${activity.route}`);
  } catch (error) {
    console.error("Error logging activity:", error);
  }

  next();
};
