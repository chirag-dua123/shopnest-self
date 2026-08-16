const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./model/user");
const Product = require("./model/product");
const bcrypt = require("bcryptjs");

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/");
    console.log("Connected to MongoDB for Seeding");

    // Clear DB
    await User.deleteMany();
    await Product.deleteMany();

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("Admin@123", salt);
    const admin = new User({
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: "admin",
      verified: true
    });
    await admin.save();

    // Create Test User (Unverified to test OTP)
    const userPassword = await bcrypt.hash("User@123", salt);
    const user = new User({
      name: "Test User",
      email: "test@example.com",
      password: userPassword,
      role: "user",
      verified: false,
      otp: "123456",
      otpExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // Valid for 24h for testing
    });
    await user.save();

    // Create Sample Products
    const products = [
      {
        name: "Wireless Headphones",
        description: "High quality noise cancelling headphones.",
        price: 199.99,
        image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        category: "Electronics",
        countInStock: 50
      },
      {
        name: "Running Shoes",
        description: "Comfortable running shoes for all terrains.",
        price: 89.99,
        image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        category: "Apparel",
        countInStock: 20
      },
      {
        name: "Coffee Maker",
        description: "Brews up to 12 cups of coffee.",
        price: 49.99,
        image: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        category: "Home Appliances",
        countInStock: 10
      }
    ];
    await Product.insertMany(products);

    console.log("Database Seeded Successfully!");
    console.log("Admin login: admin@example.com / Admin@123");
    console.log("Test user (unverified): test@example.com / User@123 / OTP: 123456");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
