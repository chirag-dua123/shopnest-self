const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cookieParser = require('cookie-parser');
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

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/token', require('./routes/tokenRoutes'));

app.use('/api/create-order', require('./routes/orderRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});