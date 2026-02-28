const Room = require('../models/Room');
const { Traveler, Host } = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { uploadMultipleToGridFS, deleteFromGridFS, getFileStream } = require('../services/gridfsService');
const qrcode = require('qrcode');

// Create listing
exports.createListing = catchAsync(async (req, res, next) => {
  const currentUser = JSON.parse(req.body.currentUser);
  let imageIds = [];

  // Upload images to GridFS
  if (req.files && req.files.length > 0) {
    imageIds = await uploadMultipleToGridFS(req.files);
  }

  const listingData = {
    ...req.body,
    name: currentUser.name,
    email: currentUser.email,
    images: imageIds,
    price: parseFloat(req.body.price),
    maxdays: parseInt(req.body.maxdays),
    capacity: parseInt(req.body.capacity),
    bedrooms: parseInt(req.body.bedrooms),
    beds: parseInt(req.body.beds),
    discount: parseInt(req.body.discount) || 0,
    amenities: req.body.amenities ? req.body.amenities.split(',') : [],
    coordinates: {
      lat: parseFloat(req.body.latitude),
      lng: parseFloat(req.body.longitude)
    },
    likes: 0,
    booking: false,
    reviews: [],
    unavailableDates: req.body.unavailableDates ? 
      (Array.isArray(req.body.unavailableDates) 
        ? req.body.unavailableDates.map(date => new Date(date))
        : JSON.parse(req.body.unavailableDates).map(date => new Date(date))
      ) : []
  };

  const listing = new Room(listingData);
  await listing.save();

  res.status(201).json({
    success: true,
    message: 'Listing created successfully',
    data: { listing }
  });
});

// Update listing
exports.updateListing = catchAsync(async (req, res, next) => {
  const listingId = req.params.id;
  const currentUser = JSON.parse(req.body.currentUser);
  const removedImages = req.body.removedImages ? req.body.removedImages.split(',') : [];

  // Delete removed images from GridFS
  for (const imgId of removedImages) {
    if (imgId) {
      await deleteFromGridFS(imgId);
    }
  }

  const newImageIds = [];
  if (req.files && req.files.length > 0) {
    const ids = await uploadMultipleToGridFS(req.files);
    newImageIds.push(...ids);
  }

  const updatedData = {
    ...req.body,
    name: currentUser.name,
    email: currentUser.email,
    images: [...(req.body.existingImages ? JSON.parse(req.body.existingImages) : []), ...newImageIds],
    price: parseFloat(req.body.price),
    maxdays: parseInt(req.body.maxdays),
    capacity: parseInt(req.body.capacity),
    bedrooms: parseInt(req.body.bedrooms),
    beds: parseInt(req.body.beds),
    discount: parseInt(req.body.discount) || 0,
    amenities: req.body.amenities ? req.body.amenities.split(',') : [],
    coordinates: {
      lat: parseFloat(req.body.latitude),
      lng: parseFloat(req.body.longitude)
    }
  };
  
  // Handle unavailable dates
  if (req.body.unavailableDates) {
    updatedData.unavailableDates = Array.isArray(req.body.unavailableDates)
      ? req.body.unavailableDates.map(date => new Date(date))
      : JSON.parse(req.body.unavailableDates).map(date => new Date(date));
  }

  const listing = await Room.findByIdAndUpdate(listingId, updatedData, { new: true });
  
  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  res.json({
    success: true,
    message: 'Listing updated successfully',
    data: { listing }
  });
});

// Get listing by ID
exports.getListingById = catchAsync(async (req, res, next) => {
  const listing = await Room.findById(req.params.id);
  
  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  res.json({
    success: true,
    data: { listing }
  });
});

// Get image
exports.getImage = catchAsync(async (req, res, next) => {
    try {
      const mongoose = require('mongoose');
      
      if (!global.gfsBucket) {
        return next(new AppError('GridFS not initialized', 500));
      }
  
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      
      // Check if file exists
      const files = await global.gfsBucket.find({ _id: fileId }).toArray();
      if (!files || files.length === 0) {
        return next(new AppError('Image not found', 404));
      }
  
      const file = files[0];
      
      // Set content type
      res.set('Content-Type', file.contentType);
      
      // Create download stream
      const downloadStream = global.gfsBucket.openDownloadStream(fileId);
      
      // Handle errors
      downloadStream.on('error', (error) => {
        return next(new AppError('Error streaming image', 500));
      });
  
      // Pipe to response
      downloadStream.pipe(res);
    } catch (error) {
      console.error('Error fetching image:', error);
      return next(new AppError('Failed to fetch image', 500));
    }
  });

exports.getListings = catchAsync(async (req, res) => {
    try {
      const Room = require('../models/Room');
      const listings = await Room.find({}).sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: { listings }
      });
    } catch (error) {
      console.error('Error fetching listings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch listings',
        error: error.message
      });
    }
  });

// Delete listing
exports.deleteListing = catchAsync(async (req, res, next) => {
  const listing = await Room.findById(req.params.id);
  
  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  // Delete images from GridFS
  for (const imgId of listing.images) {
    await deleteFromGridFS(imgId);
  }

  await Room.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Listing deleted successfully'
  });
});

// Generate QR code for listing
exports.generateQRCode = catchAsync(async (req, res, next) => {
  const { listingId } = req.params;

  const listing = await Room.findById(listingId);
  if (!listing) {
    return next(new AppError('Listing not found', 404));
  }

  // Check if user owns this listing
  if (req.user.accountType === 'host' && listing.email !== req.user.email) {
    return next(new AppError('Access denied', 403));
  }

  const listingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/room/${listingId}`;
  const qrCodeDataURL = await qrcode.toDataURL(listingUrl);

  res.json({
    success: true,
    qrCode: qrCodeDataURL,
    listingUrl,
    listingTitle: listing.title
  });
});