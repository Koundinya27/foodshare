const nodemailer = require('nodemailer');

// Create transporter
let transporter;

try {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.error('⚠️ Email transporter setup failed:', error.message);
}

const sendEmail = async (to, subject, html) => {
  try {
    if (!transporter) {
      console.log('📧 Email not configured, skipping...');
      return;
    }
    
    await transporter.sendMail({
      from: `"Food Sharing Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('📧 Email sent to:', to);
  } catch (error) {
    console.error('❌ Email error:', error.message);
    // Don't throw error - let registration continue
  }
};

module.exports = { sendEmail };
