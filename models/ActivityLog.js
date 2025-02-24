// models/ActivityLog.js
const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  method: {
    type: String,
    required: true,
  },
  route: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  statusCode: {
    type: Number,
  },
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);
