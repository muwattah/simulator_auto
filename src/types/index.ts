/** DEMO_DATA marker: types are production-ready; data files may still contain DEMO placeholders */

export type LengthCode = 'L1' | 'L2' | 'L3' | 'L4';
export type HeightCode = 'H1' | 'H2' | 'H3';
export type PositionCode = 'left' | 'right' | 'floor' | 'roof' | 'front' | 'rear' | 'any';
export type Zone3D = 'leftWall' | 'rightWall' | 'frontWall' | 'floor' | 'ceiling' | 'roof' | 'any';

/** Generic 3D representation — later replaceable by GLB/GLTF via modelUrl */
export interface Visual3D {
  type: 'cabinet' | 'drawerUnit' | 'workbench' | 'floor' | 'wallPanel' | 'partition' | 'rail' | 'led' | 'roofRack' | 'ladderHolder' | 'accessory' | 'none';
  width?: number;
  height?: number;
  depth?: number;
  zone: Zone3D;
  modelUrl?: string;
  isDemoAsset?: boolean;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  category: 'small' | 'medium' | 'large';
  image?: string;
  isDemo?: boolean;
}

export interface VehicleVariant {
  id: string;
  vehicleId: string;
  name: string;
  length: LengthCode;
  height: HeightCode;
  yearFrom?: number;
  yearTo?: number;
  description?: string;
  loadLengthMm?: number;
  loadWidthMm?: number;
  loadHeightMm?: number;
}

export interface ProductCompatibility {
  vehicleIds?: string[];
  brandIds?: string[];
  lengthCodes?: LengthCode[];
  heightCodes?: HeightCode[];
  categories?: Array<'small' | 'medium' | 'large'>;
  maxLengthMm?: number;
  maxHeightMm?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
}

export interface Product {
  id: string;
  sku: string;
  categoryId: string;
  subcategory?: string;
  name: string;
  description: string;
  image?: string;
  dimensions?: string;
  weightKg?: number;
  price: number;
  btwPercentage: number;
  montagePrice: number;
  montageHours?: number;
  montageRequired?: boolean;
  montageOptional?: boolean;
  active: boolean;
  compatibility: ProductCompatibility;
  possiblePositions: PositionCode[];
  tags: string[];
  recommendedForProfessions: string[];
  relatedProductIds: string[];
  visual3D?: Visual3D;
  isDemo?: boolean;
}

export interface PackageItem {
  productId: string;
  quantity: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPercent?: number;
  items: PackageItem[];
  popularFor?: string[];
  badge?: string;
  image?: string;
  isDemo?: boolean;
}

export interface ConfigurationItem {
  productId: string;
  quantity: number;
  position?: PositionCode;
  includeMontage?: boolean;
}

export interface Configuration {
  vehicleVariantId: string | null;
  items: ConfigurationItem[];
  packageId?: string | null;
  profession?: string | null;
  budgetBand?: string | null;
  includeBTW: boolean;
}

export interface Customer {
  firstName: string;
  lastName: string;
  company?: string;
  email: string;
  phone: string;
  postcode: string;
  vatNumber?: string;
  remarks?: string;
}

export interface QuotePriceSnapshot {
  items: {
    productId: string;
    name: string;
    sku: string;
    unitPrice: number;
    montage: number;
    qty: number;
    lineTotal: number;
  }[];
  productSubtotal: number;
  montageTotal: number;
  packageDiscount: number;
  subtotalExcl: number;
  btwAmount: number;
  totalIncl: number;
  totalExcl: number;
  btwRate: number;
}

export interface Quote {
  id: string;
  configurationId: string;
  createdAt: string;
  customer: Customer;
  configuration: Configuration;
  vehicleLabel: string;
  professionLabel?: string;
  priceSnapshot: QuotePriceSnapshot;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  storage: 'local';
}

export interface PricingResult {
  items: {
    productId: string;
    name: string;
    sku: string;
    unitPrice: number;
    montage: number;
    qty: number;
    lineTotal: number;
    includeMontage: boolean;
  }[];
  productSubtotal: number;
  montageTotal: number;
  packageDiscount: number;
  discount: number;
  surcharge: number;
  subtotalExcl: number;
  btwAmount: number;
  totalIncl: number;
  totalExcl: number;
  btwRate: number;
}

export interface RecommendationInput {
  vehicleVariantId: string;
  professionId: string;
  budgetBand: 'under_1500' | '1500_2500' | '2500_4000' | 'over_4000';
}

export interface RecommendationResult {
  packageId?: string;
  productIds: string[];
  title: string;
  rationale: string;
  estimatedExcl: number;
}

export interface CargoSpaceMeters {
  length: number;
  width: number;
  height: number;
  isDemo: boolean;
}
