// models/Product.js

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: [true, "Description is required, can not be blank"],
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    ref: "Category",
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    required: true, // Change to true if image is required for all products
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
