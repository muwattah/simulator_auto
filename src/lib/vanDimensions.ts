/**
 * DEMO vehicle load dimensions → meters for 3D scene.
 * Replace loadLengthMm/loadWidthMm/loadHeightMm on VehicleVariant with real OEM data later.
 */
import type { VehicleVariant, CargoSpaceMeters } from '../types';
import { vehicleVariants } from '../data/demoData';

const FALLBACK: CargoSpaceMeters = {
  length: 3.0,
  width: 1.7,
  height: 1.4,
  isDemo: true,
};

export function getCargoSpace(variantId: string | null | undefined): CargoSpaceMeters {
  if (!variantId) return FALLBACK;
  const v = vehicleVariants.find((x) => x.id === variantId);
  if (!v) return FALLBACK;
  return {
    length: (v.loadLengthMm ?? 3000) / 1000,
    width: (v.loadWidthMm ?? 1700) / 1000,
    height: (v.loadHeightMm ?? 1400) / 1000,
    isDemo: true,
  };
}

export function mapPositionToZone(
  positions: Array<'left' | 'right' | 'floor' | 'roof' | 'front' | 'rear' | 'any'>
): 'leftWall' | 'rightWall' | 'frontWall' | 'floor' | 'ceiling' | 'roof' | 'any' {
  if (positions.includes('floor')) return 'floor';
  if (positions.includes('left')) return 'leftWall';
  if (positions.includes('right')) return 'rightWall';
  if (positions.includes('front')) return 'frontWall';
  if (positions.includes('roof')) return 'roof';
  if (positions.includes('rear')) return 'frontWall';
  return 'any';
}

/** Infer visual3D from product id/category when not set in data */
export function inferVisual3D(productId: string, categoryId: string, positions: string[]) {
  const zone = mapPositionToZone(positions as any);
  if (categoryId === 'vloeren' || productId.includes('vloer')) {
    return { type: 'floor' as const, zone: 'floor' as const, isDemoAsset: true };
  }
  if (productId.includes('kast-links') || (productId.includes('kast') && positions.includes('left'))) {
    return { type: 'cabinet' as const, width: 0.45, height: 1.1, depth: 1.2, zone: 'leftWall' as const, isDemoAsset: true };
  }
  if (productId.includes('kast-rechts') || (productId.includes('kast') && positions.includes('right'))) {
    return { type: 'cabinet' as const, width: 0.45, height: 1.1, depth: 1.2, zone: 'rightWall' as const, isDemoAsset: true };
  }
  if (productId.includes('kast') || categoryId === 'kasten') {
    return { type: 'cabinet' as const, width: 0.5, height: 1.2, depth: 1.0, zone, isDemoAsset: true };
  }
  if (categoryId === 'ladenblokken' || productId.includes('ladenblok')) {
    return { type: 'drawerUnit' as const, width: 0.55, height: 0.7, depth: 0.55, zone: 'any' as const, isDemoAsset: true };
  }
  if (categoryId === 'werkbanken' || productId.includes('werkbank')) {
    return { type: 'workbench' as const, width: 0.6, height: 0.85, depth: 1.2, zone: 'any' as const, isDemoAsset: true };
  }
  if (categoryId === 'sjorrails' || productId.includes('sjorrail')) {
    return { type: 'rail' as const, width: 0.05, height: 0.04, depth: 2.0, zone: 'leftWall' as const, isDemoAsset: true };
  }
  if (categoryId === 'verlichting' || productId.includes('led')) {
    return { type: 'led' as const, width: 0.08, height: 0.04, depth: 1.5, zone: 'ceiling' as const, isDemoAsset: true };
  }
  if (categoryId === 'wandbekleding' || productId.includes('wand')) {
    return { type: 'wallPanel' as const, zone: 'leftWall' as const, isDemoAsset: true };
  }
  if (categoryId === 'scheidingswanden' || productId.includes('scheidingswand')) {
    return { type: 'partition' as const, zone: 'frontWall' as const, isDemoAsset: true };
  }
  if (categoryId === 'dakdragers' || productId.includes('dakdrager')) {
    return { type: 'roofRack' as const, width: 1.4, height: 0.15, depth: 1.8, zone: 'roof' as const, isDemoAsset: true };
  }
  if (categoryId === 'ladderhouders' || productId.includes('ladder')) {
    return { type: 'ladderHolder' as const, width: 0.3, height: 0.2, depth: 1.5, zone: 'roof' as const, isDemoAsset: true };
  }
  if (categoryId === 'montage') {
    return { type: 'none' as const, zone: 'any' as const, isDemoAsset: true };
  }
  return { type: 'accessory' as const, width: 0.25, height: 0.25, depth: 0.25, zone: 'any' as const, isDemoAsset: true };
}
