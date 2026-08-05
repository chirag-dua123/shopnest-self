// 1. Load environment variables first
require('dotenv').config(); 
const nodemailer = require('nodemailer');

// 2. Create the transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Reads from .env
    pass: process.env.EMAIL_PASS  // Reads the App Password from .env
  }
});

// 3. Define your send function
const sendMail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text
    });
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendMail;   