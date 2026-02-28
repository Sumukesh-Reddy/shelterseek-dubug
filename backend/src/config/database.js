// src/config/database.js
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

const initializeConnections = () => {
  // Host_Admin connection
  global.hostAdminConnection = mongoose.createConnection(process.env.HOST_ADMIN_URI, {
    retryWrites: true,
    w: 'majority'
  });

  global.hostAdminConnection.on('connected', () => {
    console.log('✅ Connected to Host_Admin database');
    global.gfsBucket = new GridFSBucket(global.hostAdminConnection.db, { bucketName: 'images' });
    console.log('✅ GridFS bucket initialized');
  });

  global.hostAdminConnection.on('error', (err) => {
    console.error('❌ Host_Admin DB connection error:', err.message);
  });

  // Admin_Traveler connection
  global.adminTravelerConnection = mongoose.createConnection(process.env.ADMIN_TRAVELER_URI, {
    retryWrites: true,
    w: 'majority'
  });

  global.adminTravelerConnection.on('connected', () => {
    console.log('✅ Connected to Admin_Traveler database');
  });

  global.adminTravelerConnection.on('error', (err) => {
    console.error('❌ Admin_Traveler DB connection error:', err.message);
  });

  // Payment DB connection
  global.paymentConnection = mongoose.createConnection(process.env.PAYMENT_DB_URI, {
    retryWrites: true,
    w: 'majority'
  });

  global.paymentConnection.on('connected', () => {
    console.log('✅ Connected to Payment/Booking database');
  });

  global.paymentConnection.on('error', (err) => {
    console.error('❌ Payment/Booking DB connection error:', err.message);
  });
};

module.exports = { initializeConnections };