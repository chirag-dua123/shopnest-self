const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const app = express();
const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('server is running');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added urlencoded just in case
app.use(cookieParser());

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
// Removed express-mongo-sanitize due to getter issue in newer Express versions

// Rate Limiting for Auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/token', authLimiter, require('./routes/tokenRoutes'));

app.use('/api/orders', require('./routes/orderRoutes'));
// Keep this just in case the frontend relies precisely on /api/create-order/create-order
app.use('/api/create-order', require('./routes/orderRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});