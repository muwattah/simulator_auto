/** Mobile Detailing catalog — demo data, prices pending */
import type {
  DetailingProduct,
  VehicleCategoryOption,
  VehicleCategory,
} from '../types';

export const vehicleCategories: VehicleCategoryOption[] = [
  {
    id: 'small',
    name: 'Bestelwagen klein',
    description: 'Compacte bestelwagens',
    examples: ['Volkswagen Caddy', 'Citroën Berlingo', 'Peugeot Partner', 'Opel Combo'],
    cargo: { length: 1.9, width: 1.45, height: 1.25 },
    doubleCabLengthFactor: 0.72,
  },
  {
    id: 'medium',
    name: 'Middelgrote bestelwagen',
    description: 'Meest gekozen voor mobile detailing',
    examples: ['Mercedes Vito', 'VW Transporter', 'Ford Transit Custom', 'Renault Trafic', 'Peugeot Expert'],
    cargo: { length: 2.9, width: 1.7, height: 1.4 },
    doubleCabLengthFactor: 0.78,
  },
  {
    id: 'large',
    name: 'Bestelwagen groot',
    description: 'Maximale laadruimte',
    examples: ['Mercedes Sprinter', 'VW Crafter', 'Ford Transit', 'Renault Master', 'Fiat Ducato'],
    cargo: { length: 3.6, width: 1.8, height: 1.9 },
    doubleCabLengthFactor: 0.82,
  },
  {
    id: 'trailer',
    name: 'Aanhangwagen',
    description: 'Losse aanhanger-opbouw',
    examples: ['Gesloten aanhanger', 'Gesloten trailer'],
    cargo: { length: 3.2, width: 1.6, height: 1.8 },
    doubleCabLengthFactor: 1,
  },
];

function P(
  p: Omit<DetailingProduct, 'active' | 'priceStatus' | 'isDemo' | 'price'> &
    Partial<Pick<DetailingProduct, 'price' | 'priceStatus' | 'active' | 'isDemo' | 'capacityLiters' | 'estimatedWaterWeightKg' | 'weightEmptyKg' | 'installationPrice'>>
): DetailingProduct {
  return {
    active: true,
    priceStatus: 'pending',
    price: null,
    isDemo: true,
    ...p,
  };
}

const tankSizes = [
  { id: 'tank_210', L: 210, w: 0.55, h: 0.55, d: 0.75 },
  { id: 'tank_250', L: 250, w: 0.58, h: 0.58, d: 0.8 },
  { id: 'tank_325', L: 325, w: 0.65, h: 0.65, d: 0.9 },
  { id: 'tank_400', L: 400, w: 0.7, h: 0.72, d: 1.0 },
  { id: 'tank_460', L: 460, w: 0.75, h: 0.75, d: 1.05 },
  { id: 'tank_800', L: 800, w: 0.9, h: 0.9, d: 1.25 },
  { id: 'tank_1000', L: 1000, w: 1.0, h: 0.95, d: 1.35 },
];

