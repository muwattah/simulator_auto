/**
 * RS Car Detailing - secure quote request / approval worker.
 * Backend-only credentials. Never expose admin approval tokens to the customer.
 */
const EMAIL_API = 'https://api.resend.com/emails';
const VAT = 0.21;
const DAY = 86400000;

export function safeText(value, max = 2000) {
  return String(value ?? '').slice(0, max);
}
export function escapeHtml(value) {
  return safeText(value, 20000).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
export function euros(cents) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
}
function show(value) {
  return value === true ? 'Ja' : value === false ? 'Nee' : safeText(value || '—', 200);
}
export function summaryFromPayload(p) {
  const c = p.customer || {}, v = p.vehicle || {}, s = p.systems || {}, i = p.installation || {};
  const lines = [
    'RS CAR DETAILING — CONFIGURATIE',
    'Referentie: ' + show(p.configurationId),
    'Datum: ' + show(p.createdAt),
    '',
    'KLANT',
    'Naam: ' + show(c.name),
    'Bedrijf: ' + show(c.company),
    'E-mail: ' + show(c.email),
    'Telefoon: ' + show(c.phone),
    'Postcode / plaats: ' + show(c.location),
    'Opmerkingen: ' + show(c.remarks),
    '',
    'VOERTUIG',
    'Categorie: ' + show(v.categoryName || v.categoryId),
    'Cabine: ' + show(v.cabType),
    '',
    'UITRUSTING',
    'Watertank: ' + show(s.tankName || s.tankId),
    'Vlotter: ' + show(s.floatValve),
    'Hogedrukreiniger: ' + show(s.pressureWasherName || s.pressureWasherId),
    'Hogedrukhaspel: ' + show(s.pressureReelName || s.pressureReelId),
    'Compressor: ' + show(s.compressorName || s.compressorId),
    'Persluchthaspel: ' + show(s.airReelName || s.airReelId),
    'Generator: ' + show(s.generatorName || s.generatorId),
    'Stroomhaspel: ' + show(s.powerReelName || s.powerReelId),
    'Stofzuiger: ' + show(s.vacuumName || s.vacuumId),
    'Bekleding: ' + show(i.liningName || i.liningId),
    'Frame: ' + show(i.frameComboName || i.frameComboId),
    'Flessenhouder: ' + show(i.bottleHolder),
    'Emmerhouder: ' + show(i.bucketHolder),
    'Levering / installatie: ' + show(i.installationType),
    '',
    "EXTRA'S",
    ...(Array.isArray(p.extras) && p.extras.length ? p.extras.map(e => '- ' + show(e?.name || e?.id)) : ['—']),
    '',
    'SPECIALE WENSEN',
    safeText(p.specialRequests || '—'),
    '',
    'Geschat watergewicht: ' + show(p.estimatedWaterWeightKg) + ' kg',
    'Ruimtewaarschuwingen:',
    ...(Array.isArray(p.layoutWarnings) && p.layoutWarnings.length ? p.layoutWarnings.map(w => '- ' + safeText(w, 400)) : ['Geen gemeld']),
    '',
    'Prijsstatus: op aanvraag. De definitieve prijs wordt door RS Car Detailing bevestigd.',
  ];
  return lines.join('\n');
}

function validRequest(p) {
  const c = p?.customer;
  return !!(
    p && typeof p === 'object' && c && typeof c === 'object' &&
    typeof c.name === 'string' && c.name.trim().length >= 2 && c.name.length <= 160 &&
    typeof c.email === 'string' && c.email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim()) &&
    typeof c.phone === 'string' && c.phone.trim().length >= 6 && c.phone.length <= 60 &&
    ['small','medium','large','trailer'].includes(p.vehicle?.categoryId) &&
    Array.isArray(p.extras) && p.extras.length <= 30 &&
    Array.isArray(p.layoutWarnings) && p.layoutWarnings.length <= 30 &&
    p.privacyConsent === true
  );
}

