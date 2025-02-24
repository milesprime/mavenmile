// routes/contact.js

const express = require("express");
const nodemailer = require("nodemailer");
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming you have auth middleware for admin check
const router = express.Router();

// Create a Nodemailer transporter for sending email notifications
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email user
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// Submit Contact Form
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Create and save the inquiry in the database
    const newContact = new Contact({
      name,
      email,
      message,
    });

    await newContact.save();

    // Send email notification to admin
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // The admin's email address
      subject: "New Contact Inquiry",
      text: `You have a new inquiry from ${name} (${email}). Message: ${message}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ msg: "Inquiry submitted successfully" });
  } catch (err) {
    console.error("Error submitting contact form:", err.message);
    res.status(500).send("Server error");
  }
});

// Get All Inquiries (Admin Only)
router.get("/", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const inquiries = await Contact.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error("Error fetching inquiries:", err.message);
    res.status(500).send("Server error");
  }
});

// Get a Single Inquiry by ID (Admin Only)
router.get("/:id", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const inquiry = await Contact.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ msg: "Inquiry not found" });
    }
    res.json(inquiry);
  } catch (err) {
    console.error("Error fetching inquiry:", err.message);
    res.status(500).send("Server error");
  }
});

// Delete an Inquiry (Admin Only)
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    try {
      const inquiry = await Contact.findById(req.params.id);
      if (!inquiry) {
        return res.status(404).json({ msg: "Inquiry not found" });
      }

      await Contact.findByIdAndDelete(req.params.id);
      res.json({ msg: "Inquiry deleted successfully" });
    } catch (err) {
      console.error("Error deleting inquiry:", err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