export const products: DetailingProduct[] = [
  // Tanks
  ...tankSizes.map((t) =>
    P({
      id: t.id,
      sku: t.id.toUpperCase(),
      category: 'tank',
      name: `Watertank ${t.L} L`,
      description: `Industriële watertank ${t.L} liter voor mobile detailing.`,
      capacityLiters: t.L,
      estimatedWaterWeightKg: t.L,
      dimensions: { width: t.w, height: t.h, depth: t.d, clearance: 0.05 },
      placement: { preferredZone: 'floor', allowedZones: ['floor', 'rearFrame.lowerCenter'], priority: 10 },
      compatibility: { vehicleCategories: t.L >= 800 ? ['medium', 'large', 'trailer'] : undefined },
      visual3D: { type: 'tank', width: t.w, height: t.h, depth: t.d, zone: 'floor', variant: String(t.L), isDemoAsset: true },
      specifications: { capaciteit: `${t.L} L` },
    })
  ),

  // Pressure washers
  P({
    id: 'pressure_electric',
    sku: 'PW-EL',
    category: 'pressure',
    name: 'Elektrische hogedrukreiniger',
    description: 'Compacte elektrische hogedrukunit.',
    dimensions: { width: 0.4, height: 0.55, depth: 0.5 },
    placement: { preferredZone: 'rearFrame.lowerLeft', allowedZones: ['rearFrame.lowerLeft', 'floor', 'leftWall'], priority: 20 },
    compatibility: {},
    visual3D: { type: 'pressureWasher', width: 0.4, height: 0.55, depth: 0.5, variant: 'electric', isDemoAsset: true },
    specifications: { type: 'elektrisch' },
  }),
  P({
    id: 'pressure_petrol',
    sku: 'PW-PE',
    category: 'pressure',
    name: 'Benzinehogedrukreiniger',
    description: 'Krachtige benzine-hogedrukreiniger.',
    dimensions: { width: 0.5, height: 0.6, depth: 0.55 },
    placement: { preferredZone: 'rearFrame.lowerRight', allowedZones: ['rearFrame.lowerRight', 'floor'], priority: 20 },
    compatibility: {},
    visual3D: { type: 'pressureWasher', width: 0.5, height: 0.6, depth: 0.55, variant: 'petrol', isDemoAsset: true },
    specifications: { type: 'benzine' },
  }),

  // Pressure reels
  ...(
    [
      ['pressure_reel_manual_10', 'Handhaspel 10 m', 'manual', 10, 0.32],
      ['pressure_reel_manual_15', 'Handhaspel 15 m', 'manual', 15, 0.35],
      ['pressure_reel_spring_18', 'Veerhaspel 18 m', 'spring', 18, 0.38],
      ['pressure_reel_spring_25', 'Veerhaspel 25 m', 'spring', 25, 0.42],
    ] as const
  ).map(([id, name, variant, meters, size]) =>
    P({
      id,
      sku: id.toUpperCase(),
      category: 'pressure_reel',
      name: `Hogedrukhaspel — ${name}`,
      description: `Hogedrukhaspel 200 bar, ${meters} m.`,
      dimensions: { width: size, height: size, depth: size * 0.55 },
      placement: {
        preferredZone: 'rearFrame.upperLeft',
        allowedZones: ['rearFrame.upperLeft', 'rearFrame.upperCenter', 'rearFrame.upperRight', 'rearFrame.middleLeft'],
        priority: 30,
      },
      compatibility: {},
      visual3D: { type: 'hoseReel', width: size, height: size, depth: size * 0.55, variant: `pressure-${variant}-${meters}`, isDemoAsset: true },
      specifications: { lengte: `${meters} m`, druk: '200 bar', type: variant },
    })
  ),

  // Compressors
  P({
    id: 'compressor_3_3_8bar',
    sku: 'CMP-3-3',
    category: 'compressor',
    name: 'Compressor 3+3 L — 8 bar — 200 L/min',
    description: 'Compacte dual-tank compressor.',
    dimensions: { width: 0.55, height: 0.5, depth: 0.35 },
    placement: { preferredZone: 'floor', allowedZones: ['floor', 'rearFrame.lowerRight'], priority: 25 },
    compatibility: {},
    visual3D: { type: 'compressor', width: 0.55, height: 0.5, depth: 0.35, variant: '3+3', isDemoAsset: true },
    specifications: { tank: '3+3 L', druk: '8 bar', debiet: '200 L/min' },
  }),
  P({
    id: 'compressor_4_4_15bar',
    sku: 'CMP-4-4',
    category: 'compressor',
    name: 'Compressor 4+4 L — 15 bar — 190 L/min',
    description: 'Hogedruk dual-tank compressor.',
    dimensions: { width: 0.6, height: 0.55, depth: 0.38 },
    placement: { preferredZone: 'floor', allowedZones: ['floor', 'rearFrame.lowerRight'], priority: 25 },
    compatibility: {},
    visual3D: { type: 'compressor', width: 0.6, height: 0.55, depth: 0.38, variant: '4+4', isDemoAsset: true },
    specifications: { tank: '4+4 L', druk: '15 bar', debiet: '190 L/min' },
  }),
  P({
    id: 'compressor_24_8bar',
    sku: 'CMP-24',
    category: 'compressor',
    name: 'Compressor 24 L — 8 bar — 250 L/min',
    description: 'Grote 24L compressortank.',
    dimensions: { width: 0.75, height: 0.7, depth: 0.45 },
    placement: { preferredZone: 'floor', allowedZones: ['floor'], priority: 25 },
    compatibility: { vehicleCategories: ['medium', 'large', 'trailer'] },
    visual3D: { type: 'compressor', width: 0.75, height: 0.7, depth: 0.45, variant: '24', isDemoAsset: true },
    specifications: { tank: '24 L', druk: '8 bar', debiet: '250 L/min' },
  }),

  // Air reels
  ...(
    [
      ['air_reel_14', 14, 0.3],
      ['air_reel_15', 15, 0.32],
      ['air_reel_18', 18, 0.34],
      ['air_reel_25', 25, 0.38],
    ] as const
  ).map(([id, meters, size]) =>
    P({
      id,
      sku: id.toUpperCase(),
      category: 'air_reel',
      name: `Persluchthaspel — Veerhaspel ${meters} m`,
      description: `Persluchthaspel 20 bar, ${meters} m.`,
      dimensions: { width: size, height: size, depth: size * 0.5 },
      placement: {
        preferredZone: 'rearFrame.upperCenter',
        allowedZones: ['rearFrame.upperLeft', 'rearFrame.upperCenter', 'rearFrame.upperRight', 'rearFrame.middleCenter'],
        priority: 32,
      },
      compatibility: { requires: ['compressor'] },
      visual3D: { type: 'hoseReel', width: size, height: size, depth: size * 0.5, variant: `air-${meters}`, isDemoAsset: true },
      specifications: { lengte: `${meters} m`, druk: '20 bar' },
    })
  ),

  // Generators
  ...(
    [
      ['generator_3000', 'Generator 3000 W — 66 dB', 3000, 66, 0.45, 0.5, 0.4],
      ['generator_3800', 'Generator 3800 W — 66 dB', 3800, 66, 0.5, 0.55, 0.42],
      ['generator_6000', 'Generator 6000 W — 75 dB', 6000, 75, 0.6, 0.65, 0.48],
      ['generator_8000', 'Generator 8000 W — 77 dB', 8000, 77, 0.7, 0.72, 0.55],
    ] as const
  ).map(([id, name, watts, db, w, h, d]) =>
    P({
      id,
      sku: id.toUpperCase(),
      category: 'generator',
      name,
      description: `Generator ${watts} W, ${db} dB.`,
      dimensions: { width: w, height: h, depth: d },
      placement: { preferredZone: 'floor', allowedZones: ['floor', 'rearFrame.lowerLeft'], priority: 22 },
      compatibility: watts >= 6000 ? { vehicleCategories: ['medium', 'large', 'trailer'] } : {},
      visual3D: { type: 'generator', width: w, height: h, depth: d, variant: String(watts), isDemoAsset: true },
      specifications: { vermogen: `${watts} W`, geluid: `${db} dB` },
    })
  ),

  // Power reels
  P({
    id: 'power_reel_9',
    sku: 'PWR-9',
    category: 'power_reel',
    name: 'Stroomhaspel — Veerhaspel 9 m',
    description: 'Stroomhaspel 9 m.',
    dimensions: { width: 0.28, height: 0.28, depth: 0.16 },
    placement: {
      preferredZone: 'rearFrame.upperRight',
      allowedZones: ['rearFrame.upperRight', 'rearFrame.middleRight', 'rearFrame.upperCenter'],
      priority: 34,
    },
    compatibility: {},
    visual3D: { type: 'hoseReel', width: 0.28, height: 0.28, depth: 0.16, variant: 'power-9', isDemoAsset: true },
    specifications: { lengte: '9 m' },
  }),
  P({
    id: 'power_reel_14',
    sku: 'PWR-14',
    category: 'power_reel',
    name: 'Stroomhaspel — Veerhaspel 14 m',
    description: 'Stroomhaspel 14 m.',
    dimensions: { width: 0.32, height: 0.32, depth: 0.18 },
    placement: {
      preferredZone: 'rearFrame.upperRight',
      allowedZones: ['rearFrame.upperRight', 'rearFrame.middleRight', 'rearFrame.upperCenter'],
      priority: 34,
    },
    compatibility: {},
    visual3D: { type: 'hoseReel', width: 0.32, height: 0.32, depth: 0.18, variant: 'power-14', isDemoAsset: true },
    specifications: { lengte: '14 m' },
  }),

  // Vacuum
  P({
    id: 'vacuum_portable',
    sku: 'VAC-P',
    category: 'vacuum',
    name: 'Los uitneembare stofzuiger',
    description: 'Mobiele stofzuigunit.',
    dimensions: { width: 0.4, height: 0.7, depth: 0.4 },
    placement: { preferredZone: 'floor', allowedZones: ['floor', 'leftWall'], priority: 28 },
    compatibility: {},
    visual3D: { type: 'vacuum', width: 0.4, height: 0.7, depth: 0.4, variant: 'portable', isDemoAsset: true },
  }),
  P({
    id: 'vacuum_reel_18',
    sku: 'VAC-R18',
    category: 'vacuum',
    name: 'Stofzuiger met handhaspel 18 m',
    description: 'Stofzuigunit met dikke slanghaspel 18 m.',
    dimensions: { width: 0.55, height: 0.85, depth: 0.5 },
    placement: { preferredZone: 'rearFrame.middleRight', allowedZones: ['rearFrame.middleRight', 'floor', 'rightWall'], priority: 28 },
    compatibility: {},
    visual3D: { type: 'vacuum', width: 0.55, height: 0.85, depth: 0.5, variant: 'reel-18', isDemoAsset: true },
    specifications: { slang: '18 m' },
  }),

  // Lining
  P({
    id: 'lining_none',
    sku: 'LIN-0',
    category: 'lining',
    name: 'Geen extra bekleding',
    description: 'Standaard laadruimte.',
    dimensions: { width: 0, height: 0, depth: 0 },
    placement: { preferredZone: 'any', allowedZones: ['any'], priority: 0 },
    compatibility: {},
    visual3D: { type: 'lining', variant: 'none', isDemoAsset: true },
  }),
  P({
    id: 'lining_fabric',
    sku: 'LIN-ST',
    category: 'lining',
    name: 'Stofbekleding',
    description: 'Donkere professionele stofbekleding.',
    dimensions: { width: 0, height: 0, depth: 0 },
    placement: { preferredZone: 'any', allowedZones: ['any'], priority: 0 },
    compatibility: {},
    visual3D: { type: 'lining', variant: 'fabric', isDemoAsset: true },
  }),
  P({
    id: 'lining_aluminium',
    sku: 'LIN-AL',
    category: 'lining',
    name: 'Aluminium / traanplaat (gelakt)',
    description: 'Aluminium traanplaat-look.',
    dimensions: { width: 0, height: 0, depth: 0 },
    placement: { preferredZone: 'any', allowedZones: ['any'], priority: 0 },
    compatibility: {},
    visual3D: { type: 'lining', variant: 'aluminium', isDemoAsset: true },
  }),

  // Frame combos (virtual products for selection)
  P({
    id: 'frame_full',
    sku: 'FR-FULL',
    category: 'frame',
    name: 'Haspelframe + watertankframe + rekframe + 5 L opslagrek',
    description: 'Volledige frame-opstelling.',
    dimensions: { width: 1.5, height: 1.2, depth: 0.4 },
    placement: { preferredZone: 'rearFrame.middleCenter', allowedZones: ['rearFrame.middleCenter'], priority: 5 },
    compatibility: {},
    visual3D: { type: 'frame', variant: 'full', isDemoAsset: true },
  }),
  P({
    id: 'frame_standard',
    sku: 'FR-STD',
    category: 'frame',
    name: 'Haspelframe + watertankframe + rekframe',
    description: 'Standaard frame zonder 5L opslag.',
    dimensions: { width: 1.4, height: 1.15, depth: 0.38 },
    placement: { preferredZone: 'rearFrame.middleCenter', allowedZones: ['rearFrame.middleCenter'], priority: 5 },
    compatibility: {},
    visual3D: { type: 'frame', variant: 'standard', isDemoAsset: true },
  }),
  P({
    id: 'frame_tank_storage',
    sku: 'FR-TS',
    category: 'frame',
    name: 'Haspelframe + watertankframe + 5 L opslagrek',
    description: 'Frame met 5L opslag.',
    dimensions: { width: 1.3, height: 1.1, depth: 0.36 },
    placement: { preferredZone: 'rearFrame.middleCenter', allowedZones: ['rearFrame.middleCenter'], priority: 5 },
    compatibility: {},
    visual3D: { type: 'frame', variant: 'tank_storage', isDemoAsset: true },
  }),
  P({
    id: 'frame_basic',
    sku: 'FR-BAS',
    category: 'frame',
    name: 'Haspelframe + watertankframe',
    description: 'Basis frame.',
    dimensions: { width: 1.2, height: 1.0, depth: 0.35 },
    placement: { preferredZone: 'rearFrame.middleCenter', allowedZones: ['rearFrame.middleCenter'], priority: 5 },
    compatibility: {},
    visual3D: { type: 'frame', variant: 'basic', isDemoAsset: true },
  }),
  P({
    id: 'frame_toolbox',
    sku: 'FR-TB',
    category: 'frame',
    name: 'Haspelframe + watertankframe + 5 L opslagrek + toolbox',
    description: 'Frame met toolbox.',
    dimensions: { width: 1.45, height: 1.2, depth: 0.4 },
    placement: { preferredZone: 'rearFrame.middleCenter', allowedZones: ['rearFrame.middleCenter'], priority: 5 },
    compatibility: {},
    visual3D: { type: 'frame', variant: 'toolbox', isDemoAsset: true },
  }),

  // Holders
  P({
    id: 'bottle_holder',
    sku: 'BH-1',
    category: 'holder',
    name: 'Bottle holder set',
    description: 'Houder voor detailingflessen.',
    dimensions: { width: 0.35, height: 0.4, depth: 0.12 },
    placement: { preferredZone: 'leftRearDoor', allowedZones: ['leftRearDoor', 'rightRearDoor', 'leftWall'], priority: 40 },
    compatibility: {},
    visual3D: { type: 'bottleHolder', width: 0.35, height: 0.4, depth: 0.12, isDemoAsset: true },
  }),
  P({
    id: 'bucket_holder',
    sku: 'BUH-1',
    category: 'holder',
    name: 'Bucket holder set',
    description: 'Emmerhouder.',
    dimensions: { width: 0.35, height: 0.25, depth: 0.35 },
    placement: { preferredZone: 'rightRearDoor', allowedZones: ['rightRearDoor', 'leftRearDoor', 'floor'], priority: 42 },
    compatibility: {},
    visual3D: { type: 'bucketHolder', width: 0.35, height: 0.25, depth: 0.35, isDemoAsset: true },
  }),

  // Extra sets
  P({
    id: 'set_tools_products',
    sku: 'SET-TP',
    category: 'extra',
    name: 'Basisgereedschap & producten',
    description: 'Volledige basisset tools en producten.',
    dimensions: { width: 0.4, height: 0.3, depth: 0.3 },
    placement: { preferredZone: 'rearFrame.lowerCenter', allowedZones: ['rearFrame.lowerCenter', 'floor'], priority: 50 },
    compatibility: {},
    visual3D: { type: 'set', variant: 'tools_products', isDemoAsset: true },
  }),
  P({
    id: 'set_products',
    sku: 'SET-P',
    category: 'extra',
    name: 'Basisset producten',
    description: 'Basisset detailingproducten.',
    dimensions: { width: 0.35, height: 0.25, depth: 0.25 },
    placement: { preferredZone: 'rearFrame.lowerCenter', allowedZones: ['floor'], priority: 50 },
    compatibility: {},
    visual3D: { type: 'set', variant: 'products', isDemoAsset: true },
  }),
  P({
    id: 'set_tools',
    sku: 'SET-T',
    category: 'extra',
    name: 'Basisset gereedschap',
    description: 'Basisset gereedschap.',
    dimensions: { width: 0.35, height: 0.2, depth: 0.25 },
    placement: { preferredZone: 'rearFrame.lowerCenter', allowedZones: ['floor'], priority: 50 },
    compatibility: {},
    visual3D: { type: 'set', variant: 'tools', isDemoAsset: true },
  }),
  P({
    id: 'steamer',
    sku: 'STM-1',
    category: 'extra',
    name: 'Stomer',
    description: 'Stoomreiniger voor interieur.',
    dimensions: { width: 0.35, height: 0.45, depth: 0.35 },
    placement: { preferredZone: 'floor', allowedZones: ['floor'], priority: 48 },
    compatibility: {},
    visual3D: { type: 'set', variant: 'steamer', isDemoAsset: true },
  }),
  P({
    id: 'extractor',
    sku: 'EXT-1',
    category: 'extra',
    name: 'Extractor',
    description: 'Extractor voor bekleding.',
    dimensions: { width: 0.4, height: 0.55, depth: 0.4 },
    placement: { preferredZone: 'floor', allowedZones: ['floor'], priority: 48 },
    compatibility: {},
    visual3D: { type: 'set', variant: 'extractor', isDemoAsset: true },
  }),
  P({
    id: 'spray_bottles',
    sku: 'SPB-1',
    category: 'extra',
    name: 'Sprayflessen',
    description: 'Set sprayflessen.',
    dimensions: { width: 0.25, height: 0.3, depth: 0.2 },
    placement: { preferredZone: 'leftRearDoor', allowedZones: ['leftRearDoor', 'floor'], priority: 55 },
    compatibility: {},
    visual3D: { type: 'set', variant: 'spray', isDemoAsset: true },
  }),
];

