// routes/adminOrder.js

const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification"); // Import Notification model
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// Get All Orders with Search and Filter (Admin)
router.get("/", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  const { userId, orderId, paymentStatus, deliveryStatus } = req.query;
  let query = {};

  if (userId) query.userId = userId;
  if (orderId) query._id = orderId;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (deliveryStatus) query.deliveryStatus = deliveryStatus;

  try {
    const orders = await Order.find(query);
    res.json(orders);
  } catch (err) {
    console.error("Error fetching all orders:", err.message);
    res.status(500).send("Server error");
  }
});

// Get Order by ID (Admin)
router.get("/:id", authMiddleware, authMiddleware.isAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err.message);
    res.status(500).send("Server error");
  }
});

// Update Order Status (Admin)
router.put(
  "/:id/status",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    const { paymentStatus, deliveryStatus } = req.body;
    try {
      let order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ msg: "Order not found" });
      }

      // Update Payment Status History
      if (paymentStatus && paymentStatus !== order.paymentStatus) {
        order.paymentStatusHistory.push({
          status: paymentStatus,
          timestamp: new Date(),
        });
        order.paymentStatus = paymentStatus;
      }

      // Update Delivery Status History
      if (deliveryStatus && deliveryStatus !== order.deliveryStatus) {
        order.deliveryStatusHistory.push({
          status: deliveryStatus,
          timestamp: new Date(),
        });
        order.deliveryStatus = deliveryStatus;
      }

      await order.save();

      // Fetch user details to send status update email
      const user = await User.findById(order.userId);
      const templateData = {
        firstName: user.firstName,
        orderNumber: order._id,
        status: deliveryStatus || paymentStatus,
      };

      try {
        // Send Order Status Update Email
        await sendEmail({
          to: user.email,
          subject: `Order Status Update - UpTech`,
          template: "orderStatusUpdate",
          templateData,
          service: "gmail",
        });
        console.log("Order status update email sent to:", user.email);

        // Create in-app notification for order status change
        const notification = new Notification({
          userId: user._id,
          message: `Your order status has been updated to ${
            deliveryStatus || paymentStatus
          }`,
          type: "order",
          category: "orderUpdate",
        });
        await notification.save();
        console.log("In-app notification created for order status update.");
      } catch (error) {
        console.error(
          "Error sending order status update email or creating notification:",
          error
        );
      }

      // Notify all admins about the order status update
      const admins = await User.find({ roles: "admin" });
      for (const admin of admins) {
        const adminNotification = new Notification({
          userId: admin._id,
          message: `Order ${order._id} status updated to ${
            deliveryStatus || paymentStatus
          }.`,
          type: "admin",
          category: "adminActivity",
        });
        await adminNotification.save();
      }

      res.json(order);
    } catch (err) {
      console.error("Error updating order status:", err.message);
      res.status(500).send("Server error");
    }
  }
);

// Delete an Order (Admins Only)
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ msg: "Order not found" });
      }

      await Order.findByIdAndDelete(req.params.id);

      // Create in-app notification for order deletion
      const notification = new Notification({
        userId: order.userId,
        message: `Your order with ID ${order._id} has been deleted by the admin.`,
        type: "order",
        category: "orderUpdate",
      });
      await notification.save();

      // Notify all admins about the order deletion
      const admins = await User.find({ roles: "admin" });
      for (const admin of admins) {
        const adminNotification = new Notification({
          userId: admin._id,
          message: `Order with ID ${order._id} has been deleted.`,
          type: "admin",
          category: "adminActivity",
        });
        await adminNotification.save();
      }

      res.json({ msg: "Order deleted successfully" });
    } catch (err) {
      console.error("Error deleting order:", err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
