# Google Apps Script Email Setup Guide (FREE)

This is the **easiest and completely free** way to send PDFs via email. Google Apps Script is Google's built-in scripting platform and can send emails with attachments.

## Step 1: Create a Google Apps Script Project

1. Go to https://script.google.com
2. Click **"New project"**
3. Name it: `Law Office Timesheet Mailer`
4. Delete the default `myFunction()` code

## Step 2: Copy the Script Code

Replace everything with this code:

```javascript
// Google Apps Script for sending timesheet PDF emails

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate input
    if (!data.recipientEmail || !data.pdfBase64) {
      return ContentService.createTextOutput(
        JSON.stringify({success: false, error: 'Missing email or PDF'})
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Convert base64 to blob
    const pdfBlob = Utilities.newBlob(
      Utilities.base64Decode(data.pdfBase64),
      'application/pdf',
      data.filename || 'timesheet.pdf'
    );

    // Build email body
    const emailBody = `
${data.message}

---
Employee: ${data.employeeName}
Period: ${data.startDate} to ${data.endDate}
Sent from: Law Office Timesheet App
`;

    // Send email with PDF attachment
    GmailApp.sendEmail(
      data.recipientEmail,
      data.subject || 'Timesheet Report',
      emailBody.trim(),
      {
        attachments: [pdfBlob]
      }
    );

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: `Email sent to ${data.recipientEmail}`
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({success: false, error: error.toString()})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

Click **"Save"** (keyboard shortcut: Ctrl+S)

## Step 3: Deploy as Web App

1. Click **"Deploy"** button (top right)
2. Click **"New Deployment"**
3. Click the dropdown and select **"Web App"**
4. Fill in:
   - **Execute as**: Your Google account
   - **Who has access**: **Anyone** (important!)
5. Click **"Deploy"**
6. Authorize the script (click "Grant permission" if asked)
7. **Copy the deployment URL** (it looks like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/userweb`)

## Step 4: Add the URL to Your App

1. Open `index.html` in your code editor
2. Find this line around line ~1390:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
   ```
3. Replace with your actual URL:
   ```javascript
   const SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/userweb';
   ```
4. Save the file

## Step 5: Test It!

1. Open your application
2. Log in
3. Fill in a timesheet:
   - Employee name
   - Start date
   - End date
   - Daily rate
   - Any other fields
4. Click **"Send Timesheet"** button
5. Fill in the email form:
   - **Recipient Email**: Where to send the PDF
   - **Subject**: Email subject
   - **Message**: Email body text
6. Click **"Send PDF"**

You should receive the email **with the PDF attached**!

## How It Works

1. **Frontend** generates PDF and converts to base64
2. **Frontend** sends the base64 to your Google Apps Script URL
3. **Google Apps Script** receives the data
4. **Google Apps Script** converts base64 back to PDF
5. **Google Apps Script** sends email with PDF attachment using Gmail
6. **Recipient** receives email with PDF!

## Cost?

**COMPLETELY FREE!**
- Google Apps Script: Free
- Gmail sending: Free (up to 100 emails/day)
- No credit card needed
- No limits on deployment

## Troubleshooting

### "Failed to send email"
- Make sure you deployed it with "Anyone" access
- Check that you copied the full URL correctly
- Try redeploying

### Email not received
- Check spam/junk folder
- Make sure recipient email is correct
- Look at **Execution log** in Apps Script (click View → Execution log)

### Script is old/not working
To update the script:
1. Go back to https://script.google.com
2. Find your project
3. Edit the code
4. Click **"Deploy"** → **"New Deployment"**
5. Delete the old deployment first (optional)
6. The new URL will replace the old one

## That's it!

Your app now sends PDFs with zero cost. The script uses your Gmail account, so emails come from you.
