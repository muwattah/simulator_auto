import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeHtml, summaryFromPayload, euros } from '../src/index.mjs';

test('HTML escape prevents markup from quote fields', () => {
  assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('configuration summary contains customer, selected equipment and remarks', () => {
  const text = summaryFromPayload({
    configurationId: 'RS-2026-ABCDEF123456', customer: { name: 'Voorbeeld', email: 'x@example.org', phone: '123', remarks: 'Na 17u' },
    vehicle: { categoryId: 'medium', categoryName: 'Middelgroot', cabType: 'single' },
    systems: { tankName: 'Watertank 400 L', pressureWasherName: 'Elektrisch' },
    installation: { bottleHolder: true, bucketHolder: false }, extras: [{ name: 'Stomer' }],
    specialRequests: 'Extra rek', estimatedWaterWeightKg: 400, layoutWarnings: ['Review nodig'],
  });
  for (const expected of ['RS-2026-ABCDEF123456','x@example.org','Watertank 400 L','Stomer','Na 17u','Review nodig','Extra rek']) {
    assert.ok(text.includes(expected), expected);
  }
});
test('EURO currency formatting is stable', () => {
  assert.ok(euros(12345).includes('123,45'));
});