export const tankOptions = [
  { id: null as string | null, label: 'Geen watertank' },
  ...tankSizes.map((t) => ({ id: t.id, label: `${t.L} L` })),
];

export const pressureOptions = [
  { id: null as string | null, label: 'Geen' },
  { id: 'pressure_electric', label: 'Elektrische hogedrukreiniger' },
  { id: 'pressure_petrol', label: 'Benzinehogedrukreiniger' },
  { id: 'pressure_both', label: 'Beide' },
];

export const pressureReelOptions = [
  { id: null as string | null, label: 'Geen' },
  { id: 'pressure_reel_manual_10', label: 'Handhaspel 10 m' },
  { id: 'pressure_reel_manual_15', label: 'Handhaspel 15 m' },
  { id: 'pressure_reel_spring_18', label: 'Veerhaspel 18 m' },
  { id: 'pressure_reel_spring_25', label: 'Veerhaspel 25 m' },
];

export const compressorOptions = [
  { id: null as string | null, label: 'Geen compressor' },
  { id: 'compressor_3_3_8bar', label: '3+3 L — 8 bar — 200 L/min' },
  { id: 'compressor_4_4_15bar', label: '4+4 L — 15 bar — 190 L/min' },
  { id: 'compressor_24_8bar', label: '24 L — 8 bar — 250 L/min' },
];

