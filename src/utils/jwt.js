const jwt = require('jsonwebtoken');
const config = require('../config');

const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.secret);
const verifyRefreshToken = (token) => jwt.verify(token, config.jwt.refreshSecret);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
