# Email PDF Setup Guide

## Overview

The "Send Timesheet" button now generates a professional PDF and sends it via email instead of just downloading it locally.

## Requirements Setup

To enable email sending functionality, you need to configure **EmailJS** (a free service that allows sending emails directly from your web app).

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Your Gmail Account

1. In EmailJS dashboard, go to **Email Services**
2. Click **"Add Service"** and select **Gmail**
3. Choose **"Connect with Gmail"**
4. Authorize EmailJS to access your Gmail account
5. Note your **Service ID** (looks like: `service_xxxxx`)

### Step 3: Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **"Create New Template"**
3. Name it: `template_timesheet`
4. Use this template configuration:

```
To Email: {{to_email}}
Subject: {{subject}}

From: {{from_name}} ({{from_email}})

Message:
{{message}}

---
Timesheet PDF: {{filename}}
```

5. Save and note the **Template ID**

### Step 4: Get Your User ID

1. Go to **Account** in the dashboard
2. Copy your **User ID** (looks like: `user_xxxxxxxxxxxxx`)

### Step 5: Update Configuration in index.html

Find this section in the `sendPDFViaEmail()` function in `index.html` (around line 1335):

```javascript
body: JSON.stringify({
    service_id: 'service_f8h2x9b',  // ← Replace with your Service ID
    template_id: 'template_timesheet',  // ← Keep this or change if different
    user_id: 'your_emailjs_user_id',  // ← Replace with your User ID
```

Replace the placeholder values with your actual credentials:
- `service_id`: Your EmailJS Service ID
- `user_id`: Your EmailJS User ID
- `template_id`: Your template name

### Example Configuration:

```javascript
body: JSON.stringify({
    service_id: 'service_a1b2c3d4e5f6g7',
    template_id: 'template_timesheet',
    user_id: 'user_h8i9j0k1l2m3n4o5',
```

## Testing the Feature

1. Login to the app
2. Generate a timesheet (select dates and click "Go")
3. Click the **"📧 Send Timesheet"** button
4. Enter recipient email, subject, and message
5. Click **"Send Email"**
6. Check your email for the PDF

## Features

✅ **Professional PDF Generation** - Same quality as download  
✅ **Custom Email** - Choose recipient, subject, and message  
✅ **Validation** - Checks for valid email format  
✅ **Notifications** - Professional UI feedback  
✅ **Fallback** - Can still download if email fails  

## Troubleshooting

### "Failed to send the email"

- Verify EmailJS credentials are correct
- Check that Gmail account is connected in EmailJS
- Ensure template name matches exactly
- Check browser console for detailed error messages

### Client received invalid credential response

- Copy User ID and Service ID exactly from EmailJS dashboard
- No spaces before/after the IDs
- Verify credentials in the code

### Email not received

- Check spam/promotions folder
- Verify recipient email is correct
- Check EmailJS dashboard Activity log for delivery status
- Ensure Gmail app password is used if 2FA enabled

## Security Notes

⚠️ **Important**: Your EmailJS User ID will be visible in the browser. This is normal for EmailJS but:
- Make sure your email templates don't expose sensitive data
- Limit who can access your EmailJS account
- Monitor your EmailJS activity log regularly
- Consider service-to-service approach for production apps

## Alternative: Firebase Cloud Functions

For a more secure production setup, consider using Firebase Cloud Functions to handle email sending server-side. This would:
- Keep credentials secure (not visible in browser)
- Provide more control over email sending
- Allow additional backend validation

Contact support for migration to Cloud Functions approach.

## Free Tier Limits

EmailJS free plan includes:
- **200 emails per month** per email address
- Unlimited templates
- Full API access

For more emails, upgrade to a paid plan.

---

**Need Help?**
- EmailJS Support: https://www.emailjs.com/docs/
- Check browser console for detailed error messages
- Test credentials in EmailJS dashboard API section first
