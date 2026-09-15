import type { Configuration, Product, Package, PricingResult } from '../types';
import { products, packages } from '../data/demoData';

const BTW_RATE = 0.21;

export function calculatePricing(config: Configuration): PricingResult {
  const items: PricingResult['items'] = [];
  let productSubtotal = 0;
  let montageTotal = 0;
  let packageDiscount = 0;

  // If package selected, start from package items
  let effectiveItems = [...config.items];
  let packagePrice = 0;

  if (config.packageId) {
    const pkg = packages.find(p => p.id === config.packageId);
    if (pkg) {
      packagePrice = pkg.price;
      // Package items are included; additional items from config.items that are not in package are extra
      const packageProductIds = new Set(pkg.items.map(i => i.productId));
      // We still calculate individual for display, but apply package pricing logic
      // For simplicity in MVP: package has fixed price covering its items, extra items added on top
      for (const pi of pkg.items) {
        const prod = products.find(p => p.id === pi.productId);
        if (prod) {
          // Don't add individual price for package items; they are covered by packagePrice
        }
      }
      // Extra items (not in package)
      effectiveItems = config.items.filter(i => !packageProductIds.has(i.productId));
    }
  }

  // Calculate extra / standalone items
  for (const item of effectiveItems) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod || !prod.active) continue;
    const lineProduct = prod.price * item.quantity;
    const lineMontage = prod.montagePrice * item.quantity;
    items.push({
      productId: prod.id,
      name: prod.name,
      unitPrice: prod.price,
      montage: prod.montagePrice,
      qty: item.quantity,
      lineTotal: lineProduct + lineMontage,
    });
    productSubtotal += lineProduct;
    montageTotal += lineMontage;
  }

  // If package, add package as a line and its internal montage is already in package price or separate?
  // For MVP: package price is total for products + montage of package items
  if (config.packageId) {
    const pkg = packages.find(p => p.id === config.packageId);
    if (pkg) {
      items.unshift({
        productId: pkg.id,
        name: `Pakket: ${pkg.name}`,
        unitPrice: pkg.price,
        montage: 0,
        qty: 1,
        lineTotal: pkg.price,
      });
      productSubtotal += pkg.price; // treat package price as product subtotal
    }
  }

  const subtotalExcl = productSubtotal + montageTotal - packageDiscount;
  const btwAmount = subtotalExcl * BTW_RATE;
  const totalIncl = subtotalExcl + btwAmount;
  const totalExcl = subtotalExcl;

  return {
    items,
    productSubtotal,
    montageTotal,
    packageDiscount,
    subtotalExcl,
    btwAmount,
    totalIncl,
    totalExcl,
  };
}

export function formatPrice(amount: number, includeCurrency = true): string {
  const formatted = new Intl.NumberFormat('nl-NL', {
    style: includeCurrency ? 'currency' : 'decimal',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return formatted;
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getCompatibleProducts(variantId: string | null, categoryId?: string): Product[] {
  return products.filter(p => {
    if (!p.active) return false;
    if (categoryId && p.categoryId !== categoryId) return false;
    if (p.compatibleVariantIds.length === 0) return true;
    if (!variantId) return true;
    return p.compatibleVariantIds.includes(variantId);
  });
}
