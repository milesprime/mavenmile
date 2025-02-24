// routes/newsletter.js

const express = require("express");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// Subscribe to Newsletter
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email is already subscribed
    let subscriber = await NewsletterSubscriber.findOne({ email });
    if (subscriber && subscriber.status === "Subscribed") {
      return res.status(400).json({ msg: "Email is already subscribed" });
    }

    if (!subscriber) {
      // Create a new subscriber entry
      subscriber = new NewsletterSubscriber({ email });
    } else {
      // Update status to 'Subscribed' if previously unsubscribed
      subscriber.status = "Subscribed";
    }

    await subscriber.save();

    // Send Welcome Email
    const templateData = { email };
    await sendEmail({
      to: email,
      subject: "Welcome to UpTech Newsletter!",
      template: "newsletterSubscription", // Use the newsletter subscription template
      templateData,
      service: "gmail", // Use Gmail service
    });

    res.status(200).json({ msg: "Successfully subscribed to the newsletter" });
  } catch (err) {
    console.error("Error subscribing to newsletter:", err.message);
    res.status(500).send("Server error");
  }
});

// Send Newsletter (Admin Only)
router.post(
  "/send-newsletter",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    const { subject, message, template } = req.body;

    try {
      // Get all subscribed users
      const subscribers = await NewsletterSubscriber.find({
        status: "Subscribed",
      });
      if (subscribers.length === 0) {
        return res.status(400).json({ msg: "No subscribers found" });
      }

      const templateData = { message };
      for (const subscriber of subscribers) {
        try {
          // Send the newsletter email
          await sendEmail({
            to: subscriber.email,
            subject: subject || "UpTech Newsletter",
            template: template || "newsletter", // Default to 'newsletter' template
            templateData,
            service: "gmail",
          });
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
        }
      }

      res.status(200).json({ msg: "Newsletter sent to all subscribers" });
    } catch (err) {
      console.error("Error sending newsletter:", err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
