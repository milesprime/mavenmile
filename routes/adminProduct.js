const express = require("express");
const multer = require("multer");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create a New Product (Admins Only)
router.post(
  "/",
  authMiddleware,
  authMiddleware.isAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, description, price, category, stock, isFeatured } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
      // Validate required fields
      if (!name || !description || !price || !category || !stock) {
        return res.status(400).json({ msg: "All fields are required" });
      }

      const newProduct = new Product({
        name,
        description,
        price,
        category,
        stock,
        isFeatured,
        image,
      });

      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Update a Product (Admins Only)
router.put(
  "/:id",
  authMiddleware,
  authMiddleware.isAdmin,
  upload.single("image"),
  async (req, res) => {
    const { name, description, price, category, stock, isFeatured } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
      let product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ msg: "Product not found" });
      }

      const updatedProduct = {
        name,
        description,
        price,
        category,
        stock,
        isFeatured,
      };

      if (image) {
        updatedProduct.image = image;
      }

      product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updatedProduct },
        { new: true }
      );

      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Delete a Product (Admins Only)
router.delete(
  "/:id",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
    try {
      // Use findByIdAndDelete to delete the product by its ID
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ msg: "Product not found" });
      }

      res.json({ msg: "Product deleted successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// Search and Filter Products (Admins Only)
router.get(
  "/search",
  authMiddleware,
  authMiddleware.isAdmin,
  async (req, res) => {
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
  }
);

module.exports = router;

module.exports = router;
