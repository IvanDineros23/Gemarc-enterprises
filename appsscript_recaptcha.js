
// Google Apps Script for Gemarc Contact Form with reCAPTCHA v3 and Honeypot
function verifyRecaptcha(token) {
  var secretKey = '6LevkPorAAAAABIj9h0mJBrrgeUZX0VoRH6Mmuf5';
  var url = 'https://www.google.com/recaptcha/api/siteverify';
  var payload = {
    'secret': secretKey,
    'response': token
  };
  var options = {
    'method': 'post',
    'payload': payload
  };
  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());
  return result.success && result.score > 0.5; // Adjust score threshold as needed
}

function doPost(e) {
  try {
    var p = e.parameter;
    // Honeypot check (should be blank)
    if (p.website && p.website.trim() !== '') {
      return ContentService.createTextOutput("error: spam detected").setMimeType(ContentService.MimeType.TEXT);
    }
    // reCAPTCHA v3 check
    if (!verifyRecaptcha(p.recaptchaToken)) {
      return ContentService.createTextOutput("error: reCAPTCHA failed").setMimeType(ContentService.MimeType.TEXT);
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(),
      p.fullname || '',
      p.email || '',
      p.phone || '',
      p.company || '',
      p.service || '',
      p.message || ''
    ]);
    return ContentService
      .createTextOutput("ok")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService
      .createTextOutput("error: " + err)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}
