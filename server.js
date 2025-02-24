// server.js

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Product = require("./models/Product");
const activityLogger = require("./middleware/activityLogger");
const userActivityMiddleware = require("./middleware/userActivityMiddleware");
const { isAuth } = require("./middleware/authMiddleware.js");

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser()); // Use cookie-parser middleware

// Apply the activity logger middleware
app.use(activityLogger);

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.post("/test", async (req, res) => {
  const { name, description, price, category, stock, isFeatured } = req.body;

  console.log(description, price, category, isFeatured, "data body !!!!");
  res.send({ description, name, price });
});
// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // Exits the server if the connection fails
  }
};

connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/admin/users", require("./routes/adminUsers"));
app.use("/api/products", require("./routes/product"));
app.use("/api/admin/products", require("./routes/adminProduct"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/user/orders", require("./routes/userOrder"));
app.use("/api/admin/orders", require("./routes/adminOrder"));
app.use("/api/payments", require("./routes/payment"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/admin/contact", require("./routes/adminContact"));
app.use("/api/notifications", require("./routes/notification"));
app.use("/api/newsletter", require("./routes/newsletter"));
app.use("/api/promotions", require("./routes/promotion"));
app.use("/api/preferences", require("./routes/preferences"));

// Basic Route
app.get("/", (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || "https://uptech.onrender.com";
  res.send(`
    <h1>Uptech E-commerce API Documentation</h1>
    <p>The API is live and ready to use. Below is the list of available endpoints:</p>
    <table border="1" cellpadding="10" cellspacing="0">
      <thead>
        <tr>
          <th>Method</th>
          <th>Endpoint</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/auth/register</td>
          <td>Register a new user</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/auth/login</td>
          <td>Login a user</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/auth/logout</td>
          <td>Logout a user</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/auth/verify-email</td>
          <td>Verify user email</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/auth/verify-phone</td>
          <td>Verify user phone</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/auth/request-password-reset</td>
          <td>Request password reset</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/auth/reset-password/:token</td>
          <td>Reset password with token</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/users</td>
          <td>Retrieve all users</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/admin/users</td>
          <td>Manage admin users</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/products</td>
          <td>Retrieve all products</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/admin/products</td>
          <td>Manage products as admin</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/cart</td>
          <td>Manage user cart</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/user/orders</td>
          <td>Retrieve user orders</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/admin/orders</td>
          <td>Manage orders as admin</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/payments</td>
          <td>Process payments</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/contact</td>
          <td>Submit contact form</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/admin/contact</td>
          <td>Manage contact submissions as admin</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/notifications</td>
          <td>Retrieve user notifications</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/newsletter</td>
          <td>Subscribe to newsletter</td>
        </tr>
        <tr>
          <td>GET</td>
          <td>${baseUrl}/api/promotions</td>
          <td>Retrieve promotions</td>
        </tr>
        <tr>
          <td>POST</td>
          <td>${baseUrl}/api/preferences</td>
          <td>Update user preferences</td>
        </tr>
      </tbody>
    </table>
  `);
});

app.use(userActivityMiddleware);

// Server Setup
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
