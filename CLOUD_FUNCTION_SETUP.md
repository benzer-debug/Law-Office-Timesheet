# Cloud Function Email Setup Guide

This guide explains how to deploy the Firebase Cloud Function that sends timesheet PDFs via email.

## Step 1: Set Up Gmail App Password

The Cloud Function needs a Gmail account to send emails. Follow these steps:

### 1.1 Enable 2-Step Verification
1. Go to https://myaccount.google.com/security
2. Sign in with the Gmail account you want to use for sending emails
3. Look for **"2-Step Verification"** and click it
4. Follow the prompts to enable 2-Step Verification (you'll need your phone)

### 1.2 Get App Password
1. After 2-Step Verification is enabled, go back to https://myaccount.google.com/security
2. Click on **"App passwords"** (only appears when 2FA is enabled)
3. Select:
   - App: **Mail**
   - Device: **Windows Computer** (or your device type)
4. Click **Generate**
5. Google will show a 16-character password (example: `abcd efgh ijkl mnop`)
6. **Copy this password** - you'll need it in Step 3

## Step 2: Install Firebase Tools (if not already installed)

Open a terminal in your project folder and run:

```bash
npm install -g firebase-tools
```

Then log in to Firebase:

```bash
firebase login
```

## Step 3: Set Environment Variables

Create a `.env.local` file in the `functions` folder with your Gmail credentials:

```bash
# functions/.env.local
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important:** Replace with your actual Gmail and the 16-character App Password from Step 1.2

## Step 4: Deploy the Cloud Function

In your project root directory, run:

```bash
firebase deploy --only functions
```

This will:
1. Upload the Cloud Function to Firebase
2. Create the `sendTimesheetEmail` function
3. Make it accessible from your frontend

Wait for the deployment to complete. You should see:
```
functions: Deployed successfully
```

## Step 5: Test the Feature

1. Open your application in a browser
2. Log in with your Firebase account
3. Fill in a timesheet:
   - Employee name
   - Start date
   - End date
   - Daily rate
   - Any other required fields
4. Click **"Send Timesheet"** button
5. Fill in the email form:
   - **Recipient Email**: The email address to send to
   - **Subject**: Email subject line
   - **Message**: Additional message text
6. Click **"Send PDF"**

You should see a success message and receive the email with the PDF attached!

## Troubleshooting

### "Must be logged in to send emails"
- Make sure you're logged into the application with your Firebase account
- The Cloud Function requires authentication

### "Gmail App Password is incorrect"
- Go back to Google Account → App passwords
- Generate a new password and update `.env.local`
- Redeploy: `firebase deploy --only functions`

### Email not received
- Check spam/junk folder
- Make sure the recipient email is correct and valid
- Check Firebase Cloud Function logs:
  ```bash
  firebase functions:log
  ```

### "Failed to send email" with no message
- Check if Cloud Function deployed successfully:
  ```bash
  firebase deploy --only functions
  ```
- Verify Gmail credentials in `.env.local`

## What Happens Behind the Scenes

1. **Frontend** generates the timesheet PDF and converts it to base64
2. **Frontend** calls the Cloud Function with:
   - PDF data (base64)
   - Recipient email
   - Subject and message
3. **Cloud Function** (running on Firebase servers):
   - Validates the request
   - Converts base64 back to PDF
   - Connects to Gmail via Nodemailer
   - Sends the email with PDF attached
4. **Recipient** receives the email with the PDF attached

## Security Notes

- The `.env.local` file is **not** uploaded to Git (add to `.gitignore`)
- Only logged-in users can send emails (Cloud Function checks Firebase Auth)
- Gmail App Passwords have limited permissions (email only)
- The 16-character password is safer than your main Gmail password

## Next Steps

- Once deployed, your "Send Timesheet" feature will work!
- Users can now send timesheet PDFs directly to managers/accounting
- The PDF is attached to the email, not sent as a link
