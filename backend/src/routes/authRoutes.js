const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateLogin, validateRegister } = require('../validations/authValidation');

const router = express.Router();

// Local auth
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/signup', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    failureMessage: true 
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_DASHBOARD_URL || 'http://localhost:3000/dashboard');
  }
);

router.get('/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

// Test email config
router.get('/test-email-config', async (req, res) => {
  try {
    const emailUser = process.env.EMAIL_USER || process.env.EMAIL;
    const hasEmailCreds = Boolean(emailUser && process.env.EMAIL_PASS);

    res.json({ 
      success: true, 
      configured: hasEmailCreds, 
      email: emailUser 
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

router.post('/simple-email-test', async (req, res) => {
  try {
    const { toEmail } = req.body;
    const { sendTestEmail } = require('../services/emailService');
    
    const result = await sendTestEmail(toEmail);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;