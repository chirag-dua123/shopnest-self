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

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added urlencoded just in case

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/token', require('./routes/tokenRoutes'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});