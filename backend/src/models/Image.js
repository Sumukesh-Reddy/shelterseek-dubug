const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  length: Number,
  uploadDate: { type: Date, default: Date.now }
});

// This is a metadata model for GridFS
const Image = mongoose.model('Image', imageSchema);

module.exports = Image;