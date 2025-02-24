# UpTech E-commerce API Documentation

Welcome to the official backend API documentation for the **UpTech E-commerce Project**. This API is built with Node.js, Express, and MongoDB, featuring functionalities such as user authentication, product management, shopping cart operations, order processing, payment integration with Stripe, in-app notifications, and analytics tracking using cookies.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Project Setup](#project-setup)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Product Management](#product-management)
  - [Shopping Cart](#shopping-cart)
  - [Order Management](#order-management)
  - [Payment Integration](#payment-integration)
  - [Notifications](#notifications)
  - [Promotions](#promotions)
- [Middleware](#middleware)
- [Security Features](#security-features)
- [Analytics & Tracking](#analytics--tracking)
- [Testing & Debugging](#testing--debugging)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used

- **Node.js**: JavaScript runtime environment for building scalable network applications.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB**: NoSQL database for storage and management of data.
- **Stripe**: Payment processing platform for e-commerce transactions.
- **JWT (JSON Web Tokens)**: For secure user authentication and session management.
- **Cookies**: For tracking and maintaining user sessions, preferences, and analytics.

## Project Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/your-username/uptech-ecommerce-api.git
   cd uptech-ecommerce-api
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add the following:

   ```env
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   EMAIL_USER=your_email_username
   EMAIL_PASSWORD=your_email_password
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

4. **Start the Server:**
   ```bash
   npm start
   ```
   The API will be accessible at `http://localhost:3000`.

## API Endpoints

### Authentication

1. **User Registration:**

   - **Endpoint:** `POST /api/auth/register`
   - **Description:** Registers a new user and sends verification emails.
   - **Request Body:**
     ```json
     {
       "firstName": "John",
       "lastName": "Doe",
       "email": "john.doe@example.com",
       "password": "securepassword",
       "phoneNumber": "1234567890"
     }
     ```
   - **Response:**
     ```json
     {
       "msg": "Registration successful. Please verify your email and phone number."
     }
     ```

2. **User Login:**

   - **Endpoint:** `POST /api/auth/login`
   - **Description:** Authenticates a user and sets an auth token in a secure cookie.
   - **Request Body:**
     ```json
     {
       "email": "john.doe@example.com",
       "password": "securepassword"
     }
     ```
   - **Response:**
     ```json
     {
       "msg": "Logged in successfully"
     }
     ```

3. **User Logout:**

   - **Endpoint:** `POST /api/auth/logout`
   - **Description:** Logs out the user by clearing the auth token cookie.
   - **Response:**
     ```json
     {
       "msg": "Logged out successfully"
     }
     ```

4. **Email Verification:**

   - **Endpoint:** `GET /api/auth/verify-email`
   - **Description:** Verifies user email using a token.
   - **Query Parameters:** `token`, `id`

5. **Password Reset Request:**

   - **Endpoint:** `POST /api/auth/request-password-reset`
   - **Description:** Sends a password reset link to the user’s email.

6. **Password Reset:**
   - **Endpoint:** `POST /api/auth/reset-password/:token`
   - **Description:** Resets the user’s password using a reset token.

### User Management

1. **Get User Profile:**

   - **Endpoint:** `GET /api/users/profile`
   - **Description:** Retrieves the authenticated user’s profile.

2. **Update User Profile:**
   - **Endpoint:** `PUT /api/users/profile`
   - **Description:** Updates the authenticated user’s profile.

### Product Management

1. **Get All Products:**

   - **Endpoint:** `GET /api/products`
   - **Description:** Retrieves a list of all available products.

2. **Get Single Product:**

   - **Endpoint:** `GET /api/products/:id`
   - **Description:** Retrieves details of a single product by ID.

3. **Admin: Add Product:**

   - **Endpoint:** `POST /api/admin/products`
   - **Description:** Adds a new product to the catalog. Requires admin authentication.

4. **Admin: Update Product:**

   - **Endpoint:** `PUT /api/admin/products/:id`
   - **Description:** Updates an existing product’s details.

5. **Admin: Delete Product:**
   - **Endpoint:** `DELETE /api/admin/products/:id`
   - **Description:** Deletes a product from the catalog.

### Shopping Cart

1. **Add to Cart:**

   - **Endpoint:** `POST /api/cart/add`
   - **Description:** Adds a product to the user’s cart.
   - **Request Body:**
     ```json
     {
       "productId": "product_id",
       "quantity": 2
     }
     ```

2. **Get User Cart:**

   - **Endpoint:** `GET /api/cart`
   - **Description:** Retrieves the current user’s cart.

3. **Update Cart:**

   - **Endpoint:** `PUT /api/cart/update`
   - **Description:** Updates the quantity of a product in the cart.

4. **Remove from Cart:**
   - **Endpoint:** `DELETE /api/cart/remove`
   - **Description:** Removes a product from the user’s cart.

### Order Management

1. **Create Order:**

   - **Endpoint:** `POST /api/user/orders`
   - **Description:** Creates a new order for the authenticated user.

2. **Get User Orders:**

   - **Endpoint:** `GET /api/user/orders`
   - **Description:** Retrieves all orders for the authenticated user.

3. **Admin: Manage Orders:**

   - **Endpoint:** `GET /api/admin/orders`
   - **Description:** Retrieves all orders. Requires admin authentication.

4. **Admin: Update Order Status:**
   - **Endpoint:** `PUT /api/admin/orders/:id/status`
   - **Description:** Updates the status of a specific order.

### Payment Integration

1. **Stripe Checkout:**

   - **Endpoint:** `POST /api/payments/checkout`
   - **Description:** Creates a Stripe payment session and redirects to Stripe’s checkout page.
   - **Request Body:**
     ```json
     {
       "products": [{ "name": "Product 1", "price": 1000, "quantity": 1 }],
       "currency": "usd"
     }
     ```
   - **Response:** Redirects to the Stripe checkout page.

2. **Payment Success:**

   - **Endpoint:** `GET /api/payments/success`
   - **Description:** Confirms successful payment.

3. **Payment Cancellation:**
   - **Endpoint:** `GET /api/payments/cancel`
   - **Description:** Handles payment cancellation.

### Notifications

1. **Get User Notifications:**

   - **Endpoint:** `GET /api/notifications`
   - **Description:** Retrieves all notifications for the authenticated user.

2. **Mark Notification as Read:**
   - **Endpoint:** `PUT /api/notifications/:id`
   - **Description:** Marks a notification as read.

### Promotions

1. **Admin: Send Promotion:**
   - **Endpoint:** `POST /api/promotions/send`
   - **Description:** Sends a promotional message to all users. Requires admin authentication.

## Middleware

- **authMiddleware.js**: Manages user authentication and role-based access control.
  - **isAdmin**: Ensures the user has admin privileges.
  - **authMiddleware**: Verifies JWT token and user roles.

## Security Features

- **Secure Cookies**: Auth tokens are stored in secure, HttpOnly cookies with `sameSite` set to `strict` to prevent CSRF.
- **Password Hashing**: All passwords are hashed using bcrypt before being stored.
- **Email Verification**: Users must verify their email before logging in.

## Analytics & Tracking

- **User Behavior Tracking**: Logs user activities such as registration, login, and cart interactions for analytics.
- **A/B Testing**: Utilizes cookies to segment user groups and test feature variations.

## Testing & Debugging

1. **Postman**: Use Postman for testing API endpoints.
   - Set up environment variables.
   - Test each route individually using the provided request

and response formats.

2. **Error Handling**: Each route has error handling mechanisms to provide meaningful error messages for debugging.

## Contributing

We welcome contributions from the community! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

For any questions or issues, feel free to raise an issue on this repository or contact the project maintainers.

Happy coding! 🚀

---

This detailed `README.md` provides a comprehensive guide for developers and contributors, outlining the UpTech API functionalities, usage, and development practices.
