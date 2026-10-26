import type { DetailingConfiguration } from '../types';

/** One reproducible installation; dimensions and product meshes remain indicative. */
export const demoConfiguration: DetailingConfiguration = {
  vehicleCategory: 'large', vehicleModelId: 'mercedes-sprinter',
  vehicleLength: 'standard', vehicleRoof: 'high', cabType: 'single',
  tankId: 'tank_400', floatValve: true,
  pressureWasherId: 'pressure_electric', pressureReelId: 'pressure_reel_spring_25',
  generatorId: 'generator_3800', powerReelId: 'power_reel_14',
  compressorId: null, airReelId: null, vacuumId: null,
  liningId: 'lining_aluminium', frameComboId: 'frame_standard',
  extraIds: [], bottleHolder: false, bucketHolder: false,
  installationType: 'installed', specialRequests: '', includeBTW: false,
};
