// routes/auth.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Contact = require("../models/Contact"); // Import the Contact model
const Notification = require("../models/Notification"); // Import Notification model
const router = express.Router();
const twilio = require("twilio");
const { sendEmail } = require("../utils/email");

// Log Environment Variables (for debugging purposes)
console.log("Twilio SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio Phone Number:", process.env.TWILIO_PHONE_NUMBER);
console.log("Gmail User:", process.env.EMAIL_USER);

// Twilio Configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email Verification Route (Using Gmail)
router.get("/verify-email", async (req, res) => {
  console.log("Inside /verify-email route");
  console.log(req.query);

  const { token, id } = req.query;

  try {
    let user = await User.findById(id);
    if (!user) {
      return res.status(400).json({ msg: "Invalid link or expired" });
    }

    if (
      user.emailVerificationToken !== token ||
      user.emailVerificationExpires < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send Welcome Email using Gmail after successful verification
    const templateData = {
      firstName: user.firstName,
    };
    try {
      await sendEmail({
        to: user.email,
        subject: "Welcome to UpTech!",
        template: "welcomeEmail", // Use the welcome email template
        templateData,
        service: "gmail", // Use Gmail service
      });
      console.log("Welcome email sent to:", user.email);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return res.status(500).json({
        msg: "Error sending welcome email. Please try again later.",
      });
    }

    // Create in-app notification for successful email verification
    const notification = new Notification({
      userId: user._id,
      message: "Your email has been successfully verified. Welcome to UpTech!",
      type: "system",
      category: "systemAlert",
    });
    await notification.save();
    console.log("In-app notification created for email verification.");

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Register Route with Phone Verification Code
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = Date.now() + 3600000; // 1 hour
    const phoneVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      emailVerificationToken,
      emailVerificationExpires,
      phoneVerificationCode,
    });

    await user.save();

    const verificationLink = `http://${req.headers.host}/api/auth/verify-email?token=${emailVerificationToken}&id=${user._id}`;
    const verificationMailOptions = {
      to: email,
      subject: "Verify Your Email - UpTech",
      text: `Hello ${user.firstName},\n\nPlease verify your email by clicking the link below:\n\n${verificationLink}`,
      service: "gmail",
    };

    try {
      await sendEmail(verificationMailOptions);
      console.log("Verification email sent to:", email);

      const admins = await User.find({ roles: "admin" });
      for (const admin of admins) {
        const adminNotification = new Notification({
          userId: admin._id,
          message: `A new user has registered: ${firstName} ${lastName}.`,
          type: "admin",
          category: "adminActivity",
        });
        await adminNotification.save();
      }

      // Log the registration activity
      const UserActivity = require("../models/UserActivity");
      const activity = new UserActivity({
        userId: user._id,
        action: "User Registration",
        details: { email, phoneNumber },
      });
      await activity.save();

      res.status(200).json({
        msg: "Registration successful. Please verify your email and phone number.",
      });
    } catch (error) {
      console.error(
        "Error sending verification email or creating notification:",
        error
      );
    }
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      msg: "Error during registration. Please try again later.",
    });
  }
});