export const airReelOptions = [
  { id: null as string | null, label: 'Geen' },
  { id: 'air_reel_14', label: 'Veerhaspel 14 m' },
  { id: 'air_reel_15', label: 'Veerhaspel 15 m' },
  { id: 'air_reel_18', label: 'Veerhaspel 18 m' },
  { id: 'air_reel_25', label: 'Veerhaspel 25 m' },
];

export const generatorOptions = [
  { id: null as string | null, label: 'Geen generator' },
  { id: 'generator_3000', label: 'Generator 3000 W — 66 dB' },
  { id: 'generator_3800', label: 'Generator 3800 W — 66 dB' },
  { id: 'generator_6000', label: 'Generator 6000 W — 75 dB' },
  { id: 'generator_8000', label: 'Generator 8000 W — 77 dB' },
];

export const powerReelOptions = [
  { id: null as string | null, label: 'Geen' },
  { id: 'power_reel_9', label: 'Veerhaspel 9 m' },
  { id: 'power_reel_14', label: 'Veerhaspel 14 m' },
];

export const vacuumOptions = [
  { id: null as string | null, label: 'Geen' },
  { id: 'vacuum_portable', label: 'Los uitneembare stofzuiger' },
  { id: 'vacuum_reel_18', label: 'Stofzuiger met handhaspel 18 m' },
];

