const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Configure your Gmail transporter
// You need to create an App Password for your Gmail account:
// 1. Go to https://myaccount.google.com/security
// 2. Enable 2-Step Verification if not already enabled
// 3. Go to App passwords (appears when 2FA is on)
// 4. Select "Mail" and "Windows Computer" (or your device)
// 5. Copy the 16-character password and use it below

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL || 'your-email@gmail.com',
    pass: process.env.GMAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * Send timesheet PDF via email
 * Authenticated endpoint - requires Firebase Auth token
 */
exports.sendTimesheetEmail = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Must be logged in to send emails'
    );
  }

  try {
    const { recipientEmail, subject, message, pdfBase64, employeeName, startDate, endDate } = data;

    // Validate required fields
    if (!recipientEmail || !pdfBase64) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing recipientEmail or PDF data'
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid recipient email format'
      );
    }

    // Build email body
    const senderEmail = context.auth.token.email;
    const emailBody = `
${message}

---
Employee: ${employeeName}
Period: ${startDate} to ${endDate}
Sent by: ${senderEmail}
`;

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const filename = `${employeeName.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.pdf`;

    // Send email with PDF attachment
    const mailOptions = {
      from: process.env.GMAIL_EMAIL || 'your-email@gmail.com',
      to: recipientEmail,
      subject: subject || 'Timesheet Report',
      text: emailBody.trim(),
      attachments: [
        {
          filename: filename,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    // Note: email sent successfully
    console.warn('Email sent:', info.messageId);

    return {
      success: true,
      message: `Email sent successfully to ${recipientEmail}`,
      messageId: info.messageId
    };

  } catch (error) {
    console.error('Error sending email:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to send email'
    );
  }
});

/**
 * Test endpoint to verify Cloud Function is working
 */
exports.testFunction = functions.https.onCall(async (_data, _context) => {
  return {
    status: 'Cloud Function is working',
    timestamp: new Date().toISOString()
  };
});
