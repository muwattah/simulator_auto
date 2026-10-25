import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/index.mjs';

function mockDatabase() {
  const rows = new Map();
  return {
    rows,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async first() {
              if (sql.startsWith('SELECT COUNT')) return { n: 0 };
              if (sql.startsWith('SELECT * FROM quote_requests WHERE id')) return rows.get(args[0]) || null;
              throw new Error('Unexpected first SQL: ' + sql);
            },
            async run() {
              if (sql.startsWith('INSERT INTO quote_requests')) {
                const [id, customer_email, ip_hash, payload_json, status, created_at, expires_at] = args;
                rows.set(id, { id, customer_email, ip_hash, payload_json, status, created_at, expires_at, admin_sent_at: null, customer_sent_at: null });
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith('UPDATE quote_requests SET admin_sent_at')) {
                rows.get(args[1]).admin_sent_at = args[0];
                return { meta: { changes: 1 } };
              }
              if (sql.startsWith('UPDATE quote_requests SET customer_sent_at')) {
                rows.get(args[1]).customer_sent_at = args[0];
                return { meta: { changes: 1 } };
              }
              if (sql.includes("SET status = 'sending'")) {
                const row = rows.get(args[2]);
                if (!['pending', 'failed'].includes(row.status)) return { meta: { changes: 0 } };
                row.status = 'sending';
                row.amount_cents = args[0];
                row.quote_message = args[1];
                return { meta: { changes: 1 } };
              }
              if (sql.includes("SET status = 'sent'")) {
                const row = rows.get(args[1]); row.status = 'sent'; row.approved_at = args[0];
                return { meta: { changes: 1 } };
              }
              if (sql.includes("SET status = 'failed'")) {
                const row = rows.get(args[1]); row.status = 'failed';
                return { meta: { changes: 1 } };
              }
              throw new Error('Unexpected run SQL: ' + sql);
            },
          };
        },
      };
    },
  };
}
test('request gives customer a receipt, and only admin approval sends final quote', async () => {
  const originalFetch = globalThis.fetch;
  const mails = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails');
    mails.push({ data: JSON.parse(init.body), idempotency: init.headers['Idempotency-Key'] });
    return new Response(JSON.stringify({ id: 'mail-1' }), { status: 200 });
  };
  try {
    const DB = mockDatabase();
    const env = {
      DB, RESEND_API_KEY: 'test-only', ADMIN_EMAIL: 'admin@example.test',
      FROM_EMAIL: 'offertes@example.test', APPROVAL_SECRET: 'this-is-test-secret-longer-than-32-characters',
      PUBLIC_API_URL: 'https://quotes.example.test', FRONTEND_ORIGIN: 'https://muwattah.github.io',
    };
    const customer = 'klant@example.test';
    const payload = {
      customer: { name: 'Test Klant', email: customer, phone: '0470123456' },
      vehicle: { categoryId: 'medium', categoryName: 'Middelgroot', cabType: 'single' },
      systems: { tankName: 'Watertank 400 L' },
      installation: {}, extras: [{ id: 'set_tools', name: 'Gereedschap' }],
      specialRequests: 'Voorzichtig monteren', layoutWarnings: [], privacyConsent: true,
      previewImageDataUrl: 'data:image/jpeg;base64,/9j/' + 'A'.repeat(100),
    };
    const request = new Request('https://quotes.example.test/api/quotes', {
      method: 'POST', headers: { Origin: 'https://muwattah.github.io', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const response = await worker.fetch(request, env);
    const result = await response.json();
    assert.equal(response.status, 201);
    assert.equal(result.ok, true);
    assert.equal(result.customerReceiptSent, true);
    assert.equal(result.adminNotificationSent, true);
    assert.equal(mails.length, 2);
    assert.equal(mails[0].data.to[0], env.ADMIN_EMAIL);
    assert.match(mails[0].data.html, /cid:rs-configuration-preview/);
    assert.equal(mails[0].data.attachments[0].content_id, 'rs-configuration-preview');
    assert.equal(mails[0].data.attachments[0].content_type, 'image/jpeg');
    assert.equal(mails[1].data.to[0], customer);
    assert.match(mails[1].data.html, /cid:rs-configuration-preview/);
    assert.equal(mails[1].data.attachments[0].content, '/9j/' + 'A'.repeat(100));
    assert.match(mails[1].data.text, /nog GEEN definitieve offerte/);
    assert.match(mails[1].data.text, /Watertank 400 L/);

    const reviewLink = mails[0].data.text.match(/https:\/\/quotes\.example\.test\/review\?id=[^\s]+/)?.[0];
    assert.ok(reviewLink);
    const review = await worker.fetch(new Request(reviewLink), env);
    assert.equal(review.status, 200);
    assert.match(await review.text(), /Goedkeuren en offerte verzenden/);
    assert.equal(mails.length, 2, 'opening review does not send quote');

    const u = new URL(reviewLink);
    const body = new URLSearchParams({
      id: u.searchParams.get('id'), token: u.searchParams.get('token'),
      amount: '1500.00', message: 'Levertijd na overleg',
    });
    const approve = () => worker.fetch(new Request('https://quotes.example.test/review', {
      method: 'POST', body, headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }), env);
    const approved = await approve();
    assert.equal(approved.status, 200);
    assert.equal(mails.length, 3);
    assert.equal(mails[2].data.to[0], customer);
    assert.match(mails[2].data.html, /Jouw definitieve offerte/);
    assert.match(mails[2].data.html, /cid:rs-configuration-preview/);
    assert.match(mails[2].data.text, /€\s?1\.500,00/);
    assert.match(mails[2].data.text, /Levertijd na overleg/);
    assert.equal(DB.rows.get(result.configurationId).status, 'sent');
    await approve();
    assert.equal(mails.length, 3, 'second approval must not resend quote');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
