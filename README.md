# ShopNest E-Commerce Platform

ShopNest is a production-grade, full-stack e-commerce application built using the **MERN** stack (MongoDB, Express.js, React, Node.js). It features end-to-end shopping workflows, including OTP-verified authentication, dynamic product catalog filtering, server-synchronized cart management, Razorpay checkout, and an Admin control panel.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Catalog & Search**: Instant keyword search, category filtering, min/max price bounds, and sorting (Newest, Price: Low-High, Price: High-Low, Oldest).
- **Product Details**: High-resolution image previews, real-time stock availability, star ratings, and direct "Buy Now" flow.
- **Cart & Persistence**: Global Redux Toolkit cart with guest local storage fallback and automatic server sync (`/api/cart`) on login.
- **Checkout & Orders**: Multi-step checkout with delivery address capture, payment method selection, order tracking, and order history.
- **Payment Gateway**: Integrated with Razorpay for secure payments and server-side cryptographic signature verification.
- **Authentication**: JWT access & refresh tokens in HTTP-only cookies, 6-digit email OTP verification, and secure password reset flow.

### 🛡️ Admin Dashboard
- **Analytics Overview**: Real-time cards displaying total revenue, total order count, active products, and registered customers via `/api/analytics/admin-stats`.
- **Product Management**: Full CRUD interface for catalog items with Cloudinary media uploads via Multer and Node streams.
- **Order Logistics**: Review incoming orders, customer delivery destinations, and update delivery states (`Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Redux Toolkit, React Router DOM v6, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js (v5)
- **Database**: MongoDB with Mongoose ODM
- **Third-Party Services**: Razorpay (Payments), Cloudinary (Image CDN), Nodemailer (Gmail SMTP OTPs)

---

## 📂 Project Structure

```text
shopnest-self/
├── backend/
│   ├── config/              # MongoDB & Cloudinary configuration
│   ├── controllers/         # Request controllers (auth, cart, order, product, payment, analytics)
│   ├── middleware/          # JWT protect and Admin authorization middlewares
│   ├── model/               # Mongoose schemas (User, Product, Cart, Order, Review)
│   ├── routes/              # Express API route endpoints
│   ├── utils/               # Nodemailer, Cloudinary streams, JWT & crypto helpers
│   ├── .env.example         # Reference environment variables
│   ├── seed.js              # Database seeder script
│   └── index.js             # Express app entry point
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance with credentials & interceptors
    │   ├── app/             # Redux store configuration
    │   ├── components/      # Common UI components, Header, Footer, ProductCards
    │   ├── features/        # Redux slices (auth, products, cart, orders)
    │   ├── pages/           # Customer pages, Auth views, Admin management views
    │   ├── App.jsx          # App routing and layout
    │   └── main.jsx         # React DOM mount point
    ├── tailwind.config.js
    └── vite.config.js       # Vite configuration with /api backend proxy
```

---

## ⚙️ Getting Started

### 1. Backend Setup

```bash
cd backend
npm install

# Copy environment variables and configure your credentials
cp .env.example .env

# Optional: Seed initial admin & demo products into MongoDB
node seed.js

# Start backend server (runs on port 5000)
npm run dev # or npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Start Vite dev server (runs on port 5173 with proxy to http://localhost:5000)
npm run dev

# Or build for production
npm run build
```

---

## 👤 Default Seed Credentials

After running `node backend/seed.js`:
- **Admin**: `admin@example.com` / `Admin@123`
- **Customer (Test)**: `test@example.com` / `User@123` (OTP: `123456`)
