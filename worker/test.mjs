import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from './src/index.js';

const origin = 'https://muwattah.github.io';
const env = {
  ALLOWED_ORIGIN: origin,
  RESEND_API_KEY: 'fake-test-key',
  TURNSTILE_SECRET_KEY: 'fake-test-secret',
  QUOTE_ADMIN_EMAIL: 'owner@example.invalid',
  QUOTE_FROM_EMAIL: 'offertes@example.invalid',
};
const payload = {
  configurationId: 'RS-2026-ABCDEFGH',
  createdAt: '2026-10-27T10:00:00.000Z',
  source: 'web-configurator',
  reviewStatus: 'awaiting-admin-review',
  privacyConsent: true,
  previewImageDataUrl: 'data:image/jpeg;base64,/9j/AA==',
  customer: { name: 'Testklant', email: 'customer@example.invalid', phone: '0492123456' },
  vehicle: { customerDescription: 'Transit Custom L2' },
  systems: { tankName: 'Watertank 210 liter', pressureReelName: 'HD haspel' },
  installation: { frameComboName: 'Metalen frame', doorMounts: { spray_rack: 'leftRearDoor' } },
  extras: [{ id: 'item', name: 'Borstelrek' }],
  specialRequests: 'Op maat',
  pricing: { status: 'pending' },
  estimatedWaterWeightKg: 210,
};
function post(value = payload, token = 'test-token', sendingOrigin = origin) {
  return new Request('https://quote.example.invalid/', {
    method: 'POST',
    headers: { Origin: sendingOrigin, 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: value, turnstileToken: token }),
  });
}
function mockNetwork(overrides = {}) {
  const original = globalThis.fetch;
  const sent = [];
  globalThis.fetch = async (url, options) => {
    const target = String(url);
    if (target.includes('siteverify')) return Response.json({ success: overrides.challengeValid !== false, hostname: 'muwattah.github.io' });
    if (target.includes('api.resend.com')) {
      const msg = JSON.parse(options.body);
      sent.push({ msg, headers: options.headers });
      if (overrides.failCustomer && msg.to[0] === 'customer@example.invalid')
        return Response.json({ error: 'Delivery provider rejected' }, { status: 422 });
      return Response.json({ id: 'mock-mail-id' });
    }
    throw new Error('Unexpected endpoint ' + target);
  };
  return { sent, restore: () => { globalThis.fetch = original; } };
}
test('sends owner complete quote and customer confirmation with same JPG', async () => {
  const m = mockNetwork();
  try {
    const result = await worker.fetch(post(), env);
    const data = await result.json();
    assert.equal(result.status, 200);
    assert.equal(data.ok, true);
    assert.equal(m.sent.length, 2);
    const [admin, customer] = m.sent.map(x => x.msg);
    assert.equal(admin.to[0], env.QUOTE_ADMIN_EMAIL);
    assert.equal(customer.to[0], payload.customer.email);
    assert.equal(admin.attachments[0].content, '/9j/AA==');
    assert.equal(customer.attachments[0].content, admin.attachments[0].content);
    assert.equal(admin.attachments[1].filename, payload.configurationId + '.json');
    assert.equal(customer.attachments.length, 1);
    assert.match(admin.text, /Borstelrek/);
    assert.match(admin.text, /Transit Custom L2/);
    assert.match(customer.text, /geen definitieve offerte/i);
  } finally { m.restore(); }
});
test('rejects traffic from an unapproved origin', async () => {
  const m = mockNetwork();
  try {
    const response = await worker.fetch(post(payload, 'test-token', 'https://attacker.example'), env);
    assert.equal(response.status, 403);
    assert.equal(m.sent.length, 0);
  } finally { m.restore(); }
});
test('rejects missing photo, missing consent and invalid Turnstile', async () => {
  const m = mockNetwork({ challengeValid: false });
  try {
    assert.equal((await worker.fetch(post({ ...payload, previewImageDataUrl: null }), env)).status, 422);
    assert.equal((await worker.fetch(post({ ...payload, privacyConsent: false }), env)).status, 400);
    assert.equal((await worker.fetch(post(payload), env)).status, 403);
    assert.equal(m.sent.length, 0);
  } finally { m.restore(); }
});
test('reports partial success rather than claiming both mails were sent', async () => {
  const m = mockNetwork({ failCustomer: true });
  try {
    const response = await worker.fetch(post(), env);
    const data = await response.json();
    assert.equal(response.status, 502);
    assert.equal(data.ok, false);
    assert.equal(data.adminReceived, true);
    assert.equal(m.sent.length, 2);
  } finally { m.restore(); }
});
