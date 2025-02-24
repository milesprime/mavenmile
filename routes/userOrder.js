// routes/userOrder.js

const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product"); // Import the Product model
const Notification = require("../models/Notification"); // Import the Notification model
const authMiddleware = require("../middleware/authMiddleware");
const { sendEmail } = require("../utils/email");
const router = express.Router();

// Create an Order (User)
router.post("/", authMiddleware, async (req, res) => {
  const { orderDetails } = req.body;

  try {
    // Fetch complete product details for each product in the order
    const populatedOrderDetails = await Promise.all(
      orderDetails.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          productId: product._id,
          productName: product.name, // Include product name
          quantity: item.quantity,
          price: product.price, // Include product price
        };
      })
    );

    // Calculate the total amount
    const totalAmount = populatedOrderDetails.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);

    const newOrder = new Order({
      userId: req.user.id,
      orderDetails: populatedOrderDetails, // Use populated order details
      totalAmount,
      paymentStatusHistory: [{ status: "Pending", timestamp: new Date() }],
      deliveryStatusHistory: [{ status: "Processing", timestamp: new Date() }],
    });

    await newOrder.save();
    console.log(newOrder);
    // Fetch user details to send the confirmation email
    const user = await User.findById(req.user.id);
    const templateData = {
      firstName: user.firstName,
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
      orderDetails: newOrder.orderDetails, // Send complete order details
    };

    try {
      // Send Order Confirmation Email
      await sendEmail({
        to: user.email,
        subject: "Order Confirmation - UpTech",
        template: "orderConfirmation", // Use the order confirmation template
        templateData,
        service: "gmail", // Use Gmail service
      });
      console.log("Order confirmation email sent to:", user.email);

      // Create in-app notification for order creation
      const notification = new Notification({
        userId: user._id,
        message: `Your order with ID ${newOrder._id} has been successfully placed.`,
        type: "order",
        category: "orderCreation",
      });
      await notification.save();
      console.log("In-app notification created for order creation.");
    } catch (error) {
      console.error(
        "Error sending order confirmation email or creating notification:",
        error
      );
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).send("Server error");
  }
});

// Get All Orders for a User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).send("Server error");
  }
});

// Get a Single Order by ID for a User
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    console.error("Error fetching order:", err.message);
    res.status(500).send("Server error");
  }
});

// Cancel an Order (User)
router.put("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    let order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    // Update delivery status to 'Cancelled'
    order.deliveryStatusHistory.push({
      status: "Cancelled",
      timestamp: new Date(),
    });
    order.deliveryStatus = "Cancelled";
    await order.save();

    // Create in-app notification for order cancellation
    const notification = new Notification({
      userId: order.userId,
      message: `Your order with ID ${order._id} has been successfully cancelled.`,
      type: "order",
      category: "orderCancellation",
    });
    await notification.save();
    console.log("In-app notification created for order cancellation.");

    res.json(order);
  } catch (err) {
    console.error("Error cancelling order:", err.message);
    res.status(500).send("Server error");
  }
});

// Get Order Status (User)
router.get("/:id/status", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }
    res.json({
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      deliveryStatus: order.deliveryStatus,
    });
  } catch (err) {
    console.error("Error fetching order status:", err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