export const liningOptions = [
  { id: 'lining_none', label: 'Geen extra bekleding' },
  { id: 'lining_fabric', label: 'Stof' },
  { id: 'lining_aluminium', label: 'Aluminium / traanplaat (gelakt)' },
];

export const frameOptions = [
  { id: 'frame_full', label: 'Haspelframe + watertankframe + rekframe + 5 L opslagrek' },
  { id: 'frame_standard', label: 'Haspelframe + watertankframe + rekframe' },
  { id: 'frame_tank_storage', label: 'Haspelframe + watertankframe + 5 L opslagrek' },
  { id: 'frame_basic', label: 'Haspelframe + watertankframe' },
  { id: 'frame_toolbox', label: 'Haspelframe + watertankframe + 5 L opslagrek + toolbox' },
];

export const extraOptions = [
  { id: 'set_tools_products', label: 'Basisgereedschap & producten' },
  { id: 'set_products', label: 'Basisset producten' },
  { id: 'set_tools', label: 'Basisset gereedschap' },
  { id: 'steamer', label: 'Stomer' },
  { id: 'extractor', label: 'Extractor' },
  { id: 'spray_bottles', label: 'Sprayflessen' },
];

export function getProduct(id: string | null | undefined): DetailingProduct | undefined {
  if (!id) return undefined;
  return products.find((p) => p.id === id);
}

export function getVehicleCategory(id: VehicleCategory | null): VehicleCategoryOption | undefined {
  if (!id) return undefined;
  return vehicleCategories.find((v) => v.id === id);
}

export const STEP_ORDER: import('../types').ConfigStep[] = [
  'vehicle',
  'cab',
  'tank',
  'pressure',
  'compressor',
  'power',
  'vacuum',
  'lining',
  'frame',
  'extras',
  'installation',
  'overview',
];

export const STEP_LABELS: Record<import('../types').ConfigStep, string> = {
  vehicle: 'Voertuig',
  cab: 'Cabine',
  tank: 'Water',
  pressure: 'Hogedruk',
  compressor: 'Lucht',
  power: 'Stroom',
  vacuum: 'Stofzuiging',
  lining: 'Afwerking',
  frame: 'Frame',
  extras: "Extra's",
  installation: 'Installatie',
  overview: 'Overzicht',
};
