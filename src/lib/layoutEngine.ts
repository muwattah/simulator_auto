import type {
  DetailingConfiguration,
  CargoSpaceMeters,
  LayoutResult,
  PlacedItem,
  PlacementZone,
  DetailingProduct,
} from '../types';
import { getProduct, getVehicleCategory } from '../data/detailingCatalog';

const REEL_ZONES: PlacementZone[] = [
  'rearFrame.upperLeft',
  'rearFrame.upperCenter',
  'rearFrame.upperRight',
  'rearFrame.middleLeft',
  'rearFrame.middleCenter',
  'rearFrame.middleRight',
];

function zonePosition(
  zone: PlacementZone,
  space: CargoSpaceMeters,
  size: [number, number, number],
  slotIndex = 0
): [number, number, number] {
  const { length: L, width: W, height: H } = space;
  const [sw, sh, sd] = size;
  const rearZ = -L / 2 + 0.25 + slotIndex * 0.05;
  const midZ = -L * 0.15;
  const yMid = sh / 2 + 0.02;

  switch (zone) {
    case 'rearFrame.upperLeft':
      return [-W * 0.32, H * 0.72, rearZ];
    case 'rearFrame.upperCenter':
      return [0, H * 0.72, rearZ];
    case 'rearFrame.upperRight':
      return [W * 0.32, H * 0.72, rearZ];
    case 'rearFrame.middleLeft':
      return [-W * 0.32, H * 0.42, rearZ + 0.05];
    case 'rearFrame.middleCenter':
      return [0, H * 0.4, rearZ + 0.08];
    case 'rearFrame.middleRight':
      return [W * 0.32, H * 0.42, rearZ + 0.05];
    case 'rearFrame.lowerLeft':
      return [-W * 0.28, yMid, rearZ + 0.15];
    case 'rearFrame.lowerCenter':
      return [0, yMid, midZ];
    case 'rearFrame.lowerRight':
      return [W * 0.28, yMid, rearZ + 0.15];
    case 'leftWall':
      return [-W / 2 + sw / 2 + 0.04, yMid, midZ];
    case 'rightWall':
      return [W / 2 - sw / 2 - 0.04, yMid, midZ];
    case 'frontWall':
      return [0, H / 2, L / 2 - sd / 2 - 0.05];
    case 'floor':
      return [slotIndex % 2 === 0 ? -W * 0.22 : W * 0.22, sh / 2 + 0.02, -L * 0.05 + Math.floor(slotIndex / 2) * 0.4];
    case 'ceiling':
      return [0, H - sh / 2 - 0.04, midZ];
    case 'leftRearDoor':
      return [-W * 0.55, H * 0.45, -L / 2 - 0.15];
    case 'rightRearDoor':
      return [W * 0.55, H * 0.35, -L / 2 - 0.15];
    default:
      return [0, yMid, midZ];
  }
}

function collectProducts(config: DetailingConfiguration): DetailingProduct[] {
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
  if (config.frameComboId) ids.push(config.frameComboId);
  if (config.bottleHolder) ids.push('bottle_holder');
  if (config.bucketHolder) ids.push('bucket_holder');
  for (const e of config.extraIds) ids.push(e);

  return ids.map((id) => getProduct(id)).filter((p): p is DetailingProduct => !!p && p.active);
}

export function getCargoSpace(
  vehicleCategory: DetailingConfiguration['vehicleCategory'],
  cabType: DetailingConfiguration['cabType']
): CargoSpaceMeters {
  const cat = getVehicleCategory(vehicleCategory);
  if (!cat) {
    return { length: 2.9, width: 1.7, height: 1.4, isDemo: true, vehicleCategory: null, cabType: null };
  }
  const factor = cabType === 'double' ? cat.doubleCabLengthFactor : 1;
  return {
    length: cat.cargo.length * factor,
    width: cat.cargo.width,
    height: cat.cargo.height,
    isDemo: true,
    vehicleCategory,
    cabType,
  };
}

