const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'myjwtsecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

module.exports = generateToken;