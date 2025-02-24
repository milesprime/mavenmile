// models/NewsletterSubscriber.js

const mongoose = require("mongoose");

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Subscribed", "Unsubscribed"],
    default: "Subscribed",
  },
});

module.exports = mongoose.model(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema
);
