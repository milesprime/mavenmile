// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderDetails: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,

    default: "Pending",
  },
  deliveryStatus: {
    type: String,

    default: "Processing",
  },
  paymentStatusHistory: [
    {
      status: String,
      timestamp: Date,
    },
  ],
  deliveryStatusHistory: [
    {
      status: String,
      timestamp: Date,
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
