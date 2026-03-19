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

function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeString(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function getWeekdaysInRange(startDate, endDate) {
  const dates = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const lastDate = new Date(`${endDate}T00:00:00Z`);

  while (cursor <= lastDate) {
    const day = cursor.getUTCDay();
    if (day >= 1 && day <= 5) {
      dates.push(cursor.toISOString().split('T')[0]);
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

exports.backfillEmployeeDailyLogs = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const requesterUid = context.auth.uid;
  const requesterDoc = await admin.firestore().collection('employees').doc(requesterUid).get();
  const requesterRole = requesterDoc.exists ? (requesterDoc.data().role || 'employee') : 'employee';

  if (requesterRole !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can run bulk backfill.');
  }

  const currentYear = String(new Date().getUTCFullYear());
  const startDate = data?.startDate || `${currentYear}-01-01`;
  const endDate = data?.endDate || `${currentYear}-03-15`;
  const timeIn = data?.timeIn || '08:00';
  const timeOut = data?.timeOut || '17:00';

  if (!isValidDateString(startDate) || !isValidDateString(endDate)) {
    throw new functions.https.HttpsError('invalid-argument', 'Dates must be YYYY-MM-DD.');
  }
  if (startDate > endDate) {
    throw new functions.https.HttpsError('invalid-argument', 'startDate must be <= endDate.');
  }
  if (!isValidTimeString(timeIn) || !isValidTimeString(timeOut)) {
    throw new functions.https.HttpsError('invalid-argument', 'Times must be HH:MM (24-hour).');
  }

  const weekdayDates = getWeekdaysInRange(startDate, endDate);
  if (weekdayDates.length === 0) {
    return {
      success: true,
      created: 0,
      skipped: 0,
      employeesProcessed: 0,
      weekdays: 0
    };
  }

  const employeesSnap = await admin.firestore().collection('employees').get();
  const employeeUids = [];

  employeesSnap.forEach((docSnap) => {
    const employeeData = docSnap.data() || {};
    const role = employeeData.role || 'employee';
    if (role === 'employee') {
      employeeUids.push(docSnap.id);
    }
  });

  if (employeeUids.length === 0) {
    return {
      success: true,
      created: 0,
      skipped: 0,
      employeesProcessed: 0,
      weekdays: weekdayDates.length
    };
  }

  const existingLogsSnap = await admin
    .firestore()
    .collection('daily_logs')
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .get();

  const existingKeys = new Set();
  existingLogsSnap.forEach((docSnap) => {
    const log = docSnap.data() || {};
    if (log.uid && log.date) {
      existingKeys.add(`${log.uid}__${log.date}`);
    }
  });

  const now = admin.firestore.FieldValue.serverTimestamp();
  const writes = [];
  let skipped = 0;

  for (const uid of employeeUids) {
    for (const date of weekdayDates) {
      const key = `${uid}__${date}`;
      if (existingKeys.has(key)) {
        skipped += 1;
        continue;
      }

      writes.push({
        uid,
        userId: uid,
        date,
        timeIn,
        timeOut,
        note: '',
        createdAt: now,
        updatedAt: now
      });
    }
  }

  const BATCH_LIMIT = 450;
  for (let index = 0; index < writes.length; index += BATCH_LIMIT) {
    const chunk = writes.slice(index, index + BATCH_LIMIT);
    const batch = admin.firestore().batch();

    chunk.forEach((payload) => {
      const ref = admin.firestore().collection('daily_logs').doc();
      batch.set(ref, payload);
    });

    await batch.commit();
  }

  return {
    success: true,
    created: writes.length,
    skipped,
    employeesProcessed: employeeUids.length,
    weekdays: weekdayDates.length,
    startDate,
    endDate,
    timeIn,
    timeOut
  };
});
