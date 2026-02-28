const jwt = require('jsonwebtoken');
const { Traveler, Host } = require('../models/User');

// JWT authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }

  try {
    // Allow static admin tokens used by the admin UI in development
    if (token.startsWith('admin-token-')) {
      req.user = {
        _id: 'admin-001',
        id: 'admin-001',
        name: 'ShelterSeek Admin',
        email: process.env.ADMIN_EMAIL || 'shelterseekrooms@gmail.com',
        accountType: 'admin',
        role: 'administrator'
      };
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myjwtsecret');

    let user = await Traveler.findById(decoded.id);
    if (!user) {
      user = await Host.findById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

const isRequestAuthenticated = (req) => {
  if (req.user) return true;
  if (typeof req.isAuthenticated === 'function') {
    try {
      return req.isAuthenticated();
    } catch {
      return false;
    }
  }
  return false;
};

// Role-based access control
const roleMiddleware = {
  travelerOnly: (req, res, next) => {
    if (!isRequestAuthenticated(req)) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.user || req.user.accountType !== 'traveller') {
      return res.status(403).json({ success: false, message: 'Access denied: Traveler only' });
    }

    next();
  },

  hostOnly: (req, res, next) => {
    if (!isRequestAuthenticated(req)) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.user || req.user.accountType !== 'host') {
      return res.status(403).json({ success: false, message: 'Access denied: Host only' });
    }

    next();
  },

  adminOnly: (req, res, next) => {
    if (!isRequestAuthenticated(req)) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!req.user || req.user.accountType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }

    next();
  },
    
    managerOnly: (req, res, next) => {
      if (!isRequestAuthenticated(req)) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      if (!req.user || req.user.accountType !== 'manager') {
        return res.status(403).json({ success: false, message: 'Access denied: Manager only' });
      }

      next();
    },
  authenticated: (req, res, next) => {
    if (!isRequestAuthenticated(req)) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    next();
  },
};

module.exports = {
  authenticateToken,
  roleMiddleware,
};