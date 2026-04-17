const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const express = require('express');
const roomController = require('../controllers/roomController');
const hostController = require('../controllers/hostController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const AppError = require('../utils/appError');

const router = express.Router();

// ========== PUBLIC ROUTES (No Authentication Required) ==========
router.get('/', cacheMiddleware(300), roomController.getAllRooms);
router.get('/count', cacheMiddleware(3600), roomController.getRoomCounts);
router.get('/host/:email', roomController.getRoomsByHostEmail);
router.get('/images/:id', hostController.getImage);

// ✅ IMPORTANT: Listings routes - These MUST be defined here
router.get('/listings', cacheMiddleware(300), hostController.getListings);           // GET all listings
router.get('/listings/:id', hostController.getListingById);    // GET single listing

// ========== PROTECTED ROUTES (Host Only) ==========
router.post('/listings',
  authenticateToken,
  roleMiddleware.hostOnly,
  (req, res, next) => {
    upload.array('images', 12)(req, res, (err) => {
      if (err) return next(new AppError(err.message || 'Image upload failed', 400));
      next();
    });
  },
  hostController.createListing
);

router.put('/listings/:id',
  authenticateToken,
  roleMiddleware.hostOnly,
  (req, res, next) => {
    upload.array('images', 12)(req, res, (err) => {
      if (err) return next(new AppError(err.message || 'Image upload failed', 400));
      next();
    });
  },
  hostController.updateListing
);

// Status update (host/admin)
router.patch('/listings/:listingId/status',
  authenticateToken,
  (req, res, next) => {
    const isListingsManager =
      req.user.accountType === 'manager' &&
      String(req.user.department || '').trim().toLowerCase() === 'listings';

    if (req.user.accountType === 'host' || req.user.accountType === 'admin' || isListingsManager) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied' });
  },
  roomController.updateListingStatus
);

router.delete('/listings/:id',
  authenticateToken,
  (req, res, next) => {
    const isListingsManager =
      req.user.accountType === 'manager' &&
      String(req.user.department || '').trim().toLowerCase() === 'listings';

    if (req.user.accountType === 'host' || req.user.accountType === 'admin' || isListingsManager) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied' });
  },
  hostController.deleteListing
);

// Room booking toggle
router.put('/:roomId/book',
  authenticateToken,
  roleMiddleware.travelerOnly,
  roomController.updateRoomBooking
);

// QR code generation
router.get('/:listingId/qr',
  authenticateToken,
  roleMiddleware.hostOnly,
  hostController.generateQRCode
);

router.get('/listings/:listingId/qr',
    authenticateToken,
    roleMiddleware.hostOnly,
    hostController.generateQRCode
  );

module.exports = router;
