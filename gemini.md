# ShopNest Project Guide & Developer Hand-off

Welcome! This document is designed for developers (or Gemini AI coding agents) resuming work on the **ShopNest** full-stack e-commerce project. It contains details about the project structure, configuration, security flows, identified bugs/discrepancies, and immediate action items.

---

## 📂 Project Overview & Structure

ShopNest is structured as a monorepo containing a Node.js/Express backend, with an empty placeholder for the React frontend.

### Directory Structure

```text
shopnest-self/
├── README.md             <- High-level description of ShopNest features & tech stack
├── gemini.md             <- This developer guide
├── frontend/             <- [EMPTY] Intended for React, Redux Toolkit, Tailwind app
└── backend/              <- Node.js & Express REST API
    ├── .env              <- Environment configuration variables
    ├── index.js          <- Express application entry point
    ├── config/           <- Database and third-party API configurations
    ├── controllers/      <- Request handlers
    ├── middleware/       <- Express custom middlewares (auth, admin, etc.)
    ├── model/            <- Mongoose database schemas
    ├── routes/           <- REST API route definitions
    └── utils/            <- Supporting helper utilities (token generation, nodemailer)
```

---

## 🛠️ Configuration & Environment Variables

The backend is configured to use several third-party integrations (Nodemailer, Cloudinary, MongoDB, and JWT secrets) via the environment file [backend/.env](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/.env).

Key configurations currently defined:
- **`PORT`**: 5000 (port on which the server listens).
- **`MONGO_URI`**: Local MongoDB connection string (`mongodb://localhost:27017/`).
- **`EMAIL_USER` & `EMAIL_PASS`**: Gmail address and App Password used by Nodemailer.
- **`JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`**: Secrets used to sign access and refresh tokens.
- **`CLOUDINARY_*`**: Credentials for cloud media storage.

---

## 🔒 Authentication & Session Flow

The authentication system implemented in the backend relies on double token validation (Access Token in cookies/headers + Refresh Token in cookies) with secure hashing stored in the database.

1. **Registration**: 
   - User posts to `registerUser` in [authController.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/controllers/authController.js#L33).
   - A random 6-digit verification OTP is generated and emailed to the user via [sendMail.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/utils/sendMail.js#L15).
   - User state is set to `verified: false`.
2. **OTP Verification**:
   - User submits the OTP to `verifyOtp` in [authController.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/controllers/authController.js#L77).
   - Upon verification, the user's status becomes `verified: true`, and access/refresh tokens are generated via `generateAccessToken` & `generateRefreshToken` inside [tokenUtils.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/utils/tokenUtils.js).
   - SHA-256 hashes of the access and refresh tokens (`accessTokenHash`, `refreshTokenHash`) are saved in the user's document using `hashToken` ([tokenUtils.js:L23](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/utils/tokenUtils.js#L23)).
   - Tokens are set as HTTP-only cookies: `accessToken` (15-minute lifespan) and `refreshToken` (7-day lifespan).
3. **Session Verification (Middleware)**:
   - Protected routes use `protect` in [authMiddleware.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/middleware/authMiddleware.js#L7).
   - The middleware verifies the JWT signature and then queries the database to ensure the token hash matching the incoming token is still active on the user model (`accessTokenHash`).
4. **Token Refresh**:
   - The route `/api/token/refresh` matches `refreshToken` in [tokenController.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/controllers/tokenController.js#L9).
   - The valid refresh token cookie/body is hashed and matched with the stored `refreshTokenHash` to issue a new access token.

---

## 🚨 Critical Bugs & Discrepancies

### Resolved Issues
- [x] **SyntaxError in `orders.js` Model (CJS vs. ESM)**: Converted ES Module syntax to CommonJS in [orders.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/model/orders.js).
- [x] **Missing Routes and Controllers**: Created placeholder files for `user`, `product`, and `cart` routes and controllers so the server registers them without throwing `Cannot find module` error.
- [x] **Order Controller Implementation**: Implemented `createOrder` inside [orderController.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/controllers/orderController.js) and resolved reference errors in [orderRoutes.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/routes/orderRoutes.js).
- [x] **Security Vulnerability in Order Creation**: Secured the `/create-order` endpoint in [orderRoutes.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/routes/orderRoutes.js) with the `protect` middleware, and changed [orderController.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/controllers/orderController.js) to retrieve the `userId` directly from `req.user._id` (and user's email via `req.user.email` for nodemailer confirmation) rather than trusting client-provided input.
- [x] **Case-Sensitive Mongoose References**: Updated references from lowercased to capitalized `'User'` and `'Product'` in [orders.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/model/orders.js) to align with correct case-sensitive model registry naming conventions.
- [x] **Error Handling for validation and casting**: Upgraded error handling in [orderController.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/controllers/orderController.js) to intercept Mongoose validation and cast errors, returning `400 Bad Request` with appropriate messages instead of throwing generic `500` server errors.


### Active Issues / Bugs
#### 1. Admin Middleware Logical Bug
- **File**: [adminMiddleware.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/middleware/adminMiddleware.js)
- **Problem**: The middleware checks `if (req.user && req.user.isAdmin)` (L2). However, the [user.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/model/user.js) model schema does not have an `isAdmin` property. Instead, it defines roles using `role: { type: String, enum: ["user", "admin"] }`.
- **Impact**: The admin check will always evaluate to falsy, and valid admin users will be blocked with "Access denied, admin only".
- **Fix**: Update the condition to `if (req.user && req.user.role === 'admin')`.

---

## 📈 Next Steps & Development Roadmap

When you are ready to continue building:

1. **Stabilize the Backend**:
   - Fix the role-based auth condition in [adminMiddleware.js](file:///C:/Users/Chirag/Desktop/New%20folder/shopnest-self/backend/middleware/adminMiddleware.js).

2. **Implement Missing Core Models**:
   - Create a `Product` model (referred to by the Order schema).
   - Create a `Cart` model (or store cart data in local storage or Redis, depending on requirements).

3. **Scaffold the Frontend**:
   - Initialize a React + Tailwind application inside `/frontend` using Vite:
     ```bash
     npx -y create-vite@latest frontend --template react
     ```
   - Set up Redux Toolkit for global shopping cart and auth state.
   - Configure a proxy in Vite config to forward `/api` calls to `http://localhost:5000`.
