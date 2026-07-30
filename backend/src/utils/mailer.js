const config = require('../config');

// Safe dynamic require for nodemailer
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (_) {
  nodemailer = null;
}

/**
 * Send OTP via Nodemailer if SMTP configured and module present,
 * otherwise fall back gracefully to console logging.
 */
const sendOTP = async (email, otp) => {
  if (nodemailer && process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CorpVerse Security" <noreply@corpverse.com>',
        to: email,
        subject: '[CorpVerse] Email Verification OTP Code',
        html: `<div style="font-family: monospace; background: #090C15; color: #fff; padding: 20px; border-radius: 8px;">
          <h2 style="color: #00f5a0;">CorpVerse Identity Verification</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #00f5a0; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #888;">This code expires in 10 minutes.</p>
        </div>`,
      });
      console.log(`✉️ OTP email sent to ${email}`);
      return;
    } catch (err) {
      console.error('❌ Failed to send SMTP email:', err.message);
    }
  }

  // Fallback dev console log
  console.log(`\n========================================`);
  console.log(`🔑 DEV OTP CODE FOR ${email}: ${otp}`);
  console.log(`========================================\n`);
};

module.exports = { sendOTP };
