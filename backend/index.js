const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const connectDB = require('./config/db');
connectDB();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('server is running');
});

app.use('/api/auth', require('./routes/authRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});