// models/UserActivity.js

const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: Object,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserActivity", userActivitySchema);
