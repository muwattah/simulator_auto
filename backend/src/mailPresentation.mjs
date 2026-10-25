const IMAGE_CID = 'rs-configuration-preview';

export function escapeMailHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  )[c]);
}

/**
 * Resend REST API supports content_id + cid:... in HTML.
 * The data is supplied by the user and must be validated before storing/sending.
 */
export function configurationAttachment(imageDataUrl, reference) {
  const match = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(imageDataUrl || '');
  if (!match) throw new Error('No valid JPEG screenshot supplied');
  return {
    filename: 'RS-configuratie-' + String(reference).replace(/[^A-Za-z0-9-]/g, '') + '.jpg',
    content: match[1],
    content_type: 'image/jpeg',
    content_id: IMAGE_CID,
  };
}

export function renderVisualEmail({
  title, intro, summary, callToActionUrl, callToActionLabel, pricingDetails, note,
}) {
  const e = escapeMailHtml;
  const action = callToActionUrl
    ? `<p style="margin:26px 0"><a href="${e(callToActionUrl)}" style="background:#0284c7;color:#fff;padding:14px 22px;text-decoration:none;border-radius:7px;font-weight:700">${e(callToActionLabel || 'Openen')}</a></p>`
    : '';
  const details = pricingDetails
    ? `<div style="background:#eaf7fd;padding:20px;border-radius:9px;margin:22px 0;color:#0f2940">${e(pricingDetails).replace(/\n/g, '<br>')}</div>`
    : '';
  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:28px 12px;background:#f3f6f9;color:#17212e;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0">
  <div style="background:#111a25;padding:27px 32px;color:#fff">
    <div style="color:#68ccff;font-size:13px;letter-spacing:2px;font-weight:700">RS CAR DETAILING</div>
    <h1 style="font-size:26px;line-height:1.2;margin:14px 0 0">${e(title)}</h1>
  </div>
  <div style="padding:28px 32px">
    <p style="line-height:1.65;font-size:16px;white-space:pre-line">${e(intro)}</p>
    <div style="margin:23px 0;background:#17202a;border-radius:9px;padding:8px">
      <img src="cid:${IMAGE_CID}" width="620" alt="Afbeelding van de gekozen mobiele installatie" style="display:block;width:100%;max-width:100%;height:auto;border-radius:6px">
    </div>
    <p style="color:#64748b;font-size:12px">Indicatieve 3D-visualisatie. Afmetingen, plaatsing en technische haalbaarheid worden gecontroleerd.</p>
    ${details}
    ${action}
    <h2 style="font-size:18px;margin-top:30px">Jouw volledige configuratie</h2>
    <pre style="white-space:pre-wrap;word-break:break-word;font:13px/1.6 Arial,Helvetica,sans-serif;background:#f3f6fa;padding:20px;border-radius:8px;color:#273544">${e(summary)}</pre>
    <p style="font-size:13px;color:#53657a;line-height:1.6">${e(note || '')}</p>
  </div>
  <div style="background:#edf2f6;color:#64748b;padding:18px 32px;font-size:12px">
    RS Car Detailing · Dit bericht betreft jouw configuratie of offerteaanvraag.
  </div>
</div>
</body></html>`;
}
