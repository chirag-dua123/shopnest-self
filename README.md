# ShopNest E-Commerce Platform
ShopNest is a production-grade, full-stack e-commerce application built using the MERN stack (MongoDB, Express.js, React, Node.js). This project serves as a comprehensive platform for managing users, products, orders, and secure payments.

## Core Features
 - User Authentication: Secure registration and login using JWT (JSON Web Tokens) with enhanced security via OTP verification.
 - Admin Dashboard: Centralized control for managing inventory, tracking revenue, and monitoring order statuses (Pending, Shipped, Delivered).
 - Shopping Cart & Checkout: Global state management via Redux Toolkit and seamless integration with the Razorpay payment gateway.
 - Cloud Media Management: Secure product image handling using Cloudinary and Multer.
 - Deployment-Ready: Architected as a monorepo for efficient deployment on cloud platforms like Render.
## Tech Stack
 - Frontend: React.js, Redux Toolkit, React Router DOM, CSS/Tailwind
 - Backend: Node.js, Express.js
 - Database: MongoDB with Mongoose
 - Third-Party Services: Razorpay (Payments), Cloudinary (Image Storage), Nodemailer (Email Notifications)
## Project Architecture
 - Full-Stack Monorepo: Integrated front-end and back-end structure for simplified development and maintenance.
 - REST API: Robust API architecture with middleware-based authentication and authorization for admin routes.
 - Database Seeding: Automated scripts to seed initial products and auto-provision admin accounts.