// utils/email.js
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
require("dotenv").config();

// Create transporter for Gmail
const gmailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
});

// Function to read and compile template
const compileTemplate = (templateName, templateData) => {
  const templatePath = path.join(
    __dirname,
    `../templates/${templateName}.html`
  );
  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);
  return template(templateData);
};

// Function to send email
const sendEmail = async (options) => {
  try {
    // Always use the Gmail transporter
    const transporter = gmailTransporter;

    // Check if template is provided and compile it
    let htmlContent = options.html;
    if (options.template) {
      // Make a safe copy of template data to avoid Handlebars prototype access issues
      const safeTemplateData = JSON.parse(JSON.stringify(options.templateData));
      htmlContent = compileTemplate(options.template, safeTemplateData);
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: htmlContent, // Use compiled HTML content
    });
    console.log(`Email sent to: ${options.to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendEmail,
};
