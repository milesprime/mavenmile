// routes/adminContact.js

const express = require("express");
const Contact = require("../models/Contact"); // Assuming Contact model is defined for inquiries
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Get All Inquiries (Admins Only)
router.get("/", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const inquiries = await Contact.find();
    res.json(inquiries);
  } catch (err) {
    console.error("Error fetching inquiries:", err.message);
    res.status(500).send("Server error");
  }
});

// Get Inquiry by ID (Admins Only)
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

// Delete an Inquiry (Admins Only)
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
