const { body } = require('express-validator');

const validateBooking = [
  body('roomId').notEmpty().withMessage('Room ID is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  body('days').isNumeric().withMessage('Days must be a number'),
  body('totalCost').isNumeric().withMessage('Total cost must be a number'),
  body('guests').optional().isNumeric().withMessage('Guests must be a number')
];

const validateGuestDetails = [
  body('guestDetails.*.guestName').notEmpty().withMessage('Guest name is required'),
  body('guestDetails.*.guestAge').optional().isNumeric().withMessage('Guest age must be a number'),
  body('guestDetails.*.guestGender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('guestDetails.*.govtIdType').optional().isIn(['aadhar', 'passport', 'driving_license', 'voter_id', 'pan_card', 'other']).withMessage('Invalid ID type')
];

module.exports = {
  validateBooking,
  validateGuestDetails
};