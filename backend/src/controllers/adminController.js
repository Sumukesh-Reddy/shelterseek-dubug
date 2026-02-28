const { Traveler, Host } = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// Get dashboard stats
exports.getDashboardStats = catchAsync(async (req, res) => {
  const travelerCount = await Traveler.countDocuments({ accountType: 'traveller' });
  const hostCount = await Host.countDocuments({ accountType: 'host' });
  
  const totalRooms = await Room.countDocuments({});
  const verifiedRooms = await Room.countDocuments({ status: 'verified' });
  const pendingRooms = await Room.countDocuments({ status: 'pending' });
  
  const totalBookings = await Booking.countDocuments({});
  const completedBookings = await Booking.countDocuments({ 
    bookingStatus: { $in: ['completed', 'checked_out'] } 
  });
  
  const totalRevenueResult = await Booking.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalCost' } } }
  ]);
  
  const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

  res.json({
    success: true,
    stats: {
      users: { travelers: travelerCount, hosts: hostCount, total: travelerCount + hostCount },
      rooms: { total: totalRooms, verified: verifiedRooms, pending: pendingRooms },
      bookings: { total: totalBookings, completed: completedBookings },
      revenue: totalRevenue
    }
  });
});

// Get recent activities
exports.getRecentActivities = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit || 7);
  const allActivities = [];

  // Get recent bookings
  const bookings = await Booking.find({
    bookingStatus: { $in: ['confirmed', 'checked_in', 'completed'] }
  })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  for (const booking of bookings) {
    let roomTitle = 'Room';
    
    try {
      const room = await Room.findById(booking.roomId).select('title').lean();
      if (room?.title) roomTitle = room.title;
    } catch (err) {
      // Ignore error
    }
    
    const bookingId = booking.bookingId || booking._id.toString().substring(0, 8);
    const date = booking.updatedAt || booking.paymentDate || booking.createdAt;
    
    allActivities.push({
      type: 'booking',
      id: booking._id,
      name: booking.travelerName || 'Guest',
      action: `Room Booked "${roomTitle}" with ${bookingId}`,
      email: booking.travelerEmail,
      date: date,
      dateFormatted: date ? new Date(date).toLocaleDateString() : 'N/A',
      timeFormatted: date ? new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', minute: '2-digit' 
      }) : 'N/A',
      timestamp: date ? new Date(date).getTime() : Date.now()
    });
  }

  // Get recent room uploads
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const roomUploads = await Room.find({ createdAt: { $gte: weekAgo } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  for (const room of roomUploads) {
    allActivities.push({
      type: 'room_upload',
      id: room._id,
      name: room.name || 'Host',
      action: `uploaded a new room named "${room.title || 'New Room'}"`,
      email: room.email,
      details: { roomName: room.title, location: room.location, price: room.price },
      date: room.createdAt,
      dateFormatted: room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'N/A',
      timeFormatted: room.createdAt ? new Date(room.createdAt).toLocaleTimeString([], { 
        hour: '2-digit', minute: '2-digit' 
      }) : 'N/A',
      timestamp: room.createdAt ? new Date(room.createdAt).getTime() : Date.now()
    });
  }

  const sortedActivities = allActivities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  res.json({ 
    success: true,
    data: sortedActivities,
    count: sortedActivities.length,
    types: {
      bookings: allActivities.filter(a => a.type === 'booking').length,
      roomUploads: allActivities.filter(a => a.type === 'room_upload').length
    }
  });
});

// Get error logs
exports.getErrorLogs = catchAsync(async (req, res) => {
  const fs = require('fs').promises;
  const path = require('path');
  
  const logDirectory = path.join(__dirname, '../../logs');
  const errorLogPath = path.join(logDirectory, 'error.log');
  
  try {
    const logContent = await fs.readFile(errorLogPath, 'utf8');
    const lines = logContent.trim().split('\n').filter(line => line);
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return { raw: line };
      }
    });
    
    res.json({
      success: true,
      count: logs.length,
      logs: logs.reverse().slice(0, 100) 
    });
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.json({ success: true, count: 0, logs: [], message: 'No error logs yet' });
    } else {
      throw err;
    }
  }
});

