import { placedSize, isDoorZone, DOOR_LABELS } from './doorMounts';
import type { PlacedItem, DetailingConfiguration } from '../types';
import { getProduct } from '../data/detailingCatalog';

/** Same occupied envelopes as the van: no imaginary additions or reordered machines. */
export function setupBounds(items: PlacedItem[]) {
  const min: [number, number, number] = [Infinity, 0, Infinity];
  const max: [number, number, number] = [-Infinity, 0, -Infinity];
  for (const item of items) for (let axis = 0; axis < 3; axis++) {
    min[axis] = Math.min(min[axis], item.position[axis] - placedSize(item)[axis] / 2);
    max[axis] = Math.max(max[axis], item.position[axis] + placedSize(item)[axis] / 2);
  }
  if (!items.length) return { min: [-0.5, 0, -0.5], max: [0.5, 1, 0.5], center: [0, 0.5, 0], size: [1, 1, 1] };
  return { min, max, center: min.map((v, i) => (v + max[i]) / 2), size: min.map((v, i) => Math.max(0.1, max[i] - v)) };
}

export function setupParts(config: DetailingConfiguration, items: PlacedItem[]): string[] {
  const parts = items.map(item => (getProduct(item.productId)?.name ?? item.productId) + (isDoorZone(item.zone) ? ' · ' + DOOR_LABELS[item.zone] : ''));
  if (config.floatValve && config.tankId) parts.push('Vlotter op watertank');
  const lining = getProduct(config.liningId);
  if (lining && lining.id !== 'lining_none') parts.push(lining.name);
  return parts;
}
