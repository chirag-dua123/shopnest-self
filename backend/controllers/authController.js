const user = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mail");

// Register a new user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // TODOS: implement jwt token generation and send it in the response after successful registration. This will allow the user to be authenticated immediately after registration without needing to log in again.
    // TODOS: send otp to the user's email for verification. This will enhance security by ensuring that the email provided during registration is valid and belongs to the user.
    // TODOS: send welcome email to the user after successful registration. This will improve user experience and engagement by providing a warm welcome and important information about the platform.
    
    // Create new user
    const newUser = new user({
      name,
      email,
      password: hashedPassword
    });

    // Save user to database
    await newUser.save();
    if (user) {
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
        const otpExpiry = Date.now() + 10 * 60 * 1000; // Set OTP expiry time to 10 minutes from now
        sendEmail({
            to: email,
            subject: "Email Verification OTP",
            text: `Your OTP for registration is: ${otp}. \n This OTP will expire in 10 minutes.`
        });
    }
    
    res.status(201).json({ message: "User registered successfully, please check your email for verification." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}; 