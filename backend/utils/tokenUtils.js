const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

const getRequiredSecret = (secret, secretName) => {
  if (!secret) {
    throw new Error(`${secretName} is required`);
  }

  return secret;
};

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, getRequiredSecret(accessTokenSecret, 'JWT_ACCESS_SECRET'), { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRequiredSecret(refreshTokenSecret, 'JWT_REFRESH_SECRET'), { expiresIn: '7d' });
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { generateAccessToken, generateRefreshToken, hashToken };
