export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  image?: string;
}

export interface VehicleVariant {
  id: string;
  vehicleId: string;
  name: string; // e.g. "L2H1"
  length: 'L1' | 'L2' | 'L3' | 'L4';
  height: 'H1' | 'H2' | 'H3';
  yearFrom?: number;
  yearTo?: number;
  description?: string;
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
  categoryId: string;
  name: string;
  description: string;
  dimensions?: string;
  price: number; // excl BTW
  montagePrice: number;
  image?: string;
  active: boolean;
  compatibleVariantIds: string[]; // empty = all
  position?: 'left' | 'right' | 'floor' | 'roof' | 'front' | 'rear' | 'any';
  popularFor?: string[]; // professions
}

export interface PackageItem {
  productId: string;
  quantity: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number; // fixed package price excl BTW, or 0 for sum
  discountPercent?: number;
  items: PackageItem[];
  popularFor?: string[];
  image?: string;
}

export interface ConfigurationItem {
  productId: string;
  quantity: number;
  position?: string;
}

export interface Configuration {
  vehicleVariantId: string | null;
  items: ConfigurationItem[];
  packageId?: string | null;
  profession?: string | null;
  includeBTW: boolean;
}

export interface Customer {
  name: string;
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
  configuration: Configuration;
  vehicleLabel: string;
  itemsDetail: { name: string; price: number; montage: number; qty: number }[];
  subtotal: number;
  montageTotal: number;
  btw: number;
  total: number;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
}

export interface PricingResult {
  items: { productId: string; name: string; unitPrice: number; montage: number; qty: number; lineTotal: number }[];
  productSubtotal: number;
  montageTotal: number;
  packageDiscount: number;
  subtotalExcl: number;
  btwAmount: number;
  totalIncl: number;
  totalExcl: number;
}
