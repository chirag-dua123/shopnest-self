const User = require("../model/user");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendMail");
const { generateAccessToken, generateRefreshToken, hashToken } = require("../utils/tokenUtils");

const isProduction = process.env.NODE_ENV === "production";
const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: isProduction, sameSite: "lax" });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, accessCookieOptions);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
};


// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit OTP
    const otpExpiresAt = Date.now() + 10 * 60 * 1000; // Set OTP expiry time to 10 minutes from now

    newUser.otp = otp;
    newUser.otpExpiresAt = otpExpiresAt;

    // Save user to database
    await newUser.save();
    
    await sendEmail(
      email,
      "Email Verification OTP",
      `Your OTP for registration is: ${otp}. \n This OTP will expire in 10 minutes.`
    );
    
    res.status(201).json({
      message: "User registered successfully. Please check your email for the OTP to verify your account."
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body || {};
  const normalizedOtp = String(otp).trim();

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (String(user.otp).trim() !== normalizedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    user.accessTokenHash = hashToken(accessToken);
    user.refreshTokenHash = hashToken(refreshToken);
    
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "OTP verified successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    
    if (!user.verified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.accessTokenHash = hashToken(accessToken);
    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
  try {
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const user = await User.findOne({ refreshTokenHash: hashToken(refreshToken) });
    if (!user) {
      return res.status(404).json({ message: "User not found or already logged out" });
    }
    
    user.accessTokenHash = null;
    user.refreshTokenHash = null;
    await user.save();

    clearAuthCookies(res);
    
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP to reset password is: ${otp}. \nThis OTP will expire in 10 minutes.`
    );

    res.status(200).json({ message: "Password reset OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const normalizedOtp = String(otp).trim();
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user.otp).trim() !== normalizedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Password has been successfully reset" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password field from the response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  verifyOtp,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUsers
};