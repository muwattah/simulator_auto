import type { DetailingConfiguration } from '../types';
import { getProduct } from '../data/detailingCatalog';
import { computeLayout } from './layoutEngine';

/**
 * Only show additions that can be placed in the generic medium-van demo.
 * This is a preliminary geometric screen, NOT a claim that the customer's
 * actual vehicle can safely carry or mount the equipment.
 */
export function canChooseDemoOption(
  current: DetailingConfiguration,
  patch: Partial<DetailingConfiguration>,
  productId?: string | null,
  alreadySelected = false,
): boolean {
  if (alreadySelected || !productId) return true;

  const product = getProduct(productId);
  if (product?.compatibility.vehicleCategories &&
      !product.compatibility.vehicleCategories.includes('medium')) return false;

  // With unknown actual payload, don't suggest the very largest water tanks
  // as a simple fitment choice for the medium-size example vehicle.
  if (product?.category === 'tank' && (product.capacityLiters ?? 0) > 460) return false;

  const proposal: DetailingConfiguration = {
    ...current,
    ...patch,
    vehicleCategory: 'medium',
    vehicleModelId: null,
    cabType: 'single',
    vehicleLength: 'standard',
    vehicleRoof: 'standard',
    availablePayloadKg: null,
  };
  return computeLayout(proposal).fits;
}
