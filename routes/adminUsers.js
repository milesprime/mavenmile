// routes/adminUsers.js

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// Get All Users with Search and Filter Functionality (Admin Only)
router.get("/", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  const { search, role } = req.query;
  let query = {};

  if (search) {
    query = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  if (role) {
    query.roles = role; // Filter by role (e.g., 'admin', 'customer')
  }

  try {
    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).send("Server error");
  }
});

// Get User by ID (Admin Only)
router.get("/:id", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update User Roles (Admin Only)
router.put(
  "/update-role/:id",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    const { roles } = req.body;

    try {
      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      user.roles = roles; // Update roles
      await user.save();

      res.json({ msg: "User roles updated successfully", user });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Delete User Account (Admin Only)
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Use the correct method to delete the user
      await User.findByIdAndDelete(req.params.id);
      res.json({ msg: "User deleted successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
