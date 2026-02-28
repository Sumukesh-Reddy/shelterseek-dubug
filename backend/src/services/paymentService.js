const crypto = require('crypto');

// Generate transaction ID
const generateTransactionId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

// Process payment (mock implementation)
const processPayment = async (paymentDetails) => {
  const { amount, paymentMethod, cardDetails } = paymentDetails;

  // Validate payment details
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Mock payment processing logic
  // In production, integrate with actual payment gateway (Razorpay, Stripe, etc.)
  
  const transactionId = generateTransactionId();
  const paymentDate = new Date();

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock success/failure (90% success rate)
  const isSuccess = Math.random() < 0.9;

  if (!isSuccess) {
    throw new Error('Payment failed');
  }

  // Determine card type from first few digits (mock)
  let cardType = 'other';
  if (cardDetails?.cardNumber) {
    const firstDigit = cardDetails.cardNumber[0];
    if (firstDigit === '4') cardType = 'visa';
    else if (firstDigit === '5') cardType = 'mastercard';
    else if (firstDigit === '3') cardType = 'amex';
    else if (firstDigit === '6') cardType = 'rupay';
  }

  // Get last 4 digits of card
  const cardLastFour = cardDetails?.cardNumber?.slice(-4) || '';

  return {
    success: true,
    transactionId,
    paymentDate,
    paymentMethod,
    cardType,
    cardLastFour,
    amount
  };
};

// Verify payment
const verifyPayment = async (transactionId) => {
  // In production, verify with payment gateway
  return {
    verified: true,
    transactionId,
    status: 'completed'
  };
};

// Process refund
const processRefund = async (transactionId, amount) => {
  // In production, initiate refund with payment gateway
  return {
    success: true,
    refundId: `REF${Date.now()}`,
    transactionId,
    amount,
    refundDate: new Date()
  };
};

// Get payment status
const getPaymentStatus = async (transactionId) => {
  // In production, check status with payment gateway
  return {
    transactionId,
    status: 'completed',
    paymentDate: new Date()
  };
};

// Calculate booking amount
const calculateBookingAmount = (roomPrice, days, discount = 0, guests = 1) => {
  const subtotal = roomPrice * days;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  
  return {
    subtotal,
    discountAmount,
    total,
    currency: 'INR'
  };
};

// Validate payment details
const validatePaymentDetails = (paymentDetails) => {
  const errors = [];

  if (!paymentDetails.paymentMethod) {
    errors.push('Payment method is required');
  }

  if (paymentDetails.paymentMethod === 'credit_card' || paymentDetails.paymentMethod === 'debit_card') {
    if (!paymentDetails.cardNumber) {
      errors.push('Card number is required');
    } else if (!/^\d{16}$/.test(paymentDetails.cardNumber.replace(/\s/g, ''))) {
      errors.push('Invalid card number');
    }

    if (!paymentDetails.expiryDate) {
      errors.push('Expiry date is required');
    } else {
      const [month, year] = paymentDetails.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
      if (expiry < new Date()) {
        errors.push('Card has expired');
      }
    }

    if (!paymentDetails.cvv) {
      errors.push('CVV is required');
    } else if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
      errors.push('Invalid CVV');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  generateTransactionId,
  processPayment,
  verifyPayment,
  processRefund,
  getPaymentStatus,
  calculateBookingAmount,
  validatePaymentDetails
};