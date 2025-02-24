const express = require("express");
const router = express.Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/", (req, res) => {
  res.send("Homepage");
});

router.post("/checkout", async (req, res) => {
  try {
    //This is how we would actally get the products and the currency
    const { products, currency } = req.body;

    //Hardcoded products and currency
    //const products = [{ name: "Orange", price: 2, quantity: 6 }];
    //const currency = "usd";
    const lineItems = products.map((product) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100,
      },
      quantity: product.quantity,
    }));
    console.log(lineItems);
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/api/payments/success",
      cancel_url: "http://localhost:3000/api/payments/cancel",
    });
    console.log(session.url);
    res.redirect(session.url);
  } catch (error) {
    console.log("Internal Error: ", error);
    res.status(500).send(`Internal Server Error: ${error} `);
  }
});

router.get("/success", (req, res) => {
  res.send("Your payment was successfully fulfilled!");
});

router.get("/cancel", (req, res) => {
  console.log("Payment was cancelled!");
  res.redirect("/");
});

module.exports = router;
