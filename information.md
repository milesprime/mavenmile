//1.1. Set Up User Model and Authentication Routes
//1. Create a New File User.js in the models Directory
//2. Create the auth.js Route File in the routes Directory
//3. Create the server.js File to Use Authentication Routes
//4. Test the Authentication Routes with postman
//5. Verify the JWT token and login process works as expected
//1.2 Implementing Email Verification
//1. Install nodemailer
//2. Update User Model to include verificationToken and it's expected fields
//3. Update auth.js to include email verification logic
//4. Test and Verify Email Verification Works
//4. Update auth.js to include phone verification logic
//5. Test and Verify Phone Verification Works
//2.1 Implementing User Profile Management
//1. Create user.js Controller, that's inside routes directory
//2. Allow users to update their profile information
//3. Allow users/admin to delete their account
//2.2 Implementing Product Management
//1. Create a new file Product.js inside the models directory
//2. Install multer for handling multipart/form-data, which is essential for file upload in Node.js
//3. Create a new file product.js inside the routes directory
//4. Add Product Management Routes to the server.js file
//5. Create an uploads folder to store product images
//6. Test Product Management Routes with Postman
//7. Create Role based access for Product management
//3.1 Implementing Cart Management
//1. Create Cart.js in models and cart.js in routes directory
//2. add cart related routes to server.js
//3. Create a helper function to calculate totals
//4. Test the cart routes with postman
//5. Create Role based access for Cart management
//3.2 Implementing Order Management
//1. Create the Order.js in models directory
//2. Create userOrder.js in routes directory
//3. Create adminOrder.js in routes directory
//4. Add Order related routes to server.js
//6. Test the order routes with postman
//7. Create Role based access for Order management
//4.1 Implementing Stripe Payment
//1. Install stripe
//2. Create payment.js in the routers directory
//3. Add Stripe Payment Routes to server.js
//4. Test Stripe Payment with Postman
//5. Note: Stripe requires frontend and backend to be connected
//4.2 Implementing Search and Filter
//1. Create search and filter routes for products
//2. Create search and filter routes for orders
//3. Create search and filter routes for users
//5.1 Implementing Contact us form
//1. Create Contact.js Collection model
//2. Create contact.js in routes directory
//3. Update route in server.js
//4. Create Admin API for viewing Inquiries
//5. Create adminContact.js in routes directory
//6. Ensure the new route file is in server.js
//7. Test the APIs
//5.2 Implementing Email and Notification System
//1. Create controllers and utils folder
//2. Configure Nodemailer for outlook
//3. Create the Email Sending functionality
//4. Send Order Confirmation Email
//5. Send Order Status Update Email
//6. Send Emails on Contact Form Submission
//7. Create utils/email.js and templates folder for email templates
//8. Install handlebars library
//9. Create transporter and send email functionality
//10. Create the logic and route for testing and sending emails in auth.js
//11. Implement contact-us email notification for admin in auth.js
//12. Implement orderconfirmation email notification for user in userOrder.js
//13. Implement orderStatusUpdate email notification after admin make the update
//14. Implement passwordReset notification email and create a password reset token to do that
//15. Implement newsletter subscription notification, the confirmation for it by creating newsletter subscription and the monthly newsletter by creating newsletter.html template
//6.1. Implement In App-Notification System
//1. Create Notification Schema
//2. Implement Order Status Notification for admin and user
//3. Implement register notification
//4. Implement Admin notification
//6.2. Implement Cookie system

1.
