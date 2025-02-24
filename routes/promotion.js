const express = require("express");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendEmail } = require("../utils/email");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Send Promotional Notification and Email to All Users
router.post(
  "/send",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    const { title, message } = req.body;

    // Define the category for promotional notifications
    const category = "promotion";

    // Validate the category before proceeding
    const validCategories = [
      "orderUpdate",
      "newOrder",
      "productUpdate",
      "adminActivity",
      "promotion",
      "systemAlert",
      "securityAlert",
      "holidaySale",
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ msg: "Invalid category provided." });
    }

    try {
      // Fetch all users
      const users = await User.find({});

      for (const user of users) {
        // Create in-app notification
        const notification = new Notification({
          userId: user._id,
          message: `${title}: ${message}`,
          type: "promotional",
          category: category, // Set category to 'promotion'
        });
        await notification.save();

        // Send promotional email
        const templateData = {
          firstName: user.firstName,
          message,
        };
        try {
          await sendEmail({
            to: user.email,
            subject: title,
            template: "promotion", // Use the promotion email template
            templateData,
            service: "gmail",
          });
          console.log(`Promotional email sent to: ${user.email}`);
        } catch (error) {
          console.error(
            `Failed to send promotional email to: ${user.email}`,
            error
          );
        }
      }

      res
        .status(200)
        .json({ msg: "Promotional notification and email sent to all users." });
    } catch (error) {
      console.error(
        "Error sending promotional notifications and emails:",
        error
      );
      res.status(500).json({ msg: "Server error. Please try again later." });
    }
  }
);

module.exports = router;
