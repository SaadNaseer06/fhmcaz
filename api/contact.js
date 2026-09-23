/**
 * Vercel serverless contact form handler.
 * Replaces PHP contact.php on Vercel.
 *
 * Optional: set RESEND_API_KEY + CONTACT_TO_EMAIL to send real email.
 * Without them, submissions are accepted and logged (useful for testing).
 */
export default async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  // Vercel may pass parsed body or raw string depending on content-type
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = Object.fromEntries(new URLSearchParams(body));
    } catch {
      body = {};
    }
  }
  if (!body || typeof body !== 'object') body = {};

  // Honeypot
  if (body.company) {
    return res.status(200).send('OK');
  }

  const clean = (v, max) =>
    String(v ?? '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, max);

  const name = clean(body.name, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 30);
  const message = clean(body.message, 2000);
  const formType = clean(body.form_type, 40) || 'contact';
  const visitType = clean(body.visit_type, 120);

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send('Please provide a valid name, email, and message.');
  }

  const subject =
    (formType === 'appointment' ? 'Appointment request' : 'Contact form') +
    ' — FHMC AZ';
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    visitType ? `Visit type: ${visitType}` : null,
    `Type: ${formType}`,
    '',
    'Message:',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  const to = process.env.CONTACT_TO_EMAIL || 'info@fhmcaz.com';
  const resendKey = process.env.RESEND_API_KEY;

  if (resendKey) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || 'FHMC Website <onboarding@resend.dev>',
          to: [to],
          reply_to: email,
          subject,
          text,
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('Resend error', err);
        return res.status(502).send('Unable to send message right now. Please call us.');
      }
    } catch (e) {
      console.error(e);
      return res.status(502).send('Unable to send message right now. Please call us.');
    }
  } else {
    console.log('[contact submission]', { subject, text });
  }

  // Redirect back with success for classic form POST
  const referer = req.headers.referer || '/contact-us/';
  const sep = referer.includes('?') ? '&' : '?';
  res.writeHead(303, { Location: `${referer}${sep}sent=1` });
  return res.end();
}
