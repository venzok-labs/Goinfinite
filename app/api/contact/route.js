// Forwards contact-form submissions to a Google Sheet via a Google Apps
// Script Web App (see /GOOGLE_SHEETS_SETUP.md for how to create one).
//
// This runs server-side so the Apps Script URL never ships to the browser
// and the request isn't subject to the browser's CORS restrictions —
// Apps Script Web Apps don't reliably set CORS headers for a direct
// client-side fetch, but a same-origin call to this route always works.

const SHEETS_WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL;

export async function POST(request) {
  if (!SHEETS_WEBHOOK_URL) {
    console.error("SHEETS_WEBHOOK_URL is not set — see GOOGLE_SHEETS_SETUP.md");
    return Response.json(
      { ok: false, error: "Form isn't connected to a spreadsheet yet." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { name, company, email, phone, industries, requirement } = body ?? {};
  if (!name || !company || !email || !phone || !requirement) {
    return Response.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }

  const payload = {
    name,
    company,
    email,
    phone,
    industries: Array.isArray(industries) ? industries.join(", ") : "",
    requirement,
    submittedAt: new Date().toISOString(),
  };

  try {
    const res = await fetch(SHEETS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Sheets webhook responded with an error:", res.status, text);
      return Response.json({ ok: false, error: "Couldn't save to the spreadsheet." }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Failed to reach the Sheets webhook:", err);
    return Response.json({ ok: false, error: "Couldn't reach the spreadsheet service." }, { status: 502 });
  }
}
