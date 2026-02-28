const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: String,
  email: String,
  title: String,
  description: String,
  price: Number,
  location: String,
  coordinates: { lat: Number, lng: Number },
  propertyType: String,
  capacity: Number,
  roomType: String,
  bedrooms: Number,
  beds: Number,
  maxdays: Number,
  roomSize: String,
  roomLocation: String,
  transportDistance: String,
  hostGender: String,
  foodFacility: String,
  status: { 
    type: String, 
    set: v => v ? v.toString().toLowerCase() : 'pending', 
    default: 'pending' 
  },
  booking: { type: Boolean, default: false },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Traveler', default: null },
  discount: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  unavailableDates: [Date],
  amenities: [String],
  images: [mongoose.Schema.Types.ObjectId],
  reviews: [Object],
  createdAt: { type: Date, default: Date.now }
}, { collection: 'RoomData' });

// Create model with hostAdminConnection
let Room;
if (global.hostAdminConnection) {
  Room = global.hostAdminConnection.model('RoomData', roomSchema);
} else {
  // Fallback for when connection isn't global yet
  const connection = mongoose.createConnection(process.env.HOST_ADMIN_URI);
  Room = connection.model('RoomData', roomSchema);
}

module.exports = Room;