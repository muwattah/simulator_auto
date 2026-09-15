import type { Configuration, Product, PricingResult, QuotePriceSnapshot } from '../types';
import { products, packages } from '../data/demoData';

export const BTW_RATE = 0.21;

export function calculatePricing(config: Configuration): PricingResult {
  const items: PricingResult['items'] = [];
  let productSubtotal = 0;
  let montageTotal = 0;
  let packageDiscount = 0;
  const discount = 0;
  const surcharge = 0;

  const packageProductIds = new Set<string>();
  if (config.packageId) {
    const pkg = packages.find((p) => p.id === config.packageId);
    if (pkg) {
      pkg.items.forEach((i) => packageProductIds.add(i.productId));
      items.push({
        productId: pkg.id,
        name: `Pakket: ${pkg.name}`,
        sku: pkg.id.toUpperCase(),
        unitPrice: pkg.price,
        montage: 0,
        qty: 1,
        lineTotal: pkg.price,
        includeMontage: false,
      });
      productSubtotal += pkg.price;
    }
  }

  for (const item of config.items) {
    if (packageProductIds.has(item.productId)) continue;
    const prod = products.find((p) => p.id === item.productId);
    if (!prod || !prod.active) continue;

    const includeMontage = item.includeMontage !== false && prod.montagePrice > 0;
    const lineProduct = prod.price * item.quantity;
    const lineMontage = includeMontage ? prod.montagePrice * item.quantity : 0;

    items.push({
      productId: prod.id,
      name: prod.name,
      sku: prod.sku,
      unitPrice: prod.price,
      montage: includeMontage ? prod.montagePrice : 0,
      qty: item.quantity,
      lineTotal: lineProduct + lineMontage,
      includeMontage,
    });
    productSubtotal += lineProduct;
    montageTotal += lineMontage;
  }

  const hasLeft = config.items.some((i) => i.productId === 'kast-links-basis');
  const hasRight = config.items.some((i) => i.productId === 'kast-rechts-basis');
  if (hasLeft && hasRight && !config.packageId) {
    const bundleDiscount = 40;
    packageDiscount += bundleDiscount;
    montageTotal = Math.max(0, montageTotal - bundleDiscount);
  }

  const subtotalExcl = Math.max(0, productSubtotal + montageTotal - packageDiscount - discount + surcharge);
  const btwAmount = subtotalExcl * BTW_RATE;

  return {
    items,
    productSubtotal,
    montageTotal,
    packageDiscount,
    discount,
    surcharge,
    subtotalExcl,
    btwAmount,
    totalIncl: subtotalExcl + btwAmount,
    totalExcl: subtotalExcl,
    btwRate: BTW_RATE,
  };
}

export function toPriceSnapshot(pricing: PricingResult): QuotePriceSnapshot {
  return {
    items: pricing.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      sku: i.sku,
      unitPrice: i.unitPrice,
      montage: i.montage,
      qty: i.qty,
      lineTotal: i.lineTotal,
    })),
    productSubtotal: pricing.productSubtotal,
    montageTotal: pricing.montageTotal,
    packageDiscount: pricing.packageDiscount,
    subtotalExcl: pricing.subtotalExcl,
    btwAmount: pricing.btwAmount,
    totalIncl: pricing.totalIncl,
    totalExcl: pricing.totalExcl,
    btwRate: pricing.btwRate,
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

export function priceIncl(excl: number, btw = BTW_RATE): number {
  return excl * (1 + btw);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
