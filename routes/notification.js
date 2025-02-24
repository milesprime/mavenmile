// routes/notification.js

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Notification = require("../models/Notification");
const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort(
      { createdAt: -1 }
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark a notification as read
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Notification not found." });
    }

    notification.status = "read";
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.userId.toString() !== req.user.id) {
      return res.status(404).json({ msg: "Notification not found." });
    }

    await notification.remove();
    res.json({ msg: "Notification deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
