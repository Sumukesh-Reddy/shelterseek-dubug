const Room = require('../models/Room');
const { Traveler, Host } = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { uploadMultipleToGridFS, deleteFromGridFS, getFileStream } = require('../services/gridfsService');
const qrcode = require('qrcode');

// Create listing
exports.createListing = catchAsync(async (req, res, next) => {
  try {
    // Parse and validate currentUser (accept string or object)
    let currentUser = req.body.currentUser;
    if (!currentUser) {
      return next(new AppError('User data is missing', 400));
    }
    if (typeof currentUser === 'string') {
      try {
        currentUser = JSON.parse(currentUser);
      } catch (err) {
        console.error('❌ Error parsing currentUser string:', err);
        return next(new AppError('Invalid user data', 400));
      }
    }

    if (!currentUser || !currentUser.name || !currentUser.email) {
      return next(new AppError('User data is incomplete', 400));
    }

    // Upload images to GridFS
    let imageIds = [];
    if (req.files && req.files.length > 0) {
      try {
        imageIds = await uploadMultipleToGridFS(req.files);
        console.log(`✅ Uploaded ${imageIds.length} images to GridFS`);
      } catch (err) {
        console.error('❌ Error uploading images to GridFS:', err);
        return next(new AppError('Failed to upload images', 500));
      }
    }

    // Validate and prepare listing data - ONLY include known fields to avoid duplicate key errors
    const listingData = {
      name: currentUser.name,
      email: currentUser.email,
      title: req.body.title || '',
      description: req.body.description || '',
      images: imageIds,
      price: parseFloat(req.body.price) || 0,
      maxdays: parseInt(req.body.maxdays) || 0,
      capacity: parseInt(req.body.capacity) || 0,
      bedrooms: parseInt(req.body.bedrooms) || 0,
      beds: parseInt(req.body.beds) || 0,
      roomSize: req.body.roomSize || '',
      roomType: req.body.roomType || '',
      propertyType: req.body.propertyType || '',
      location: req.body.location || '',
      discount: parseInt(req.body.discount) || 0,
      amenities: req.body.amenities ? req.body.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
      coordinates: {
        lat: parseFloat(req.body.latitude) || 0,
        lng: parseFloat(req.body.longitude) || 0
      },
      roomLocation: req.body.roomLocation || '',
      transportDistance: req.body.transportDistance || '',
      hostGender: req.body.hostGender || '',
      foodFacility: req.body.foodFacility || '',
      likes: 0,
      booking: false,
      reviews: [],
      unavailableDates: []
    };

    // Handle unavailable dates
    if (req.body.unavailableDates) {
      try {
        const dates = Array.isArray(req.body.unavailableDates) 
          ? req.body.unavailableDates 
          : JSON.parse(req.body.unavailableDates);
        listingData.unavailableDates = dates.map(date => new Date(date)).filter(d => !isNaN(d.getTime()));
      } catch (err) {
        console.error('⚠️ Error parsing unavailableDates:', err);
        listingData.unavailableDates = [];
      }
    }

    // Create and save the listing
    const listing = new Room(listingData);
    const savedListing = await listing.save();
    console.log(`✅ Listing created successfully: ${savedListing._id}`);

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      data: { listing: savedListing }
    });
  } catch (error) {
    console.error('❌ Error in createListing:', error);
    return next(new AppError(error.message || 'Failed to create listing', 500));
  }
});

// Update listing
exports.updateListing = catchAsync(async (req, res, next) => {
  try {
    const listingId = req.params.id;
    
    // Parse and validate currentUser (accept string or object)
    let currentUser = req.body.currentUser;
    if (!currentUser) {
      return next(new AppError('User data is missing', 400));
    }
    if (typeof currentUser === 'string') {
      try {
        currentUser = JSON.parse(currentUser);
      } catch (err) {
        console.error('❌ Error parsing currentUser string:', err);
        return next(new AppError('Invalid user data', 400));
      }
    }

    if (!currentUser || !currentUser.name || !currentUser.email) {
      return next(new AppError('User data is incomplete', 400));
    }

    const removedImages = req.body.removedImages ? req.body.removedImages.split(',').filter(id => id) : [];

    // Delete removed images from GridFS
    for (const imgId of removedImages) {
      try {
        await deleteFromGridFS(imgId);
        console.log(`✅ Deleted image from GridFS: ${imgId}`);
      } catch (err) {
        console.error(`⚠️ Error deleting image ${imgId}:`, err);
      }
    }

    // Upload new images to GridFS
    const newImageIds = [];
    if (req.files && req.files.length > 0) {
      try {
        const ids = await uploadMultipleToGridFS(req.files);
        newImageIds.push(...ids);
        console.log(`✅ Uploaded ${newImageIds.length} new images to GridFS`);
      } catch (err) {
        console.error('❌ Error uploading new images:', err);
        return next(new AppError('Failed to upload images', 500));
      }
    }

    // Prepare updated data - ONLY include known fields to avoid duplicate key errors
    const existingImages = req.body.existingImages ? JSON.parse(req.body.existingImages) : [];
    const updatedData = {
      name: currentUser.name,
      email: currentUser.email,
      title: req.body.title || '',
      description: req.body.description || '',
      images: [...existingImages, ...newImageIds],
      price: parseFloat(req.body.price) || 0,
      maxdays: parseInt(req.body.maxdays) || 0,
      capacity: parseInt(req.body.capacity) || 0,
      bedrooms: parseInt(req.body.bedrooms) || 0,
      beds: parseInt(req.body.beds) || 0,
      roomSize: req.body.roomSize || '',
      roomType: req.body.roomType || '',
      propertyType: req.body.propertyType || '',
      location: req.body.location || '',
      discount: parseInt(req.body.discount) || 0,
      amenities: req.body.amenities ? req.body.amenities.split(',').map(a => a.trim()).filter(a => a) : [],
      coordinates: {
        lat: parseFloat(req.body.latitude) || 0,
        lng: parseFloat(req.body.longitude) || 0
      },
      roomLocation: req.body.roomLocation || '',
      transportDistance: req.body.transportDistance || '',
      hostGender: req.body.hostGender || '',
      foodFacility: req.body.foodFacility || ''
    };
    
    // Handle unavailable dates
    if (req.body.unavailableDates) {
      try {
        const dates = Array.isArray(req.body.unavailableDates)
          ? req.body.unavailableDates
          : JSON.parse(req.body.unavailableDates);
        updatedData.unavailableDates = dates.map(date => new Date(date)).filter(d => !isNaN(d.getTime()));
      } catch (err) {
        console.error('⚠️ Error parsing unavailableDates:', err);
        updatedData.unavailableDates = [];
      }
    }

    // Update the listing
    const listing = await Room.findByIdAndUpdate(listingId, updatedData, { new: true });
    
    if (!listing) {
      return next(new AppError('Listing not found', 404));
    }

    console.log(`✅ Listing updated successfully: ${listing._id}`);

    res.json({
      success: true,
      message: 'Listing updated successfully',
      data: { listing }
    });
  } catch (error) {
    console.error('❌ Error in updateListing:', error);
    return next(new AppError(error.message || 'Failed to update listing', 500));
  }
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