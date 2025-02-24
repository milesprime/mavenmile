// routes/preferences.js

const express = require("express");
const router = express.Router();

// Middleware for authentication
const authMiddleware = require("../middleware/authMiddleware");

// Save or update user preferences
router.post("/save", authMiddleware, (req, res) => {
  const { language, theme } = req.body;

  // Retrieve current preferences from cookies
  const currentPreferences = req.cookies.preferences
    ? JSON.parse(req.cookies.preferences)
    : {};

  // Check if preferences have changed
  const hasChanged =
    currentPreferences.language !== language ||
    currentPreferences.theme !== theme;

  if (hasChanged) {
    // Save the updated preferences in the cookie
    res.cookie("preferences", JSON.stringify({ language, theme }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({ msg: "Preferences updated successfully." });
  } else {
    res.status(200).json({ msg: "No changes detected in preferences." });
  }
});

// Get user preferences
router.get("/get", (req, res) => {
  const preferencesCookie = req.cookies.preferences;

  if (!preferencesCookie) {
    return res.status(404).json({ msg: "No preferences found." });
  }

  try {
    const preferences = JSON.parse(preferencesCookie);
    res.status(200).json(preferences);
  } catch (err) {
    res.status(500).json({ msg: "Failed to parse preferences." });
  }
});

module.exports = router;
