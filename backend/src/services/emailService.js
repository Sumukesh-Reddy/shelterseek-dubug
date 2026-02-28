const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER || process.env.EMAIL;
  
  if (!emailUser || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: emailUser, pass: process.env.EMAIL_PASS }
  });
};

// Send OTP email
const sendOTPEmail = async (toEmail, otp) => {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error('Email not configured');
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: '🔐 Your ShelterSeek Verification Code',
    html: `
      <div style="
          max-width: 480px;
          margin: auto;
          padding: 25px;
          background: #ffffff;
          border-radius: 12px;
          font-family: Arial, Helvetica, sans-serif;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          color: #333;
          line-height: 1.6;
      ">
          <h2 style="
              text-align: center;
              color: #d72d6e;
              margin-bottom: 10px;
              font-size: 24px;
          ">
              🔐 ShelterSeek Verification
          </h2>
          <p style="font-size: 15px; margin-bottom: 18px;">
              Hello Traveler 👋,<br><br>
              Use the following One-Time Password (OTP) to verify your account:
          </p>
          <div style="
              text-align: center;
              background: #ffe8f1;
              border-left: 5px solid #d72d6e;
              padding: 18px 20px;
              border-radius: 8px;
              margin: 20px 0;
          ">
              <p style="
                  font-size: 34px;
                  letter-spacing: 4px;
                  color: #d72d6e;
                  font-weight: bold;
                  margin: 0;
              ">
                  ${otp}
              </p>
              <p style="font-size: 13px; color: #777; margin-top: 8px;">
                  ⏳ Valid for 10 minutes
              </p>
          </div>
          <p style="font-size: 14px; color:#444;">
              ⚠️ Please keep this code confidential.<br>
              Do not share it with anyone for your security.
          </p>
          <p style="font-size: 13px; color:#777; margin-top: 25px; text-align: center;">
              If you did not request this verification code, you may safely ignore this email.
              <br><br>
              — Team ShelterSeek 💖
          </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (toEmail, bookingDetails) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('Email not configured, skipping confirmation email');
    return;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Booking Confirmation - ShelterSeek',
    html: `
      <div style="
            max-width: 520px;
            margin: auto;
            padding: 25px;
            background: #ffffff;
            border-radius: 14px;
            font-family: 'Segoe UI', Arial, sans-serif;
            box-shadow: 0 6px 18px rgba(0,0,0,0.1);
            line-height: 1.5;
            color: #333;
      ">
            <h1 style="
                color: #d72d6e;
                text-align: center;
                font-size: 28px;
                margin-bottom: 5px;
            ">
                Hello Traveler! 🏡
            </h1>
            <h2 style="
                text-align: center;
                color: #d72d6e;
                font-size: 22px;
                margin-bottom: 20px;
            ">
                🎉 Your Booking is Confirmed!
            </h2>
            <div style="
                background: #ffe8f1;
                border-left: 5px solid #d72d6e;
                padding: 15px 18px;
                border-radius: 8px;
                margin-bottom: 20px;
            ">
                <p style="margin: 8px 0;"><strong>🆔 Booking ID:</strong> ${bookingDetails.bookingId}</p>
                <p style="margin: 8px 0;"><strong>🏨 Room:</strong> ${bookingDetails.roomTitle}</p>
                <p style="margin: 8px 0;"><strong>📅 Check-in:</strong> ${formatDate(bookingDetails.checkIn)}</p>
                <p style="margin: 8px 0;"><strong>📅 Check-out:</strong> ${formatDate(bookingDetails.checkOut)}</p>
                <p style="margin: 8px 0;"><strong>💰 Total Cost:</strong> 
                    <span style="color:#d72d6e; font-weight:600;">₹${bookingDetails.totalCost}</span>
                </p>
                <p style="margin: 8px 0;"><strong>🔖 Transaction ID:</strong> ${bookingDetails.transactionId}</p>
            </div>
            <p style="font-size: 15px; color:#555; text-align:center;">
                Thank you for choosing <strong>ShelterSeek</strong> for your stay! 💖  
                <br>We wish you a wonderful and memorable experience 😊
            </p>
            <div style="text-align:center; margin-top: 18px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/BookedHistory" style="
                    padding: 10px 18px;
                    background: #d72d6e;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                ">🔍 View Booking Details</a>
            </div>
            <p style="text-align:center; margin-top:25px; color:#888; font-size:13px;">
                Need help? Contact us anytime at  
                <a style="color:#d72d6e;" href="mailto:shelterseekrooms@gmail.com">shelterseekrooms@gmail.com</a> 📩
            </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Send test email
const sendTestEmail = async (toEmail) => {
  const transporter = createTransporter();
  if (!transporter) {
    return { success: false, message: 'Email not configured' };
  }

  const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Test OTP Email - Working!',
    html: `<p>Your test OTP is: <strong>${testOtp}</strong></p>`
  });

  return { success: true, message: 'Test email sent!', testOtp };
};

module.exports = {
  sendOTPEmail,
  sendBookingConfirmationEmail,
  sendTestEmail
};