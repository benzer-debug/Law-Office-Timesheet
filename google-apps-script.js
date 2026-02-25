function doPost(e) {
  try {
    // Parse the payload from the request
    let data;
    
    if (e.postData && e.postData.contents) {
      // Handle form-urlencoded payload
      const contents = e.postData.contents;
      // Manually parse URL-encoded string: "payload=xxxx"
      const decoded = decodeURIComponent(contents);
      const payloadMatch = decoded.match(/payload=(.+)$/);
      
      if (payloadMatch && payloadMatch[1]) {
        data = JSON.parse(payloadMatch[1]);
      } else {
        throw new Error('Could not parse payload from request');
      }
    } else if (e.parameter && e.parameter.payload) {
      // Handle parameter-based payload
      data = JSON.parse(e.parameter.payload);
    } else {
      throw new Error('No payload found in request');
    }
    
    // Validate input
    if (!data.recipientEmail || !data.pdfBase64) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Missing recipientEmail or pdfBase64' })
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
    Logger.log('Error:', error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
