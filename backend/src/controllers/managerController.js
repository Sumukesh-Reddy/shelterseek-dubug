// controllers/managerController.js
const { Manager } = require('../models/User');
const Room = require('../models/Room');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteFromGridFS } = require('../services/gridfsService');
const { replicateToTravelerDB } = require('../services/replicationService');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'myjwtsecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  });
};

const normalizeListingStatus = (status) => String(status || 'pending').trim().toLowerCase();

const createReviewPayload = (user, status) => {
  const payload = {
    status,
    statusUpdatedAt: new Date()
  };

  if (status === 'verified' || status === 'rejected') {
    payload.reviewedAt = new Date();
    payload.reviewedBy = {
      userId: String(user?._id || user?.id || ''),
      name: user?.name || '',
      email: user?.email || '',
      accountType: user?.accountType || '',
      department: user?.department || ''
    };
  }

  return payload;
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

// Get listings dashboard data for listings managers
exports.getListingsDashboard = catchAsync(async (req, res) => {
  const listings = await Room.find({}).sort({ createdAt: -1 }).lean();
  const now = Date.now();
  const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

  const normalizedListings = listings.map((listing) => ({
    ...listing,
    status: normalizeListingStatus(listing.status),
    images: Array.isArray(listing.images) ? listing.images : []
  }));

  const pendingQueue = normalizedListings
    .filter((listing) => listing.status === 'pending')
    .slice(0, 20);

  const recentlyApproved = normalizedListings
    .filter((listing) => listing.status === 'verified')
    .sort((a, b) => {
      const aTime = new Date(a.reviewedAt || a.statusUpdatedAt || a.createdAt || 0).getTime();
      const bTime = new Date(b.reviewedAt || b.statusUpdatedAt || b.createdAt || 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 20);

  const uniqueLocations = [...new Set(normalizedListings.map((listing) => listing.location).filter(Boolean))].sort();
  const uniquePropertyTypes = [...new Set(normalizedListings.map((listing) => listing.propertyType).filter(Boolean))].sort();

  res.json({
    success: true,
    stats: {
      totalActiveListings: normalizedListings.filter((listing) => listing.status === 'verified').length,
      pendingApproval: normalizedListings.filter((listing) => listing.status === 'pending').length,
      rejectedListings: normalizedListings.filter((listing) => listing.status === 'rejected').length,
      newListingsThisWeek: normalizedListings.filter((listing) => {
        const createdAt = new Date(listing.createdAt || 0).getTime();
        return createdAt >= sevenDaysAgo;
      }).length
    },
    filters: {
      locations: uniqueLocations,
      propertyTypes: uniquePropertyTypes
    },
    data: {
      listings: normalizedListings,
      pendingQueue,
      recentlyApproved
    }
  });
});

// Update listing status for listings managers
exports.updateManagedListingStatus = catchAsync(async (req, res, next) => {
  const { listingId } = req.params;
  const { status } = req.body;

  if (!listingId || !status) {
    return next(new AppError('Listing ID and status are required', 400));
  }

  const statusMap = {
    approved: 'verified',
    rejected: 'rejected',
    verified: 'verified',
    pending: 'pending'
  };

  const mappedStatus = statusMap[normalizeListingStatus(status)];
  if (!mappedStatus) {
    return next(new AppError('Invalid listing status', 400));
  }

  const listing = await Room.findByIdAndUpdate(
    listingId,
    createReviewPayload(req.user, mappedStatus),
    { new: true }
  );

  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  if (mappedStatus === 'verified') {
    await replicateToTravelerDB(listing);
  }

  res.json({
    success: true,
    message: `Listing ${mappedStatus === 'verified' ? 'approved' : mappedStatus === 'rejected' ? 'rejected' : 'updated'} successfully`,
    data: { listing }
  });
});

// Hard delete listing for listings managers
exports.deleteManagedListing = catchAsync(async (req, res, next) => {
  const listing = await Room.findById(req.params.id);

  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  for (const imageId of listing.images || []) {
    await deleteFromGridFS(imageId);
  }

  await Room.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Listing deleted successfully'
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

// Get the authenticated manager profile
exports.getManagerProfile = catchAsync(async (req, res, next) => {
  const manager = await Manager.findById(req.user._id).select('-password -otp -otpExpiresAt');

  if (!manager) {
    return next(new AppError('Manager not found', 404));
  }

  res.json({
    success: true,
    manager
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

// Change manager password
exports.changeManagerPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return next(new AppError('Current password, new password, and confirm password are required', 400));
  }

  if (String(newPassword).length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new AppError('New password and confirm password do not match', 400));
  }

  if (currentPassword === newPassword) {
    return next(new AppError('New password must be different from the current password', 400));
  }

  const manager = await Manager.findById(req.user._id).select('+password');

  if (!manager) {
    return next(new AppError('Manager not found', 404));
  }

  const isCurrentPasswordValid = await manager.correctPassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return next(new AppError('Current password is incorrect', 401));
  }

  manager.password = newPassword;
  await manager.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
