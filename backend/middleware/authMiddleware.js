const jwt = require("jsonwebtoken");
const user = require("../model/user");
const { hashToken } = require("../utils/tokenUtils");

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

const protect = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  if (!accessTokenSecret) {
    return res.status(500).json({ message: "JWT_ACCESS_SECRET is not configured" });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    const tokenHash = hashToken(token);
    const authenticatedUser = await user.findOne({ _id: decoded.id, accessTokenHash: tokenHash }).select("-password");

    if (!authenticatedUser) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    req.user = authenticatedUser;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
