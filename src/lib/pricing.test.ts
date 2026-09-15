/**
 * Lightweight pricing checks (run with: npx tsx src/lib/pricing.test.ts
 * or integrate with vitest later). No external test runner required for CI yet.
 */
import { calculatePricing, toPriceSnapshot, BTW_RATE, formatPrice } from './pricing';
import type { Configuration } from '../types';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const emptyConfig: Configuration = {
  vehicleVariantId: null,
  items: [],
  packageId: null,
  profession: null,
  budgetBand: null,
  includeBTW: false,
};

function run() {
  // Empty config
  const empty = calculatePricing(emptyConfig);
  assert(empty.productSubtotal === 0, 'empty productSubtotal');
  assert(empty.montageTotal === 0, 'empty montage');
  assert(empty.subtotalExcl === 0, 'empty subtotal');
  assert(empty.btwAmount === 0, 'empty btw');
  assert(empty.totalIncl === 0, 'empty total');

  // Single product with montage
  const single: Configuration = {
    ...emptyConfig,
    items: [{ productId: 'vloer-multiplex-15', quantity: 1, includeMontage: true }],
  };
  const p1 = calculatePricing(single);
  assert(p1.items.length >= 1, 'has items');
  assert(p1.productSubtotal > 0, 'product > 0');
  assert(p1.montageTotal >= 0, 'montage >= 0');
  assert(Math.abs(p1.btwAmount - p1.subtotalExcl * BTW_RATE) < 0.02, 'btw 21%');
  assert(Math.abs(p1.totalIncl - (p1.subtotalExcl + p1.btwAmount)) < 0.02, 'total = excl + btw');

  // Quantity
  const qty: Configuration = {
    ...emptyConfig,
    items: [{ productId: 'vloer-multiplex-15', quantity: 2, includeMontage: true }],
  };
  const p2 = calculatePricing(qty);
  assert(p2.items.some((i) => i.qty === 2), 'qty preserved');

  // Snapshot
  const snap = toPriceSnapshot(p1);
  assert(snap.subtotalExcl === p1.subtotalExcl, 'snapshot subtotal');
  assert(snap.totalIncl === p1.totalIncl, 'snapshot total');
  assert(snap.btwRate === BTW_RATE, 'snapshot rate');

  // Format
  assert(formatPrice(10).includes('10'), 'formatPrice works');

  console.log('All pricing tests passed.');
}

run();
