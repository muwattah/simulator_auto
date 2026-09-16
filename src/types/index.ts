/** Mobile Detailing / Carwash Configurator — types */

export type VehicleCategory = 'small' | 'medium' | 'large' | 'trailer';
export type CabType = 'single' | 'double';
export type PriceStatus = 'known' | 'pending';
export type InstallationType = 'installed' | 'pickup' | null;

export type ConfigStep =
  | 'vehicle'
  | 'cab'
  | 'tank'
  | 'pressure'
  | 'compressor'
  | 'power'
  | 'vacuum'
  | 'lining'
  | 'frame'
  | 'extras'
  | 'installation'
  | 'overview';

export type PlacementZone =
  | 'rearFrame.upperLeft'
  | 'rearFrame.upperCenter'
  | 'rearFrame.upperRight'
  | 'rearFrame.middleLeft'
  | 'rearFrame.middleCenter'
  | 'rearFrame.middleRight'
  | 'rearFrame.lowerLeft'
  | 'rearFrame.lowerCenter'
  | 'rearFrame.lowerRight'
  | 'leftWall'
  | 'rightWall'
  | 'frontWall'
  | 'floor'
  | 'ceiling'
  | 'leftRearDoor'
  | 'rightRearDoor'
  | 'any';

export type VisualType =
  | 'tank'
  | 'pressureWasher'
  | 'hoseReel'
  | 'compressor'
  | 'generator'
  | 'vacuum'
  | 'frame'
  | 'shelf'
  | 'toolbox'
  | 'bottleHolder'
  | 'bucketHolder'
  | 'lining'
  | 'set'
  | 'none';

export interface Visual3D {
  type: VisualType;
  width?: number;
  height?: number;
  depth?: number;
  zone?: PlacementZone;
  modelUrl?: string;
  variant?: string;
  isDemoAsset?: boolean;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
  clearance?: number;
}

export interface ProductPlacement {
  preferredZone: PlacementZone;
  allowedZones: PlacementZone[];
  priority: number;
}

export interface ProductCompatibility {
  vehicleCategories?: VehicleCategory[];
  cabTypes?: CabType[];
  maxTankLiters?: number;
  minCargoLengthM?: number;
  requires?: string[];
  conflicts?: string[];
}

export interface DetailingProduct {
  id: string;
  sku: string;
  category: string;
  name: string;
  description: string;
  specifications?: Record<string, string | number>;
  price: number | null;
  priceStatus: PriceStatus;
  installationPrice?: number | null;
  visual3D: Visual3D;
  dimensions: ProductDimensions;
  placement: ProductPlacement;
  compatibility: ProductCompatibility;
  capacityLiters?: number;
  estimatedWaterWeightKg?: number;
  weightEmptyKg?: number;
  active: boolean;
  isDemo?: boolean;
}

export interface VehicleCategoryOption {
  id: VehicleCategory;
  name: string;
  description: string;
  examples: string[];
  /** demo cargo dimensions in meters */
  cargo: { length: number; width: number; height: number };
  doubleCabLengthFactor: number;
}

export interface CargoSpaceMeters {
  length: number;
  width: number;
  height: number;
  isDemo: boolean;
  vehicleCategory: VehicleCategory | null;
  cabType: CabType | null;
}

export interface DetailingConfiguration {
  vehicleCategory: VehicleCategory | null;
  cabType: CabType | null;
  tankId: string | null;
  floatValve: boolean | null;
  pressureWasherId: string | null;
  pressureReelId: string | null;
  compressorId: string | null;
  airReelId: string | null;
  generatorId: string | null;
  powerReelId: string | null;
  vacuumId: string | null;
  liningId: string | null;
  frameComboId: string | null;
  extraIds: string[];
  bottleHolder: boolean;
  bucketHolder: boolean;
  installationType: InstallationType;
  specialRequests: string;
  includeBTW: boolean;
}

export interface PlacedItem {
  productId: string;
  zone: PlacementZone;
  position: [number, number, number];
  size: [number, number, number];
  slotIndex?: number;
}

export interface LayoutResult {
  placements: PlacedItem[];
  warnings: string[];
  fits: boolean;
  requiresInstallerReview: boolean;
}

export interface PricingLine {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number | null;
  priceStatus: PriceStatus;
  qty: number;
  lineTotal: number | null;
}

export interface PricingResult {
  items: PricingLine[];
  knownSubtotal: number;
  pendingCount: number;
  pendingNames: string[];
  btwRate: number;
  knownBtw: number;
  knownTotalIncl: number;
  hasPending: boolean;
}

export interface ConfigurationSnapshot {
  configurationId: string;
  createdAt: string;
  vehicleCategory: VehicleCategory | null;
  cabType: CabType | null;
  tank: string | null;
  floatValve: boolean | null;
  pressureWasher: string | null;
  pressureReel: string | null;
  compressor: string | null;
  airReel: string | null;
  generator: string | null;
  powerReel: string | null;
  vacuum: string | null;
  lining: string | null;
  frameCombo: string | null;
  extras: string[];
  bottleHolder: boolean;
  bucketHolder: boolean;
  installationType: InstallationType;
  specialRequests: string;
  knownSubtotal: number;
  pendingPriceItems: string[];
  estimatedWaterWeightKg: number;
  layoutWarnings: string[];
}

export interface Customer {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  postcode: string;
  remarks?: string;
}

export interface Quote {
  id: string;
  createdAt: string;
  customer: Customer;
  snapshot: ConfigurationSnapshot;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  storage: 'local';
}

export const DEMO_MODE = true;
