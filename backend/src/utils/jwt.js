const jwt = require('jsonwebtoken');
const config = require('../config');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const verifyToken = (token) => jwt.verify(token, config.jwtSecret);

module.exports = { generateToken, verifyToken };
