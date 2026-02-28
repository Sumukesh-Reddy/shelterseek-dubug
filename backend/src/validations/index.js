const authValidation = require('./authValidation');
const roomValidation = require('./roomValidation');
const bookingValidation = require('./bookingValidation');

module.exports = {
  ...authValidation,
  ...roomValidation,
  ...bookingValidation
};