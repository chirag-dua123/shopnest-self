# ShopNest Project Guide & Developer Hand-off

Welcome! This document provides an updated reference for developers and agents working on the **ShopNest** full-stack e-commerce project.

---

## 📂 Project Overview & Structure

ShopNest is structured as a full-stack monorepo containing a Node.js/Express backend and a modern React + Vite + Redux Toolkit + Tailwind CSS frontend.

### Directory Structure

```text
shopnest-self/
├── README.md             <- High-level description of features, tech stack & setup
├── gemini.md             <- This developer guide
├── frontend/             <- React 18, Vite, Redux Toolkit, Tailwind CSS frontend
│   ├── src/
│   │   ├── api/          <- Axios client configured with withCredentials & Vite proxy
│   │   ├── app/          <- Redux Store config
│   │   ├── components/   <- UI components (Header, Footer, Rating, ProductCard, Filters, etc.)
│   │   ├── features/     <- Redux slices (authSlice, productSlice, cartSlice, orderSlice)
│   │   ├── pages/        <- Catalog, Product Detail, Cart, Checkout, Order, Auth & Admin views
│   │   ├── App.jsx       <- React Router DOM routing & layouts
│   │   └── main.jsx      <- Entry point
│   ├── tailwind.config.js
│   └── vite.config.js    <- Configured with proxy for /api -> http://localhost:5000
└── backend/              <- Node.js & Express REST API
    ├── .env.example      <- Environment variable template
    ├── index.js          <- Express application entry point
    ├── config/           <- Database and Cloudinary configurations
    ├── controllers/      <- Request handlers (auth, product, cart, order, payment, analytics)
    ├── middleware/       <- Express custom middlewares (protect, admin)
    ├── model/            <- Mongoose database schemas (User, Product, Cart, Order, Review)
    ├── routes/           <- REST API route definitions
    └── utils/            <- Token generation, Nodemailer, Cloudinary streams
```

---

## 🔒 Authentication & Session Flow

The authentication system implemented in the backend relies on double token validation (Access Token in cookies/headers + Refresh Token in cookies) with secure hashing stored in the database.

1. **Registration**: 
   - User posts to `registerUser` in `backend/controllers/authController.js`.
   - A random 6-digit verification OTP is generated and emailed to the user.
2. **OTP Verification**:
   - User submits the OTP to `verifyOtp`.
   - Access & refresh tokens are generated and stored as HTTP-only cookies (`accessToken` & `refreshToken`).
   - The user record is updated to `verified: true`.
3. **Session Verification (Middleware)**:
   - Protected routes use `protect` in `backend/middleware/authMiddleware.js`.
   - The middleware verifies the JWT signature and then queries the database to ensure the token hash matching the incoming token is active.
4. **Token Refresh**:
   - The route `/api/token/refresh` matches `refreshToken` in `backend/controllers/tokenController.js` and issues a fresh access token cookie.
   - The frontend Axios interceptor automatically calls this endpoint when receiving a `401 Unauthorized`.

---

## 💻 Frontend Architecture

- **State Management**:
  - `authSlice`: Handles login, register, verify-otp, forgot-password, reset-password, logout, profile update.
  - `productSlice`: Handles fetching catalog with query params (keyword, category, min/max price, sorting, pagination), single product lookup, and admin CRUD actions.
  - `cartSlice`: Manages shopping cart state, synchronizes with `/api/cart` when logged in, and persists to `localStorage` for guests.
  - `orderSlice`: Handles order placement (`/api/orders`), order history (`/api/orders/myorders`), order tracking, admin status updates, and Razorpay payment initialization & signature verification.
- **Routing**:
  - Protected routes are guarded by `<ProtectedRoute>` which checks user session.
  - Admin routes (`/admin`, `/admin/products`, `/admin/orders`) verify `user.role === 'admin'`.

---

## 🚀 Running the Project

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   node seed.js # (Optional) Seeds admin & demo products
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Visit `http://localhost:5173` in your browser. All `/api` requests will proxy smoothly to the backend on `http://localhost:5000`.
