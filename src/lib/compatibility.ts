import type { Product, Vehicle, VehicleVariant } from '../types';
import { products, vehicles, vehicleVariants } from '../data/demoData';

export function isProductCompatible(
  product: Product,
  variant: VehicleVariant | null | undefined,
  vehicle: Vehicle | null | undefined
): { ok: boolean; reason?: string } {
  if (!product.active) return { ok: false, reason: 'Niet beschikbaar' };
  if (!variant || !vehicle) return { ok: true };

  const c = product.compatibility;

  if (c.categories?.length && !c.categories.includes(vehicle.category)) {
    return { ok: false, reason: `Niet geschikt voor ${vehicle.category === 'small' ? 'kleine' : vehicle.category === 'medium' ? 'middelgrote' : 'grote'} bestelwagens` };
  }
  if (c.vehicleIds?.length && !c.vehicleIds.includes(vehicle.id)) {
    return { ok: false, reason: 'Niet compatibel met dit model' };
  }
  if (c.lengthCodes?.length && !c.lengthCodes.includes(variant.length)) {
    return { ok: false, reason: `Alleen voor lengte ${c.lengthCodes.join('/')}` };
  }
  if (c.heightCodes?.length && !c.heightCodes.includes(variant.height)) {
    return { ok: false, reason: `Alleen voor hoogte ${c.heightCodes.join('/')} (jouw wagen: ${variant.height})` };
  }
  if (c.maxLengthMm && variant.loadLengthMm && c.maxLengthMm > variant.loadLengthMm) {
    return { ok: false, reason: 'Product te lang voor deze laadruimte' };
  }
  if (c.maxHeightMm && variant.loadHeightMm && c.maxHeightMm > variant.loadHeightMm) {
    return { ok: false, reason: 'Product te hoog voor deze laadruimte' };
  }

  return { ok: true };
}

export function getCompatibleProducts(
  variantId: string | null,
  categoryId?: string
): Product[] {
  const variant = variantId ? vehicleVariants.find((v) => v.id === variantId) : null;
  const vehicle = variant ? vehicles.find((v) => v.id === variant.vehicleId) : null;

  return products.filter((p) => {
    if (categoryId && p.categoryId !== categoryId) return false;
    return isProductCompatible(p, variant, vehicle).ok;
  });
}

export function getIncompatibilityReason(
  productId: string,
  variantId: string | null
): string | undefined {
  const product = products.find((p) => p.id === productId);
  if (!product) return 'Onbekend product';
  const variant = variantId ? vehicleVariants.find((v) => v.id === variantId) : null;
  const vehicle = variant ? vehicles.find((v) => v.id === variant.vehicleId) : null;
  return isProductCompatible(product, variant, vehicle).reason;
}
