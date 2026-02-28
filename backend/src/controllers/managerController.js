// controllers/managerController.js
const { Manager } = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'myjwtsecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

// Manager login
exports.managerLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password required', 400));
  }

  const manager = await Manager.findOne({ email }).select('+password');

  if (!manager) {
    return next(new AppError('Manager not found with this email', 404));
  }

  if (!(await manager.correctPassword(password))) {
    return next(new AppError('Invalid password', 401));
  }

  const token = signToken(manager._id);

  res.json({ 
    success: true, 
    message: 'Login successful', 
    token, 
    user: {
      id: manager._id,
      name: manager.name,
      email: manager.email,
      accountType: 'manager',
      department: manager.department,
      role: manager.role,
      phone: manager.phone
    }
  });
});

// Get manager by email
exports.getManagerByEmail = catchAsync(async (req, res, next) => {
  const { email } = req.params;
  
  const manager = await Manager.findOne({ email }).select('email name department role phone');
  
  if (!manager) {
    return next(new AppError('Manager not found', 404));
  }
  
  res.json({
    success: true,
    user: {
      email: manager.email,
      name: manager.name,
      department: manager.department,
      role: manager.role,
      phone: manager.phone
    }
  });
});

// Get manager dashboard stats
exports.getDashboardStats = catchAsync(async (req, res) => {
  const Booking = require('../models/Booking');
  const Room = require('../models/Room');
  const { Traveler, Host } = require('../models/User');

  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRooms,
    pendingRooms,
    verifiedRooms,
    totalTravelers,
    totalHosts,
    recentBookings,
    revenueData
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ bookingStatus: 'pending' }),
    Booking.countDocuments({ bookingStatus: 'completed' }),
    Room.countDocuments(),
    Room.countDocuments({ status: 'pending' }),
    Room.countDocuments({ status: 'verified' }),
    Traveler.countDocuments(),
    Host.countDocuments(),
    Booking.find().sort({ createdAt: -1 }).limit(10).lean(),
    Booking.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ])
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

  res.json({
    success: true,
    stats: {
      bookings: { 
        total: totalBookings, 
        pending: pendingBookings,
        completed: completedBookings 
      },
      rooms: { 
        total: totalRooms, 
        pending: pendingRooms,
        verified: verifiedRooms 
      },
      users: { 
        travelers: totalTravelers, 
        hosts: totalHosts,
        total: totalTravelers + totalHosts
      },
      revenue: totalRevenue
    },
    recentBookings
  });
});

// Get all managers (admin only)
exports.getAllManagers = catchAsync(async (req, res) => {
  const managers = await Manager.find({}).select('-password');
  
  res.json({
    success: true,
    count: managers.length,
    managers
  });
});

// Update manager profile
exports.updateManagerProfile = catchAsync(async (req, res, next) => {
  const updates = {};
  const allowedFields = ['name', 'phone', 'department', 'role'];
  
  allowedFields.forEach(field => {
    if (req.body[field]) updates[field] = req.body[field];
  });

  const manager = await Manager.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!manager) {
    return next(new AppError('Manager not found', 404));
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    manager
  });
});