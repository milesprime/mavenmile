const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["order", "admin", "promotional", "system", "security"], // Added 'system' and 'security'
    required: true,
  },
  category: {
    type: String,
    enum: [
      "orderUpdate",
      "newOrder",
      "productUpdate",
      "adminActivity",
      "promotion",
      "systemAlert",
      "securityAlert",
      "holidaySale",
      "orderCreation", // Add 'orderCreation'
      "orderCancellation", // Add 'orderCancellation' if needed
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ["unread", "read"],
    default: "unread",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
