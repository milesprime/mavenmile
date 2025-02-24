const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// Search and Filter Products (Public)
router.get("/search", async (req, res) => {
  const { name, category, minPrice, maxPrice, isFeatured } = req.query;
  const query = {};

  if (name) {
    query.name = { $regex: name, $options: "i" }; // Case-insensitive search
  }
  if (category) {
    query.category = { $regex: category, $options: "i" }; // Case-insensitive category search
  }
  if (minPrice) {
    query.price = { $gte: parseFloat(minPrice) };
  }
  if (maxPrice) {
    query.price = query.price || {};
    query.price.$lte = parseFloat(maxPrice);
  }
  if (isFeatured) {
    query.isFeatured = isFeatured === "true"; // Convert to boolean
  }

  try {
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get All Products (Public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get Single Product by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