async function hmac(secret, value) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function approvalToken(env, id) {
  return hmac(env.APPROVAL_SECRET, 'approve:' + id);
}
async function reviewAllowed(env, id, token) {
  if (!/^RS-\d{4}-[0-9A-F]{12}$/.test(id) || !/^[0-9a-f]{64}$/.test(token)) return false;
  const expected = await approvalToken(env, id);
  let diff = 0;
  for (let n = 0; n < expected.length; n++) diff |= expected.charCodeAt(n) ^ token.charCodeAt(n);
  return diff === 0;
}
function configOk(env) {
  return !!(env.DB && env.RESEND_API_KEY && env.ADMIN_EMAIL && env.FROM_EMAIL &&
    env.APPROVAL_SECRET?.length >= 32 && env.PUBLIC_API_URL && env.FRONTEND_ORIGIN);
}
function json(data, status = 200, origin) {
  return new Response(JSON.stringify(data), {
    status, headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}),
    },
  });
}
function html(body, status = 200) {
  return new Response(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>RS Offerte goedkeuring</title><style>body{font-family:system-ui,sans-serif;background:#0d1117;color:#f1f5f9;max-width:780px;margin:30px auto;padding:18px}main{background:#19212b;border:1px solid #374151;border-radius:14px;padding:24px}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#111827;padding:18px;border-radius:8px;font-size:13px;line-height:1.5}input,textarea{font:inherit;box-sizing:border-box;width:100%;padding:12px;margin:8px 0 20px;background:#0d1117;border:1px solid #64748b;border-radius:6px;color:white}button{padding:13px 20px;background:#0284c7;border:0;border-radius:6px;color:white;font-weight:700;cursor:pointer}label{font-weight:600}small{color:#94a3b8}</style></head><body><main>${body}</main></body></html>`, {
    status, headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}
async function sendEmail(env, { to, subject, text, replyTo, key }) {
  const response = await fetch(EMAIL_API, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL, to: [to], subject, text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!response.ok) throw new Error('E-mailprovider reageerde met status ' + response.status);
}
async function notify(env, row) {
  const p = JSON.parse(row.payload_json);
  const summary = summaryFromPayload(p);
  const reviewUrl = env.PUBLIC_API_URL.replace(/\/$/, '') + '/review?id=' + encodeURIComponent(row.id) +
    '&token=' + await approvalToken(env, row.id);
  let adminSent = !!row.admin_sent_at;
  let customerSent = !!row.customer_sent_at;
  if (!adminSent) {
    try {
      await sendEmail(env, {
        to: env.ADMIN_EMAIL,
        replyTo: p.customer.email,
        subject: 'Nieuwe offerteaanvraag ' + row.id,
        text: 'Nieuwe offerteaanvraag ontvangen. Controleer de gegevens en keur pas goed nadat je de offerteprijs hebt bepaald.\n\n' +
          'BEKIJK EN KEUR GOED:\n' + reviewUrl + '\n\n' + summary,
        key: 'admin-' + row.id,
      });
      await env.DB.prepare('UPDATE quote_requests SET admin_sent_at = ? WHERE id = ?').bind(new Date().toISOString(), row.id).run();
      adminSent = true;
    } catch (error) {
      console.error('Admin email retry required:', String(error));
    }
  }
  if (!customerSent) {
    try {
      await sendEmail(env, {
        to: p.customer.email,
        replyTo: env.ADMIN_EMAIL,
        subject: 'Ontvangstbevestiging configuratie ' + row.id,
        text: 'Beste ' + safeText(p.customer.name, 160) + ',\n\n' +
          'We hebben je aanvraag ontvangen. Hieronder vind je alle door jou opgegeven configuratiegegevens. ' +
          'Dit is nog GEEN definitieve offerte. RS Car Detailing controleert je aanvraag en stuurt je zo spoedig mogelijk de offerte na goedkeuring.\n\n' +
          summary + '\n\nMet vriendelijke groeten,\nRS Car Detailing',
        key: 'receipt-' + row.id,
      });
      await env.DB.prepare('UPDATE quote_requests SET customer_sent_at = ? WHERE id = ?').bind(new Date().toISOString(), row.id).run();
      customerSent = true;
    } catch (error) {
      console.error('Customer email retry required:', String(error));
    }
  }
  return { adminSent, customerSent };
}
async function submit(request, env, origin) {
  if (!configOk(env)) return json({ ok: false, error: 'Online aanvragen zijn nog niet geconfigureerd.' }, 503, origin);
  const length = Number(request.headers.get('Content-Length') || 0);
  if (length > 30000) return json({ ok: false, error: 'Aanvraag te groot.' }, 413, origin);
  const raw = await request.text();
  if (raw.length > 30000) return json({ ok: false, error: 'Aanvraag te groot.' }, 413, origin);
  let input;
  try { input = JSON.parse(raw); } catch { return json({ ok: false, error: 'Ongeldige aanvraag.' }, 400, origin); }
  if (!validRequest(input)) return json({ ok: false, error: 'Controleer je naam, e-mail, telefoon en voertuigkeuze.' }, 400, origin);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await hmac(env.APPROVAL_SECRET, 'ip:' + ip);
  const hourAgo = new Date(Date.now() - 3600000).toISOString();
  const dayAgo = new Date(Date.now() - DAY).toISOString();
  const limited = await env.DB.prepare('SELECT COUNT(*) AS n FROM quote_requests WHERE ip_hash = ? AND created_at > ?')
    .bind(ipHash, hourAgo).first();
  const repeated = await env.DB.prepare('SELECT COUNT(*) AS n FROM quote_requests WHERE customer_email = ? AND created_at > ?')
    .bind(input.customer.email.trim().toLowerCase(), dayAgo).first();
  if (Number(limited?.n || 0) >= 5 || Number(repeated?.n || 0) >= 3)
    return json({ ok: false, error: 'Te veel aanvragen. Probeer later opnieuw.' }, 429, origin);

  const createdAt = new Date().toISOString();
  const random = [...crypto.getRandomValues(new Uint8Array(6))].map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
  const id = 'RS-' + new Date().getUTCFullYear() + '-' + random;
  const payload = {
    ...input,
    configurationId: id,
    createdAt,
    source: 'web-configurator',
    customer: { ...input.customer, email: input.customer.email.trim().toLowerCase() },
    pricing: { status: 'pending', knownSubtotal: 0, pendingCount: 0, pendingNames: [] },
  };
  await env.DB.prepare('INSERT INTO quote_requests (id, customer_email, ip_hash, payload_json, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, payload.customer.email, ipHash, JSON.stringify(payload), 'pending', createdAt, new Date(Date.now() + 14 * DAY).toISOString()).run();

  const mail = await notify(env, { id, payload_json: JSON.stringify(payload) });
  return json({
    ok: true, configurationId: id, createdAt,
    adminNotificationSent: mail.adminSent,
    customerReceiptSent: mail.customerSent,
    message: mail.customerSent
      ? 'Je aanvraag is opgeslagen. Een ontvangstbevestiging met je volledige configuratie is naar je e-mailadres verstuurd. Je definitieve offerte volgt na onze goedkeuring.'
      : 'Je aanvraag is opgeslagen. De ontvangstmail kon nog niet worden bevestigd; we proberen deze automatisch opnieuw. Je definitieve offerte volgt na onze goedkeuring.',
  }, 201, origin);
}
async function getReview(env, id, token) {
  if (!configOk(env) || !await reviewAllowed(env, id, token))
    return html('<h1>Ongeldige of verlopen link</h1>', 403);
  const row = await env.DB.prepare('SELECT * FROM quote_requests WHERE id = ?').bind(id).first();
  if (!row || Date.parse(row.expires_at) < Date.now()) return html('<h1>Link verlopen</h1>', 410);
  if (row.status === 'sent') return html('<h1>Offerte reeds verzonden</h1><p>Deze aanvraag is al bevestigd en naar de klant verstuurd.</p>');
  if (row.status === 'sending') return html('<h1>Verzending bezig</h1><p>Deze offerte wordt verwerkt. Ververs later de pagina.</p>');
  const summary = summaryFromPayload(JSON.parse(row.payload_json));
  return html(`<h1>Offerte beoordelen — ${escapeHtml(id)}</h1><p>Controleer de configuratie hieronder. Alleen jouw bevestiging verstuurt de definitieve offerte naar de klant.</p><pre>${escapeHtml(summary)}</pre><form method="post" action="/review"><input type="hidden" name="id" value="${escapeHtml(id)}"><input type="hidden" name="token" value="${escapeHtml(token)}"><label for="amount">Definitieve prijs exclusief 21% btw (€) *</label><input type="number" id="amount" name="amount" min="0.01" step="0.01" required placeholder="Bijv. 2450.00"><label for="message">Offertevoorwaarden / opmerkingen voor de klant</label><textarea id="message" name="message" rows="5" maxlength="4000" placeholder="Wat is inbegrepen, uitvoeringstermijn, geldigheidsduur, eventuele voorwaarden…"></textarea><small>Na bevestiging wordt de offerte onmiddellijk per e-mail aangeboden aan de klant. Dit kun je niet ongedaan maken.</small><p><button type="submit">Goedkeuren en offerte verzenden</button></p></form>`);
}
async function postReview(request, env) {
  if (!configOk(env)) return html('<h1>Service niet geconfigureerd</h1>', 503);
  const data = await request.formData();
  const id = safeText(data.get('id'), 100);
  const token = safeText(data.get('token'), 200);
  if (!await reviewAllowed(env, id, token)) return html('<h1>Ongeldige goedkeuring</h1>', 403);
  const row = await env.DB.prepare('SELECT * FROM quote_requests WHERE id = ?').bind(id).first();
  if (!row || Date.parse(row.expires_at) < Date.now()) return html('<h1>Goedkeuringslink verlopen</h1>', 410);
  if (row.status === 'sent') return html('<h1>Offerte was al verzonden</h1>');
  if (!['pending', 'failed'].includes(row.status)) return html('<h1>Offerte wordt al verwerkt</h1>', 409);

  const amount = safeText(data.get('amount'), 30).replace(',', '.');
  const message = safeText(data.get('message'), 4001).trim();
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 || message.length > 4000)
    return html('<h1>Ongeldige prijs of toelichting</h1><p>Gebruik een positief bedrag met maximaal twee decimalen (EUR).</p>', 400);
  const cents = Math.round(Number(amount) * 100);
  const updated = await env.DB.prepare("UPDATE quote_requests SET status = 'sending', amount_cents = ?, quote_message = ?, last_error = NULL WHERE id = ? AND status IN ('pending','failed')")
    .bind(cents, message, id).run();
  if (!updated.meta?.changes) return html('<h1>Offerte wordt al verwerkt</h1>', 409);

  const p = JSON.parse(row.payload_json);
  const vat = Math.round(cents * VAT);
  try {
    await sendEmail(env, {
      to: p.customer.email,
      replyTo: env.ADMIN_EMAIL,
      subject: 'Jouw offerte van RS Car Detailing — ' + id,
      text: 'Beste ' + safeText(p.customer.name, 160) + ',\n\n' +
        'Je aanvraag is door RS Car Detailing nagekeken en goedgekeurd. Hieronder vind je je offerte.\n\n' +
        'Offertebedrag excl. btw: ' + euros(cents) + '\n' +
        'Btw (21%): ' + euros(vat) + '\n' +
        'Totaal incl. btw: ' + euros(cents + vat) + '\n\n' +
        'Offertevoorwaarden / toelichting:\n' + (message || 'Geen extra voorwaarden opgegeven.') +
        '\n\n--- Jouw configuratie ---\n' + summaryFromPayload(p) +
        '\n\nMet vriendelijke groeten,\nRS Car Detailing',
      key: 'approved-' + id,
    });
    await env.DB.prepare("UPDATE quote_requests SET status = 'sent', approved_at = ?, last_error = NULL WHERE id = ?")
      .bind(new Date().toISOString(), id).run();
    return html('<h1>Offerte goedgekeurd</h1><p>De definitieve offerte is voor verzending aan de mailprovider aangeboden. Referentie: <strong>' + escapeHtml(id) + '</strong>.</p>');
  } catch (error) {
    await env.DB.prepare("UPDATE quote_requests SET status = 'failed', last_error = ? WHERE id = ?")
      .bind('Mailprovider kon het bericht niet aannemen', id).run();
    console.error('Final quote send failure:', String(error));
    return html('<h1>Verzending niet gelukt</h1><p>De offerte is niet als verzonden gemarkeerd. Probeer de goedkeuringslink opnieuw of controleer de e-mailservice.</p>', 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET')
      return json({ ok: true, service: 'rs-offerte' });
    if (url.pathname === '/review' && request.method === 'GET')
      return getReview(env, url.searchParams.get('id') || '', url.searchParams.get('token') || '');
    if (url.pathname === '/review' && request.method === 'POST')
      return postReview(request, env);
    if (url.pathname === '/api/quotes') {
      const origin = request.headers.get('Origin') || '';
      const accepted = env.FRONTEND_ORIGIN?.replace(/\/$/, '') || '';
      if (!origin || origin !== accepted) return json({ ok: false, error: 'Origin niet toegestaan.' }, 403);
      if (request.method === 'OPTIONS')
        return new Response(null, { status: 204, headers: {
          'Access-Control-Allow-Origin': accepted, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600',
          Vary: 'Origin',
        } });
      if (request.method !== 'POST') return json({ ok: false, error: 'Methode niet toegestaan.' }, 405, accepted);
      try { return await submit(request, env, accepted); }
      catch (error) {
        console.error('Quote creation failed:', String(error));
        return json({ ok: false, error: 'Opslaan mislukt. Probeer opnieuw.' }, 500, accepted);
      }
    }
    return new Response('Not found', { status: 404 });
  },

  async scheduled(_event, env, ctx) {
    if (!configOk(env)) return;
    ctx.waitUntil((async () => {
      const rows = await env.DB.prepare("SELECT * FROM quote_requests WHERE status IN ('pending','failed') AND (admin_sent_at IS NULL OR customer_sent_at IS NULL) AND expires_at > ? ORDER BY created_at LIMIT 15")
        .bind(new Date().toISOString()).all();
      for (const row of rows.results || []) await notify(env, row);
      await env.DB.prepare('DELETE FROM quote_requests WHERE created_at < ?')
        .bind(new Date(Date.now() - 90 * DAY).toISOString()).run();
    })());
  },
};
