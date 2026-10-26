import assert from 'node:assert/strict';
import { demoConfiguration } from '../data/demoConfiguration';
import { getProduct } from '../data/detailingCatalog';
import { computeLayout, estimatedWaterWeight, getCargoSpace } from './layoutEngine';
import { buildQuotePayload, snapshotFromPayload, formatQuoteSummary } from '../services/quoteService';
import { calculatePricing } from './pricing';
import { captureConfiguration, configurationKey, registerCapture } from '../services/configurationCapture';

const demo = { ...demoConfiguration, extraIds: [] };
const layout = computeLayout(demo);
assert.equal(layout.placements.length, 6, 'demo has six physical items, including two reels');
assert(layout.fits, layout.warnings.join('\n'));
assert(!layout.warnings.some(w => /overlapt|buiten de beschikbare/.test(w)), 'demo equipment must not overlap');
assert.equal(estimatedWaterWeight(demo), 400);
assert(layout.requiresInstallerReview, 'unknown dry weights prevent certified fitment');
assert(layout.warnings.some(w => w.includes('Gewichtscontrole onvolledig')));

const overloaded = computeLayout({ ...demo, availablePayloadKg: 350 });
assert(!overloaded.fits, 'water alone exceeds the remaining payload');
const invalidReel = computeLayout({ ...demo, airReelId: 'air_reel_18', compressorId: null });
assert(!invalidReel.fits, 'an air reel without a compressor is incompatible');
assert(!invalidReel.placements.some(i => i.productId === 'air_reel_18'));
const small = computeLayout({ ...demo, vehicleCategory: 'small', vehicleModelId: 'vw-caddy' });
const frame = small.placements.find(p => p.productId === demo.frameComboId)!;
assert.equal(frame.size[0], getProduct(demo.frameComboId)!.dimensions.width, 'frame is never shrunk');
assert(!computeLayout({ ...demo, vehicleCategory: 'small', tankId: 'tank_1000' }).fits);

const sourceEnvelope = getCargoSpace('large', 'single', 'standard', 'high', 'mercedes-sprinter');
assert.equal(sourceEnvelope.length, 3.375);
assert.equal(sourceEnvelope.width, 1.787);
assert.equal(sourceEnvelope.height, 2.009);
assert(sourceEnvelope.isDemo, 'manufacturer dimensions do not turn an AI mesh into CAD');

registerCapture(configurationKey(demo), () => 'data:image/jpeg;base64,TEST');
assert(captureConfiguration(demo));
assert.equal(captureConfiguration({ ...demo, tankId: null }), null, 'never attach an old selection image');
registerCapture(configurationKey(demo), null);
assert(captureConfiguration(demo), 'mobile keeps a matching image after leaving the 3D tab');

const payload = buildQuotePayload({
  configurationId: 'RS-2026-TEST1234', createdAt: '2026-10-26T12:00:00Z',
  customer: { name: 'Test customer', email: 'demo@example.invalid', phone: '000' },
  configuration: demo, pricing: calculatePricing(demo), estimatedWaterWeightKg: 400,
  layoutWarnings: layout.warnings, privacyConsent: true,
  previewImageDataUrl: captureConfiguration(demo),
});
assert.equal(payload.reviewStatus, 'awaiting-admin-review');
assert.equal(payload.vehicle.modelId, demo.vehicleModelId);
const snapshot = snapshotFromPayload(payload);
assert.equal(snapshot.configurationId, payload.configurationId);
assert.equal(snapshot.vehicleModelId, demo.vehicleModelId);
assert.equal(snapshot.vehicleRoof, demo.vehicleRoof);
assert(formatQuoteSummary(payload).includes('geen definitieve offerte'));
console.log('Configurator regression checks passed');

