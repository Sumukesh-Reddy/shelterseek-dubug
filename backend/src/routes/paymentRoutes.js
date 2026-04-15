const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
function getRazorpayInstance() {
  return new Razorpay({
    key_id: process.env['razorpay.key.id'] || process.env.RAZORPAY_KEY_ID,
    key_secret: process.env['razorpay.key.secret'] || process.env.RAZORPAY_KEY_SECRET,
  });
}

// Create an order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const instance = getRazorpayInstance();
    const options = {
      amount: parseInt(amount) * 100, // amount in the smallest currency unit
      currency: currency || process.env['razorpay.currency'] || 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Something went wrong with payment gateway' });
  }
});

// Verify payment signature
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const secret = process.env['razorpay.key.secret'] || process.env.RAZORPAY_KEY_SECRET;
    
    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({ success: false, message: error.message || 'Verification Failed' });
  }
});

module.exports = router;
