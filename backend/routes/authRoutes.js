const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  verifyOtp, 
  logoutUser, 
  forgotPassword, 
  resetPassword,
  getUsers 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/user', protect, admin, getUsers);

module.exports = router;