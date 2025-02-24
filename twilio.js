// test-twilio.js
require("dotenv").config(); // This loads environment variables from .env file

console.log("Twilio SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio Phone Number:", process.env.TWILIO_PHONE_NUMBER);

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages
  .create({
    body: "Hello from Node.js!",
    from: process.env.TWILIO_PHONE_NUMBER,
    to: "+16318336759", // Replace with your phone number
  })
  .then((message) => console.log(`Message sent: ${message.sid}`))
  .catch((error) => console.error("Error sending message:", error.message));