// Send Email Route for Testing
router.post("/send-email", async (req, res) => {
  const { to, subject, text, template, templateData } = req.body;

  if (!to || !subject || (!text && !template)) {
    return res
      .status(400)
      .json({ msg: "All fields are required (to, subject, text/template)" });
  }

  try {
    await sendEmail({
      to,
      subject,
      text,
      template,
      templateData,
      service: "gmail", // Use Gmail for testing
    });
    res.status(200).json({ msg: "Email sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ msg: "Failed to send email", error: error.message });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }

    const payload = {
      user: {
        id: user.id,
        roles: user.roles,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: 3600, // 1 hour
    });

    // Set the JWT token in a secure, HttpOnly cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Prevent CSRF
      maxAge: 3600000, // 1 hour
    });

    // Assign A/B test group
    let testGroup = req.cookies.testGroup;
    if (!testGroup) {
      testGroup = Math.random() < 0.5 ? "Group A" : "Group B"; // 50/50 split
      res.cookie("testGroup", testGroup, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Prevent CSRF
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }

    res.status(200).json({ msg: "Logged in successfully", testGroup });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Phone Verification Route
router.post("/verify-phone", async (req, res) => {
  const { userId, code } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({ msg: "Phone already verified" });
    }

    if (user.phoneVerificationCode !== code) {
      return res.status(400).json({ msg: "Invalid verification code" });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = undefined; // Clear the code after verification
    await user.save();

    // Create in-app notification for successful phone verification
    const notification = new Notification({
      userId: user._id,
      message: "Your phone number has been successfully verified.",
      type: "system",
      category: "systemAlert",
    });
    await notification.save();
    console.log("In-app notification created for phone verification.");

    res.status(200).json({ msg: "Phone verified successfully" });
  } catch (err) {
    console.error("Error verifying phone:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// Contact Form Submission Route
router.post("/contact-form", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Save the contact form data to the database
    const contact = new Contact({ name, email, message });
    await contact.save();

    // Send notification email to admin
    const templateData = {
      name,
      email,
      message,
    };

    try {
      await sendEmail({
        to: process.env.ADMIN_EMAIL, // Send to admin email
        subject: "New Contact Form Submission",
        template: "contactForm", // Use the contact form template
        templateData,
        service: "gmail", // Use Gmail service
      });
      console.log("Contact form email sent to:", process.env.ADMIN_EMAIL);

      // Notify admins about the new contact form submission
      const admins = await User.find({ roles: "admin" });
      for (const admin of admins) {
        const adminNotification = new Notification({
          userId: admin._id,
          message: `New contact form submission from ${name} (${email}): ${message}`,
          type: "admin",
          category: "adminActivity",
        });
        await adminNotification.save();
      }
      console.log("Admins notified of new contact form submission.");

      res.status(200).json({ msg: "Contact form submitted successfully!" });
    } catch (error) {
      console.error(
        "Error sending contact form email or creating notification:",
        error
      );
      return res.status(500).json({
        msg: "Error sending contact form email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ msg: "Server error. Please try again later." });
  }
});

// Request Password Reset Route
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
    }

    // Generate a reset token and expiry time
    const resetPasswordToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpires = Date.now() + 3600000; // 1 hour

    // Update user with reset token and expiration
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;

    await user.save();

    // Send reset email
    const resetLink = `http://${req.headers.host}/api/auth/reset-password/${resetPasswordToken}`;
    const templateData = {
      firstName: user.firstName,
      resetLink,
    };

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - UpTech",
        template: "passwordReset", // Use the password reset template
        templateData,
        service: "gmail", // Use Gmail service
      });
      console.log("Password reset email sent to:", user.email);

      // Notify admins about the password reset request
      const admins = await User.find({ roles: "admin" });
      for (const admin of admins) {
        const adminNotification = new Notification({
          userId: admin._id,
          message: `Password reset requested for user: ${user.firstName} ${user.lastName} (${user.email}).`,
          type: "admin",
          category: "adminActivity",
        });
        await adminNotification.save();
      }
      console.log("Admins notified of password reset request.");

      res.status(200).json({ msg: "Password reset email sent" });
    } catch (error) {
      console.error(
        "Error sending password reset email or creating notification:",
        error
      );
      return res.status(500).json({
        msg: "Error sending password reset email. Please try again later.",
      });
    }
  } catch (err) {
    console.error("Error during password reset request:", err.message);
    res.status(500).send("Server error");
  }
});

// Password Reset Route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    let user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Update user password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ msg: "Password has been reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err.message);
    res.status(500).send("Server error");
  }
});

// Logout Route - Clears the auth_token cookie
router.post("/logout", (req, res) => {
  // Clear the auth_token cookie
  res.clearCookie("auth_token", {
    httpOnly: true, // Only accessible by the web server
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  });

  // Respond to the client
  res.status(200).json({ msg: "Logged out successfully" });
});

module.exports = router;
