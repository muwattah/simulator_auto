/**
 * Private Cloudflare Worker for RS Car Detailing quote requests.
 *
 * Secrets are configured only in Cloudflare, never in the public Vite bundle:
 * RESEND_API_KEY, TURNSTILE_SECRET_KEY, QUOTE_FROM_EMAIL, QUOTE_ADMIN_EMAIL.
 * Required public variable: ALLOWED_ORIGIN.
 */
const MAX_BODY_BYTES = 5_000_000;
const MAX_IMAGE_BASE64 = 3_000_000;
const ID_PATTERN = /^RS-20\d\d-[A-HJ-NP-Z2-9]{8}$/;
const emailOk = value => typeof value === 'string' && value.length <= 254 &&
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const limit = (value, max = 300) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const htmlEscape = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function cors(origin, expected) {
  return {
    'Access-Control-Allow-Origin': origin === expected ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}
function reply(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
}
function names(values, fields) {
  return fields.map(([title, key]) => {
    const value = values?.[key];
    return title + ': ' + (value === true ? 'Ja' : value === false ? 'Nee' : limit(value, 250) || '—');
  });
}
function quoteLines(p) {
  const lines = [
    'RS CAR DETAILING — OFFERTEAANVRAAG',
    'Referentie: ' + p.configurationId,
    'Status: Ontvangen, nog geen definitieve offerte.',
    '',
    'Klant: ' + limit(p.customer.name),
    'Bedrijf: ' + (limit(p.customer.company) || '—'),
    'E-mail: ' + p.customer.email,
    'Telefoon: ' + limit(p.customer.phone, 60),
    'Locatie: ' + (limit(p.customer.location) || '—'),
    'Bestelwagen van klant: ' + limit(p.vehicle.customerDescription, 180),
    '',
    'GEKOZEN APPARATUUR',
    ...names(p.systems, [
      ['Watertank', 'tankName'], ['Vlotter', 'floatValve'],
      ['Hogedrukreiniger', 'pressureWasherName'], ['Hogedrukhaspel', 'pressureReelName'],
      ['Compressor', 'compressorName'], ['Luchthaspel', 'airReelName'],
      ['Generator', 'generatorName'], ['Stroomhaspel', 'powerReelName'],
      ['Stofzuiger', 'vacuumName'],
    ]),
    ...names(p.installation, [
      ['Bekleding', 'liningName'], ['Frame', 'frameComboName'],
      ['Flessenhouder', 'bottleHolder'], ['Emmerhouder', 'bucketHolder'],
      ['Installatiewijze', 'installationType'],
    ]),
    'Andere onderdelen: ' + (Array.isArray(p.extras) ? p.extras.slice(0, 40).map(x => limit(x.name, 120)).filter(Boolean).join(', ') : ''),
    'Deurmontages: ' + Object.entries(p.installation.doorMounts ?? {}).slice(0, 30)
      .map(([item, place]) => limit(item, 90) + ' op ' + limit(place, 40)).join('; '),
    'Geschat watergewicht: ' + (Number.isFinite(p.estimatedWaterWeightKg) ? Math.round(p.estimatedWaterWeightKg) + ' kg' : 'onbekend'),
    'Speciale wensen: ' + limit(p.specialRequests, 2000),
    'Extra opmerkingen: ' + limit(p.customer.remarks, 1000),
    '',
    'Prijzen: op aanvraag. Werkelijke afmetingen, montage en laadvermogen worden gecontroleerd.',
    'Deze aanvraag is geen bindende offerte.',
  ];
  return lines.join('\n');
}
function safeImage(data) {
  if (data == null) return null;
  if (typeof data !== 'string') return false;
  const prefix = 'data:image/jpeg;base64,';
  if (!data.startsWith(prefix)) return false;
  const base64 = data.slice(prefix.length);
  if (!base64 || base64.length > MAX_IMAGE_BASE64 ||
      !/^[a-zA-Z0-9+/]+={0,2}$/.test(base64)) return false;
  return base64;
}
async function sendEmail(env, data, idempotencyKey) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + env.RESEND_API_KEY,
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    console.error('Email provider returned status', response.status);
    return false;
  }
  return true;
}
async function siteVerify(token, secret, ip) {
  const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  if (!result.ok) return false;
  const data = await result.json();
  return data.success === true && (!data.hostname || ['muwattah.github.io', 'www.rscardetailing.be', 'rscardetailing.be'].includes(data.hostname));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowedOrigin = (env.ALLOWED_ORIGIN ?? '').replace(/\/$/, '');
    const headers = cors(origin, allowedOrigin);
    if (request.method === 'OPTIONS') return new Response(null, { status: origin === allowedOrigin ? 204 : 403, headers });
    if (request.method !== 'POST') return reply({ ok: false, error: 'Niet ondersteund.' }, 405, headers);
    if (!allowedOrigin || origin !== allowedOrigin) return reply({ ok: false, error: 'Onbekende herkomst.' }, 403, headers);
    if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY || !env.QUOTE_ADMIN_EMAIL || !env.QUOTE_FROM_EMAIL)
      return reply({ ok: false, error: 'De e-mailkoppeling is nog niet geactiveerd.' }, 503, headers);
    const size = Number(request.headers.get('Content-Length') ?? 0);
    if (size > MAX_BODY_BYTES) return reply({ ok: false, error: 'De aanvraag is te groot.' }, 413, headers);
    let body;
    try {
      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) return reply({ ok: false, error: 'De aanvraag is te groot.' }, 413, headers);
      body = JSON.parse(raw);
    } catch { return reply({ ok: false, error: 'Ongeldige aanvraag.' }, 400, headers); }
    const p = body?.payload;
    if (!p || p.source !== 'web-configurator' || p.reviewStatus !== 'awaiting-admin-review' ||
        !ID_PATTERN.test(p.configurationId ?? '') || !p.privacyConsent ||
        !emailOk(p.customer?.email) || !limit(p.customer?.name, 130) ||
        !limit(p.customer?.phone, 70) || !limit(p.vehicle?.customerDescription, 180) ||
        !p.systems || !p.installation || !Array.isArray(p.extras) ||
        typeof body.turnstileToken !== 'string' || body.turnstileToken.length > 2048 ||
        !emailOk(env.QUOTE_ADMIN_EMAIL) || !emailOk(env.QUOTE_FROM_EMAIL))
      return reply({ ok: false, error: 'Controleer alle verplichte gegevens.' }, 400, headers);
    const image = safeImage(p.previewImageDataUrl);
    if (image === false) return reply({ ok: false, error: 'De configuratiefoto heeft een ongeldig formaat.' }, 400, headers);
    if (!image) return reply({ ok: false, error: 'De eindfoto ontbreekt. Probeer het opnieuw in een browser met 3D-ondersteuning.' }, 422, headers);

    let verified = false;
    try { verified = await siteVerify(body.turnstileToken, env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP')); }
    catch { return reply({ ok: false, error: 'Beveiligingscontrole tijdelijk niet beschikbaar.' }, 503, headers); }
    if (!verified) return reply({ ok: false, error: 'Beveiligingscontrole verlopen. Vernieuw de controle en probeer opnieuw.' }, 403, headers);

    const text = quoteLines(p);
    const emailHtml = '<div style="font-family:Arial,sans-serif;color:#1a2530;line-height:1.6">' +
      '<h2>RS Car Detailing — offerteaanvraag</h2><p>Referentie: <strong>' +
      htmlEscape(p.configurationId) + '</strong></p><p>De aanvraag is ontvangen en wordt persoonlijk nagekeken. ' +
      'Er is nog geen definitieve offerte opgesteld.</p><pre style="font-family:inherit;white-space:pre-wrap">' +
      htmlEscape(text) + '</pre></div>';
    const jpg = { filename: p.configurationId + '.jpg', content: image };
    const safePayload = { ...p, previewImageDataUrl: null };
    const json = { filename: p.configurationId + '.json', content: btoa(unescape(encodeURIComponent(JSON.stringify(safePayload, null, 2)))) };

    try {
      const adminSent = await sendEmail(env, {
        from: env.QUOTE_FROM_EMAIL,
        to: [env.QUOTE_ADMIN_EMAIL],
        reply_to: p.customer.email,
        subject: 'Nieuwe offerteaanvraag ' + p.configurationId + ' — ' + limit(p.customer.name, 90),
        html: emailHtml, text,
        attachments: [jpg, json],
      }, p.configurationId + '-admin');
      if (!adminSent) return reply({ ok: false, error: 'De aanvraag kon niet per e-mail verzonden worden. Bewaar de aanvraag en probeer het opnieuw.' }, 502, headers);

      const customerSent = await sendEmail(env, {
        from: env.QUOTE_FROM_EMAIL,
        to: [p.customer.email],
        reply_to: env.QUOTE_ADMIN_EMAIL,
        subject: 'Ontvangstbevestiging RS Car Detailing — ' + p.configurationId,
        html: emailHtml,
        text: 'Bedankt voor uw aanvraag. We hebben uw configuratie ontvangen.\n\n' + text +
          '\n\nWe beoordelen uw wensen en nemen contact op. Dit is nog geen definitieve offerte.',
        attachments: [jpg],
      }, p.configurationId + '-customer');
      if (!customerSent) return reply({
        ok: false, error: 'Uw aanvraag is bij ons aangekomen, maar de bevestigingsmail aan u is mislukt. Contacteer ons met referentie ' + p.configurationId + '.',
        adminReceived: true,
      }, 502, headers);
    } catch {
      return reply({ ok: false, error: 'E-mailservice tijdelijk niet bereikbaar. Bewaar uw aanvraag en probeer later opnieuw.' }, 502, headers);
    }
    return reply({ ok: true, configurationId: p.configurationId, adminNotified: true, customerNotified: true }, 200, headers);
  },
};
