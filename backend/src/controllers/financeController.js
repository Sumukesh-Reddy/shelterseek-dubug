const Booking = require("../models/Booking");
const mongoose = require("mongoose");

/* =====================================
   1️⃣ GET ALL USERS WITH REVENUE
===================================== */

exports.getUsersRevenue = async (req, res) => {
  try {

    const result = await Booking.aggregate([

      {
        $match: { paymentStatus: { $in: ["completed", "refunded"] } }
      },

      {
        $group: {
          _id: "$travelerId",
          travelerName: { $first: "$travelerName" },
          travelerEmail: { $first: "$travelerEmail" },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$totalCost" },
          totalRefunded: { $sum: "$refundAmount" }
        }
      },

      {
        $project: {
          travelerId: "$_id",
          travelerName: 1,
          travelerEmail: 1,
          totalBookings: 1,
          totalRevenue: 1,
          totalRefunded: 1,
          netRevenue: {
            $subtract: ["$totalRevenue", "$totalRefunded"]
          }
        }
      },

      { $sort: { netRevenue: -1 } }

    ]);

    res.status(200).json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================================
   2. GET SINGLE USER FINANCE DETAILS
=================================== */

/* =====================================
   2️⃣ GET SINGLE USER FINANCE DETAILS
===================================== */

exports.getSingleUserFinance = async (req, res) => {
  try {

    const travelerId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(travelerId)) {
      return res.status(400).json({ message: "Invalid Traveler ID" });
    }

    const bookings = await Booking.find({
      travelerId,
      paymentStatus: { $in: ["completed", "refunded"] }
    }).sort({ bookedAt: -1 });

    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (acc, curr) => acc + curr.totalCost,
      0
    );

    const totalRefunded = bookings.reduce(
      (acc, curr) => acc + curr.refundAmount,
      0
    );

    res.status(200).json({
      totalBookings,
      totalRevenue,
      totalRefunded,
      netRevenue: totalRevenue - totalRefunded,
      bookings
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===================================
   3. GET DASHBOARD FINANCE STATS
=================================== */
/* =====================================
   3️⃣ GET OVERALL FINANCE STATS
===================================== */

exports.getFinanceStats = async (req, res) => {
  try {

    const bookings = await Booking.find({
      paymentStatus: { $in: ["completed", "refunded"] }
    });

    const totalRevenue = bookings.reduce(
      (acc, curr) => acc + curr.totalCost,
      0
    );

    const totalRefunds = bookings.reduce(
      (acc, curr) => acc + curr.refundAmount,
      0
    );

    const totalBookings = bookings.length;

    const platformCommission = totalRevenue * 0.10; // example 10%

    res.status(200).json({
      totalBookings,
      totalRevenue,
      totalRefunds,
      platformCommission,
      netProfit: totalRevenue - totalRefunds
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getFinanceDashboard = async (req, res) => {
  try {
    const bookings = await Booking.find({
      paymentStatus: { $in: ["completed", "refunded"] }
    });

    const totalRevenue = bookings.reduce(
      (acc, curr) => acc + curr.totalCost,
      0
    );

    const totalRefunds = bookings.reduce(
      (acc, curr) => acc + curr.refundAmount,
      0
    );

    const totalBookings = bookings.length;
    const netProfit = totalRevenue - totalRefunds;

    const refundRate =
      totalRevenue === 0
        ? 0
        : ((totalRefunds / totalRevenue) * 100).toFixed(2);

    const platformCommission = totalRevenue * 0.1;

    /* ===== Monthly Revenue Chart Data ===== */

    const monthlyRevenue = await Booking.aggregate([
      {
        $group: {
          _id: { $month: "$bookedAt" },
          revenue: { $sum: "$totalCost" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    /* ===== Recent Bookings ===== */

    const recentBookings = await Booking.find()
      .sort({ bookedAt: -1 })
      .limit(5)
      .select(
        "bookingId travelerName roomTitle totalCost bookedAt paymentStatus"
      );

    /* ===== Top 5 Users ===== */

    const topUsers = await Booking.aggregate([
      {
        $group: {
          _id: "$travelerId",
          travelerName: { $first: "$travelerName" },
          travelerEmail: { $first: "$travelerEmail" },
          totalRevenue: { $sum: "$totalCost" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalRevenue,
      totalRefunds,
      totalBookings,
      netProfit,
      refundRate,
      platformCommission,
      monthlyRevenue,
      recentBookings,
      topUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getHostsRevenue = async (req, res) => {
  try {
    const hosts = await Booking.aggregate([
      {
        $group: {
          _id: "$hostEmail",

          hostEmail: { $first: "$hostEmail" },
          hostIds: { $addToSet: "$hostId" },

          totalRevenue: { $sum: "$totalCost" },
          totalRefunds: { $sum: "$refundAmount" },
          totalBookings: { $sum: 1 },

          uniqueRooms: { $addToSet: "$roomId" }
        }
      },
      {
        $project: {
          hostEmail: 1,
          totalRevenue: 1,
          totalRefunds: 1,
          totalBookings: 1,
          totalRooms: { $size: "$uniqueRooms" },
          avgRevenue: {
            $cond: [
              { $eq: ["$totalBookings", 0] },
              0,
              { $divide: ["$totalRevenue", "$totalBookings"] }
            ]
          },
          netRevenue: {
            $subtract: ["$totalRevenue", "$totalRefunds"]
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json(hosts);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Optional: Add a simple endpoint to get host details by email
exports.getHostDetails = async (req, res) => {
  try {
    const { email } = req.params;
    
    const hostData = await Booking.aggregate([
      {
        $match: { hostEmail: email }
      },
      {
        $group: {
          _id: "$hostEmail",
          hostEmail: { $first: "$hostEmail" },
          hostId: { $first: "$hostId" },
          totalRevenue: { $sum: "$totalCost" },
          totalRefunds: { $sum: "$refundAmount" },
          totalBookings: { $sum: 1 },
          uniqueRooms: { $addToSet: "$roomId" },
          firstBooking: { $min: "$createdAt" },
          lastBooking: { $max: "$createdAt" }
        }
      },
      {
        $addFields: {
          totalRooms: { $size: "$uniqueRooms" },
          avgRevenue: { $divide: ["$totalRevenue", "$totalBookings"] }
        }
      }
    ]);

    if (hostData.length === 0) {
      return res.status(404).json({ message: "Host not found" });
    }

    // Get room-wise breakdown
    const roomBreakdown = await Booking.aggregate([
      {
        $match: { hostEmail: email }
      },
      {
        $group: {
          _id: "$roomId",
          roomTitle: { $first: "$roomTitle" },
          totalRevenue: { $sum: "$totalCost" },
          totalBookings: { $sum: 1 },
          lastBooking: { $max: "$createdAt" }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.json({
      ...hostData[0],
      roomBreakdown
    });

  } catch (error) {
    console.error("Error in getHostDetails:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Additional endpoint for host performance trends
exports.getHostPerformanceTrends = async (req, res) => {
  try {
    const { email, period = 'monthly' } = req.query;

    let groupBy;
    switch(period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case 'weekly':
        groupBy = { $dateToString: { format: "%Y-%W", date: "$createdAt" } };
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      case 'yearly':
        groupBy = { $dateToString: { format: "%Y", date: "$createdAt" } };
        break;
    }

    const trends = await Booking.aggregate([
      {
        $match: email ? { hostEmail: email } : {}
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$totalCost" },
          bookings: { $sum: 1 },
          refunds: { $sum: "$refundAmount" },
          avgBookingValue: { $avg: "$totalCost" }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          period: "$_id",
          revenue: 1,
          bookings: 1,
          refunds: 1,
          avgBookingValue: 1,
          _id: 0
        }
      }
    ]);

    res.json(trends);

  } catch (error) {
    console.error("Error in getHostPerformanceTrends:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Additional endpoint for host room performance
exports.getHostRoomPerformance = async (req, res) => {
  try {
    const { email } = req.params;

    const roomPerformance = await Booking.aggregate([
      {
        $match: { hostEmail: email }
      },
      {
        $group: {
          _id: "$roomId",
          roomTitle: { $first: "$roomTitle" },
          totalRevenue: { $sum: "$totalCost" },
          totalBookings: { $sum: 1 },
          completedBookings: {
            $sum: {
              $cond: [{ $eq: ["$paymentStatus", "completed"] }, 1, 0]
            }
          },
          avgRating: { $avg: "$rating" },
          lastBooking: { $max: "$createdAt" }
        }
      },
      {
        $addFields: {
          successRate: {
            $multiply: [
              { $divide: ["$completedBookings", "$totalBookings"] },
              100
            ]
          }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.json(roomPerformance);

  } catch (error) {
    console.error("Error in getHostRoomPerformance:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getSingleHostRevenue = async (req, res) => {
  try {
    const { email } = req.params;

    const rooms = await Booking.aggregate([
      { $match: { hostEmail: email } },

      {
        $group: {
          _id: "$roomId",

          roomTitle: { $first: "$roomTitle" },
          createdAt: { $first: "$createdAt" },

          totalRevenue: { $sum: "$totalCost" },
          totalBookings: { $sum: 1 },

          bookings: {
            $push: {
              bookingId: "$bookingId",
              travelerName: "$travelerName",
              travelerEmail: "$travelerEmail",
              totalCost: "$totalCost",
              refundAmount: "$refundAmount",
              paymentStatus: "$paymentStatus",
              paymentMethod: "$paymentDetails.paymentMethod",
              paymentDate: "$paymentDetails.paymentDate",
              bookedAt: "$bookedAt"
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const allBookings = await Booking.find({ hostEmail: email });

    const totalRevenue = allBookings.reduce((a,b)=>a+b.totalCost,0);
    const totalBookings = allBookings.length;
    const avgRevenue = totalBookings === 0 ? 0 : totalRevenue / totalBookings;

    res.json({
      totalRevenue,
      totalBookings,
      avgRevenue,
      rooms
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};