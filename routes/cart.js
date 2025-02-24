// routes/cart.js
const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Helper function to calculate totals
const calculateCartTotals = async (cart) => {
  let totalQuantity = 0;
  let totalAmount = 0;

  for (let item of cart.products) {
    const product = await Product.findById(item.productId);
    totalQuantity += item.quantity;
    totalAmount += product.price * item.quantity;
  }

  cart.totalQuantity = totalQuantity;
  cart.totalAmount = totalAmount;
};

// Add Product to Cart
router.post("/add", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    // Check if the cart exists, if not create one
    if (!cart) {
      cart = new Cart({ userId, products: [] });
    }

    // Check if product already exists in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex >= 0) {
      // Update quantity of the existing product in cart
      cart.products[productIndex].quantity += quantity;
    } else {
      // Add new product to the cart
      cart.products.push({ productId, quantity });
    }

    // Recalculate total quantity and total amount
    await calculateCartTotals(cart);

    await cart.save();

    // Save cart data in a cookie for persistence
    res.cookie("cart", JSON.stringify(cart.products), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Get User Cart (from DB or Cookie)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Check if the cart exists in the database
    let cart = await Cart.findOne({ userId: req.user.id }).populate(
      "products.productId"
    );

    // If no cart found in DB, try to retrieve from cookie
    if (!cart) {
      const cartCookie = req.cookies.cart;
      if (cartCookie) {
        cart = {
          userId: req.user.id,
          products: JSON.parse(cartCookie),
        };
      } else {
        return res.status(404).json({ msg: "Cart not found" });
      }
    }

    res.json(cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Update Product Quantity in Cart
router.put("/update", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // Check if product exists in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex >= 0) {
      // Update the quantity of the existing product
      cart.products[productIndex].quantity = quantity;

      // Recalculate total quantity and total amount
      await calculateCartTotals(cart);

      await cart.save();

      // Save updated cart data in a cookie for persistence
      res.cookie("cart", JSON.stringify(cart.products), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json(cart);
    } else {
      return res.status(404).json({ msg: "Product not found in cart" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Remove Product from Cart
router.delete("/remove", authMiddleware, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ msg: "Cart not found" });
    }

    // Check if product exists in the cart
    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if (productIndex >= 0) {
      // Remove the product from the cart
      cart.products.splice(productIndex, 1);

      // Recalculate total quantity and total amount
      await calculateCartTotals(cart);

      await cart.save();

      // Save updated cart data in a cookie for persistence
      res.cookie("cart", JSON.stringify(cart.products), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(200).json(cart);
    } else {
      return res.status(404).json({ msg: "Product not found in cart" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Sync Cart with Cookie (when user logs in)
router.post("/sync", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    let cart = await Cart.findOne({ userId });

    // Check if cart exists in the cookie
    const cartCookie = req.cookies.cart;
    if (cartCookie) {
      const cookieCartProducts = JSON.parse(cartCookie);

      if (!cart) {
        // Create new cart if none exists in the database
        cart = new Cart({
          userId,
          products: cookieCartProducts,
        });
      } else {
        // Merge cookie cart with existing cart in database
        for (const cookieProduct of cookieCartProducts) {
          const productIndex = cart.products.findIndex(
            (product) =>
              product.productId.toString() === cookieProduct.productId
          );

          if (productIndex >= 0) {
            // Update quantity of existing product
            cart.products[productIndex].quantity += cookieProduct.quantity;
          } else {
            // Add new product to cart
            cart.products.push(cookieProduct);
          }
        }
      }

      // Recalculate total quantity and total amount
      await calculateCartTotals(cart);
      await cart.save();

      // Clear the cart cookie as it's now synced with the database
      res.clearCookie("cart");
      res.status(200).json({ msg: "Cart synchronized successfully", cart });
    } else {
      res.status(200).json({ msg: "No cart data found in cookies" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
