/**
 * JWT Utility
 * Token generation and verification
 */

const jwt = require('jsonwebtoken');

const generateJWT = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const verifyJWT = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const decodeJWT = (token) => {
  return jwt.decode(token);
};

module.exports = { generateJWT, verifyJWT, decodeJWT };
