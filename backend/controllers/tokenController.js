const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { generateAccessToken } = require("../utils/tokenUtils");
const { hashToken } = require("../utils/tokenUtils");

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.token || req.body?.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token provided" });

  if (!refreshTokenSecret) {
    return res.status(500).json({ message: "JWT_REFRESH_SECRET is not configured" });
  }

  try {
    const decoded = jwt.verify(token, refreshTokenSecret);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshTokenHash !== hashToken(token)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    user.accessTokenHash = hashToken(newAccessToken);
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Access token refreshed" });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

module.exports = { refreshToken };
