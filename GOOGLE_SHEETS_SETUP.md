# Connecting the contact form to a Google Sheet

The site's contact form (`components/ContactSection.jsx`) submits to
`app/api/contact/route.js`, which forwards the enquiry to a Google Sheet
via a **Google Apps Script Web App**. This is free and needs no Google
Cloud project, service account, or paid API — just a script attached to
the spreadsheet itself.

## 1. Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   sheet — name it something like "Website Enquiries".
2. In row 1, add these headers (matching the fields the API route sends):

   ```
   submittedAt | name | company | email | phone | industries | requirement
   ```

## 2. Add the Apps Script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete the placeholder code and paste this in:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);

     sheet.appendRow([
       data.submittedAt || new Date().toISOString(),
       data.name || "",
       data.company || "",
       data.email || "",
       data.phone || "",
       data.industries || "",
       data.requirement || "",
     ]);

     return ContentService
       .createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Save** (name the project e.g. "Contact form webhook").

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as**: Me (your Google account)
   - **Who has access**: Anyone
4. Click **Deploy**, then **Authorize access** and approve the permissions
   Google asks for (it's your own script, acting on your own sheet).
5. Copy the **Web app URL** it gives you — looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 4. Point the site at it

1. Copy `.env.local.example` to `.env.local` in the project root.
2. Paste the Web App URL in as `SHEETS_WEBHOOK_URL`:

   ```
   SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
   ```

3. Restart the dev server (`npm run dev`) so it picks up the new env var.

That's it — submitting the contact form now appends a row to the sheet.

## Notes

- `.env.local` is already git-ignored — never commit the real Web App URL
  or check it into version control.
- If you redeploy the Apps Script later (e.g. after editing it), Google
  gives you a **new** Web App URL unless you deploy it as a new *version*
  of the *same* deployment — use "Manage deployments → Edit → New version"
  to keep the same URL.
- In production (Vercel, etc.), set `SHEETS_WEBHOOK_URL` as an environment
  variable in the hosting dashboard — `.env.local` only applies locally.
