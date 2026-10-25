import { calculatePricing, formatPriceOrPending } from './pricing';
import { computeLayout, estimatedWaterWeight, getCargoSpace } from './layoutEngine';
import type { DetailingConfiguration } from '../types';

const empty: DetailingConfiguration = {
  vehicleCategory: 'medium',
  cabType: 'single',
  tankId: null,
  floatValve: null,
  pressureWasherId: null,
  pressureReelId: null,
  compressorId: null,
  airReelId: null,
  generatorId: null,
  powerReelId: null,
  vacuumId: null,
  liningId: 'lining_none',
  frameComboId: null,
  extraIds: [],
  bottleHolder: false,
  bucketHolder: false,
  installationType: null,
  specialRequests: '',
  includeBTW: false,
};

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// pending prices
{
  const cfg = { ...empty, tankId: 'tank_250' };
  const p = calculatePricing(cfg);
  assert(p.hasPending, 'tank should be pending');
  assert(p.pendingCount >= 1, 'pending count');
  assert(p.knownSubtotal === 0, 'known subtotal 0');
}

// water weight
{
  const cfg = { ...empty, tankId: 'tank_400' };
  assert(estimatedWaterWeight(cfg) === 400, 'water weight 400');
}

// float / air reel dependency handled in layout (air reel ignored without compressor)
{
  const cfg = { ...empty, airReelId: 'air_reel_18', compressorId: null };
  const layout = computeLayout(cfg);
  assert(!layout.placements.some((p) => p.productId === 'air_reel_18'), 'air reel without compressor');
}

// scenario A layout has placements
{
  const cfg: DetailingConfiguration = {
    ...empty,
    vehicleCategory: 'medium',
    cabType: 'single',
    tankId: 'tank_250',
    floatValve: true,
    pressureWasherId: 'pressure_electric',
    pressureReelId: 'pressure_reel_spring_25',
    compressorId: 'compressor_3_3_8bar',
    airReelId: 'air_reel_18',
    generatorId: 'generator_3800',
    powerReelId: 'power_reel_14',
    vacuumId: 'vacuum_reel_18',
    liningId: 'lining_aluminium',
    frameComboId: 'frame_full',
    bottleHolder: true,
    bucketHolder: true,
    installationType: 'installed',
  };
  const layout = computeLayout(cfg);
  assert(layout.placements.length >= 8, 'scenario A placements');
  assert(layout.placements.some((p) => p.productId === 'tank_250'), 'tank placed');
  assert(layout.placements.some((p) => p.productId.startsWith('pressure_reel')), 'reel placed');
}

// small van large tank warning
{
  const cfg = { ...empty, vehicleCategory: 'small' as const, tankId: 'tank_800' };
  const layout = computeLayout(cfg);
  assert(layout.requiresInstallerReview || layout.warnings.length > 0, 'small+large tank warning');
}

// Vehicle size controls change the provisional visual cargo dimensions
{
  const base = getCargoSpace('medium', 'single', 'standard', 'standard');
  const long = getCargoSpace('medium', 'single', 'long', 'standard');
  const high = getCargoSpace('medium', 'single', 'standard', 'high');
  assert(long.length > base.length, 'long wheelbase should increase cargo length');
  assert(high.height > base.height, 'high roof should increase cargo height');
  assert(high.isDemo, 'vehicle dimensions must remain explicitly indicative');

  const config = {
    ...empty,
    vehicleModelId: 'ford-transit-custom',
    vehicleLength: 'long' as const,
    vehicleRoof: 'high' as const,
  };
  const layout = computeLayout(config);
  assert(layout.fits && Array.isArray(layout.placements), 'model selection keeps layout available');
}

// format pending
assert(formatPriceOrPending(null) === 'Prijs op aanvraag', 'format pending');

console.log('All Phase 4 tests passed');
