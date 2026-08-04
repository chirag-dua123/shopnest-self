const user = require("../model/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendMail");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
}

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
    
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      token: generateToken(newUser),
      message: "User registered successfully. Please check your email for the OTP to verify your account."
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
// const verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     if (Date.now() > user.otpExpiry) {
//       return res.status(400).json({ message: "OTP has expired" });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     user.otpExpiry = undefined;
//     await user.save();

//     res.status(200).json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       token: generateToken(user),
//       message: "OTP verified successfully"
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if password is correct
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      token: generateToken(existingUser),
      message: "Login successful"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await user.find().select("-password"); // Exclude password field from the response
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  // verifyOtp,
  loginUser,
  getUsers
};