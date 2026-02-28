// routes/roomRoutes.js
const express = require('express');
const roomController = require('../controllers/roomController');
const hostController = require('../controllers/hostController');
const { authenticateToken, roleMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// ========== PUBLIC ROUTES (No Authentication Required) ==========
router.get('/', roomController.getAllRooms);
router.get('/count', roomController.getRoomCounts);
router.get('/host/:email', roomController.getRoomsByHostEmail);
router.get('/images/:id', hostController.getImage);

// ✅ IMPORTANT: Listings routes - These MUST be defined here
router.get('/listings', hostController.getListings);           // GET all listings
router.get('/listings/:id', hostController.getListingById);    // GET single listing

// ========== PROTECTED ROUTES (Host Only) ==========
router.post('/listings',
  authenticateToken,
  roleMiddleware.hostOnly,
  upload.array('images', 12),
  hostController.createListing
);

router.put('/listings/:id',
  authenticateToken,
  roleMiddleware.hostOnly,
  upload.array('images', 12),
  hostController.updateListing
);

// Status update (host/admin)
router.patch('/listings/:listingId/status',
  authenticateToken,
  (req, res, next) => {
    if (req.user.accountType === 'host' || req.user.accountType === 'admin') {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied' });
  },
  roomController.updateListingStatus
);

router.delete('/listings/:id',
  authenticateToken,
  roleMiddleware.hostOnly,
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

module.exports = router;