// Delete user
exports.deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID' });
  }

  let user = await Host.findByIdAndDelete(id);
  if (!user) {
    user = await Traveler.findByIdAndDelete(id);
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ success: true, message: 'User deleted successfully' });
});

// Get trends data
exports.getTrends = catchAsync(async (req, res) => {
  const travelers = await Traveler.find({}).lean();
  
  const roomStats = {};
  
  travelers.forEach((traveler) => {
    if (traveler.viewedRooms && Array.isArray(traveler.viewedRooms)) {
      traveler.viewedRooms.forEach(view => {
        let roomId;
        if (typeof view === 'string') {
          roomId = view;
        } else if (view && typeof view === 'object') {
          roomId = view.roomId || view._id || view.id;
        }
        
        if (!roomId || typeof roomId !== 'string') return;
        
        if (!roomStats[roomId]) {
          roomStats[roomId] = {
            roomId,
            totalViews: 0,
            totalLikes: 0,
            uniqueViewers: new Set(),
            uniqueLikers: new Set()
          };
        }
        
        roomStats[roomId].totalViews++;
        if (traveler._id) {
          roomStats[roomId].uniqueViewers.add(traveler._id.toString());
        }
      });
    }
    
    if (traveler.likedRooms && Array.isArray(traveler.likedRooms)) {
      traveler.likedRooms.forEach(roomId => {
        if (!roomId || typeof roomId !== 'string') return;
        
        if (!roomStats[roomId]) {
          roomStats[roomId] = {
            roomId,
            totalViews: 0,
            totalLikes: 0,
            uniqueViewers: new Set(),
            uniqueLikers: new Set()
          };
        }
        
        roomStats[roomId].totalLikes++;
        if (traveler._id) {
          roomStats[roomId].uniqueLikers.add(traveler._id.toString());
        }
      });
    }
  });

  const trends = Object.values(roomStats).map(stat => ({
    roomId: stat.roomId,
    totalViews: stat.totalViews,
    totalLikes: stat.totalLikes,
    uniqueViewers: stat.uniqueViewers.size,
    uniqueLikers: stat.uniqueLikers.size,
    engagementRate: stat.totalViews > 0 ? 
      Math.round((stat.totalLikes / stat.totalViews) * 100) : 0
  }));

  trends.sort((a, b) => b.totalViews - a.totalViews);

  const topRoomIds = trends.slice(0, 50).map(t => t.roomId);

  const rooms = await Room.find({
    _id: { $in: topRoomIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch {
        return null;
      }
    }).filter(id => id !== null) }
  }).select('title name location price').lean();

  const roomDetailsMap = {};
  rooms.forEach(room => {
    roomDetailsMap[room._id.toString()] = {
      title: room.title || 'Untitled Room',
      host: room.name || 'Unknown Host',
      location: room.location || 'Unknown Location',
      price: room.price || 0
    };
  });

  const trendsWithDetails = trends.map(trend => ({
    ...trend,
    roomName: roomDetailsMap[trend.roomId]?.title || `Room ${trend.roomId.substring(0, 8)}...`,
    host: roomDetailsMap[trend.roomId]?.host || 'Unknown',
    location: roomDetailsMap[trend.roomId]?.location || 'Unknown',
    price: roomDetailsMap[trend.roomId]?.price || 0
  }));

  const summary = {
    totalRooms: trends.length,
    totalViews: trends.reduce((sum, t) => sum + t.totalViews, 0),
    totalLikes: trends.reduce((sum, t) => sum + t.totalLikes, 0),
    totalUniqueViewers: new Set(trends.flatMap(t => t.uniqueViewers)).size,
    totalUniqueLikers: new Set(trends.flatMap(t => t.uniqueLikers)).size,
    avgEngagementRate: trends.length > 0 ? 
      Math.round(trends.reduce((sum, t) => sum + t.engagementRate, 0) / trends.length) : 0
  };

  res.json({
    success: true,
    trends: trendsWithDetails,
    summary,
    count: trends.length
  });
});