export function computeLayout(config: DetailingConfiguration): LayoutResult {
  const space = getCargoSpace(config.vehicleCategory, config.cabType);
  const products = collectProducts(config);
  const placements: PlacedItem[] = [];
  const warnings: string[] = [];
  const occupied = new Set<PlacementZone>();
  let requiresInstallerReview = false;

  // Frame first (visual structure)
  const frame = products.find((p) => p.category === 'frame');
  if (frame) {
    const size: [number, number, number] = [
      Math.min(frame.dimensions.width, space.width * 0.95),
      Math.min(frame.dimensions.height, space.height * 0.9),
      frame.dimensions.depth,
    ];
    placements.push({
      productId: frame.id,
      zone: 'rearFrame.middleCenter',
      position: [0, size[1] / 2, -space.length / 2 + 0.35],
      size,
    });
  }

  // Tank on floor rear-center
  const tank = products.find((p) => p.category === 'tank');
  if (tank) {
    const size: [number, number, number] = [tank.dimensions.width, tank.dimensions.height, tank.dimensions.depth];
    if (size[2] > space.length * 0.55 || size[0] > space.width * 0.9) {
      warnings.push('Watertank is groot t.o.v. beschikbare laadruimte — controle door installateur vereist.');
      requiresInstallerReview = true;
    }
    placements.push({
      productId: tank.id,
      zone: 'floor',
      position: [0, size[1] / 2 + 0.02, space.length * 0.15],
      size,
    });
  }

  // Reels — place side by side on upper frame slots
  const reels = products.filter((p) =>
    ['pressure_reel', 'air_reel', 'power_reel'].includes(p.category)
  );
  let reelSlot = 0;
  for (const reel of reels) {
    const zone = REEL_ZONES[reelSlot] ?? 'rearFrame.middleLeft';
    const size: [number, number, number] = [reel.dimensions.width, reel.dimensions.height, reel.dimensions.depth];
    placements.push({
      productId: reel.id,
      zone,
      position: zonePosition(zone, space, size, reelSlot),
      size,
      slotIndex: reelSlot,
    });
    occupied.add(zone);
    reelSlot++;
  }
  if (reels.length > REEL_ZONES.length) {
    warnings.push('Meer haspels dan beschikbare frameslots — controle door installateur vereist.');
    requiresInstallerReview = true;
  }

  // Remaining equipment
  const rest = products.filter(
    (p) =>
      !['frame', 'tank', 'pressure_reel', 'air_reel', 'power_reel', 'lining'].includes(p.category)
  );

  let floorSlot = 0;
  for (const prod of rest) {
    const size: [number, number, number] = [
      prod.dimensions.width,
      prod.dimensions.height,
      prod.dimensions.depth,
    ];

    // Volume rough check
    const vol = size[0] * size[1] * size[2];
    const cargoVol = space.length * space.width * space.height;
    if (vol > cargoVol * 0.35 && space.vehicleCategory === 'small') {
      warnings.push(`${prod.name}: mogelijk te groot voor kleine bestelwagen.`);
      requiresInstallerReview = true;
    }

    let zone = prod.placement.preferredZone;
    if (occupied.has(zone) || zone.startsWith('rearFrame.upper')) {
      const alt = prod.placement.allowedZones.find((z) => !occupied.has(z) && z !== 'any');
      zone = alt ?? 'floor';
    }

    if (zone === 'floor') {
      placements.push({
        productId: prod.id,
        zone,
        position: zonePosition('floor', space, size, floorSlot),
        size,
        slotIndex: floorSlot,
      });
      floorSlot++;
    } else {
      placements.push({
        productId: prod.id,
        zone,
        position: zonePosition(zone, space, size, 0),
        size,
      });
      occupied.add(zone);
    }
  }

  // Small van + large tank heuristic
  if (config.vehicleCategory === 'small' && tank && (tank.capacityLiters ?? 0) >= 400) {
    warnings.push(
      'Ruimtecontrole nodig: deze combinatie gebruikt meer ruimte dan momenteel betrouwbaar beschikbaar is in deze voertuigconfiguratie.'
    );
    requiresInstallerReview = true;
  }

  // Air reel without compressor already filtered; double-check
  if (config.airReelId && !config.compressorId) {
    warnings.push('Persluchthaspel vereist een compressor.');
  }

  const fits = !requiresInstallerReview || warnings.length === 0;

  return {
    placements,
    warnings: [...new Set(warnings)],
    fits,
    requiresInstallerReview,
  };
}

export function estimatedWaterWeight(config: DetailingConfiguration): number {
  const tank = getProduct(config.tankId);
  return tank?.estimatedWaterWeightKg ?? tank?.capacityLiters ?? 0;
}
