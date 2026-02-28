const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints limiter (stricter)
const authLimiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// AI chat limiter
const aiChatLimiter = rateLimit({
  max: 300,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many AI chat requests, please try again later.',
});

module.exports = {
  apiLimiter,
  authLimiter,
  aiChatLimiter
};