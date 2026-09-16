import type { DetailingConfiguration, PricingResult, PricingLine } from '../types';
import { getProduct } from '../data/detailingCatalog';

export const BTW_RATE = 0.21;

function collectIds(config: DetailingConfiguration): string[] {
  const ids: string[] = [];
  if (config.tankId) ids.push(config.tankId);
  if (config.pressureWasherId === 'pressure_both') {
    ids.push('pressure_electric', 'pressure_petrol');
  } else if (config.pressureWasherId) {
    ids.push(config.pressureWasherId);
  }
  if (config.pressureReelId) ids.push(config.pressureReelId);
  if (config.compressorId) ids.push(config.compressorId);
  if (config.airReelId && config.compressorId) ids.push(config.airReelId);
  if (config.generatorId) ids.push(config.generatorId);
  if (config.powerReelId) ids.push(config.powerReelId);
  if (config.vacuumId) ids.push(config.vacuumId);
  if (config.liningId && config.liningId !== 'lining_none') ids.push(config.liningId);
  if (config.frameComboId) ids.push(config.frameComboId);
  if (config.bottleHolder) ids.push('bottle_holder');
  if (config.bucketHolder) ids.push('bucket_holder');
  for (const e of config.extraIds) ids.push(e);
  return ids;
}

export function calculatePricing(config: DetailingConfiguration): PricingResult {
  const items: PricingLine[] = [];
  let knownSubtotal = 0;
  const pendingNames: string[] = [];

  for (const id of collectIds(config)) {
    const prod = getProduct(id);
    if (!prod) continue;
    const pending = prod.priceStatus === 'pending' || prod.price == null;
    if (pending) {
      pendingNames.push(prod.name);
      items.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        unitPrice: null,
        priceStatus: 'pending',
        qty: 1,
        lineTotal: null,
      });
    } else {
      const price = prod.price as number;
      knownSubtotal += price;
      items.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        unitPrice: price,
        priceStatus: 'known',
        qty: 1,
        lineTotal: price,
      });
    }
  }

  const knownBtw = knownSubtotal * BTW_RATE;
  return {
    items,
    knownSubtotal,
    pendingCount: pendingNames.length,
    pendingNames,
    btwRate: BTW_RATE,
    knownBtw,
    knownTotalIncl: knownSubtotal + knownBtw,
    hasPending: pendingNames.length > 0,
  };
}

export function formatPrice(amount: number, includeCurrency = true): string {
  return new Intl.NumberFormat('nl-NL', {
    style: includeCurrency ? 'currency' : 'decimal',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceOrPending(amount: number | null | undefined): string {
  if (amount == null) return 'Prijs op aanvraag';
  return formatPrice(amount);
}
