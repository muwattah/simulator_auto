/** DEMO_DATA — placeholder catalog. Replace with CMS/API later. */
import type { Vehicle, VehicleVariant, Category, Product, Package } from '../types';

export const vehicles: Vehicle[] = [
  { id: 'mb-citan', brand: 'Mercedes-Benz', model: 'Citan', category: 'small', isDemo: true },
  { id: 'mb-vito', brand: 'Mercedes-Benz', model: 'Vito', category: 'medium', isDemo: true },
  { id: 'mb-sprinter', brand: 'Mercedes-Benz', model: 'Sprinter', category: 'large', isDemo: true },
  { id: 'vw-caddy', brand: 'Volkswagen', model: 'Caddy', category: 'small', isDemo: true },
  { id: 'vw-transporter', brand: 'Volkswagen', model: 'Transporter', category: 'medium', isDemo: true },
  { id: 'vw-crafter', brand: 'Volkswagen', model: 'Crafter', category: 'large', isDemo: true },
  { id: 'ford-transit-connect', brand: 'Ford', model: 'Transit Connect', category: 'small', isDemo: true },
  { id: 'ford-transit-custom', brand: 'Ford', model: 'Transit Custom', category: 'medium', isDemo: true },
  { id: 'ford-transit', brand: 'Ford', model: 'Transit', category: 'large', isDemo: true },
  { id: 'renault-kangoo', brand: 'Renault', model: 'Kangoo', category: 'small', isDemo: true },
  { id: 'renault-trafic', brand: 'Renault', model: 'Trafic', category: 'medium', isDemo: true },
  { id: 'renault-master', brand: 'Renault', model: 'Master', category: 'large', isDemo: true },
  { id: 'peugeot-partner', brand: 'Peugeot', model: 'Partner', category: 'small', isDemo: true },
  { id: 'peugeot-expert', brand: 'Peugeot', model: 'Expert', category: 'medium', isDemo: true },
  { id: 'peugeot-boxer', brand: 'Peugeot', model: 'Boxer', category: 'large', isDemo: true },
  { id: 'citroen-berlingo', brand: 'Citroën', model: 'Berlingo', category: 'small', isDemo: true },
  { id: 'citroen-jumpy', brand: 'Citroën', model: 'Jumpy', category: 'medium', isDemo: true },
  { id: 'citroen-jumper', brand: 'Citroën', model: 'Jumper', category: 'large', isDemo: true },
  { id: 'opel-combo', brand: 'Opel', model: 'Combo', category: 'small', isDemo: true },
  { id: 'opel-vivaro', brand: 'Opel', model: 'Vivaro', category: 'medium', isDemo: true },
  { id: 'opel-movano', brand: 'Opel', model: 'Movano', category: 'large', isDemo: true },
  { id: 'fiat-doblo', brand: 'Fiat', model: 'Doblo', category: 'small', isDemo: true },
  { id: 'fiat-scudo', brand: 'Fiat', model: 'Scudo', category: 'medium', isDemo: true },
  { id: 'fiat-ducato', brand: 'Fiat', model: 'Ducato', category: 'large', isDemo: true },
];

function vf(vehicleId: string, lengths: Array<'L1'|'L2'|'L3'|'L4'>, heights: Array<'H1'|'H2'|'H3'>): VehicleVariant[] {
  const baseLen: Record<string, number> = { L1: 2500, L2: 3000, L3: 3500, L4: 4000 };
  const baseH: Record<string, number> = { H1: 1400, H2: 1800, H3: 2100 };
  const out: VehicleVariant[] = [];
  for (const L of lengths) for (const H of heights) {
    out.push({ id: `${vehicleId}-${L.toLowerCase()}${H.toLowerCase()}`, vehicleId, name: `${L}${H}`, length: L, height: H, description: `${L} · ${H}`, loadLengthMm: baseLen[L], loadWidthMm: 1700, loadHeightMm: baseH[H] });
  }
  return out;
}

export const vehicleVariants: VehicleVariant[] = [
  ...vf('mb-citan', ['L1','L2'], ['H1']), ...vf('vw-caddy', ['L1','L2'], ['H1']), ...vf('ford-transit-connect', ['L1','L2'], ['H1']),
  ...vf('renault-kangoo', ['L1','L2'], ['H1']), ...vf('peugeot-partner', ['L1','L2'], ['H1']), ...vf('citroen-berlingo', ['L1','L2'], ['H1']),
  ...vf('opel-combo', ['L1','L2'], ['H1']), ...vf('fiat-doblo', ['L1','L2'], ['H1']),
  ...vf('mb-vito', ['L1','L2'], ['H1','H2']), ...vf('vw-transporter', ['L1','L2'], ['H1','H2']), ...vf('ford-transit-custom', ['L1','L2'], ['H1','H2']),
  ...vf('renault-trafic', ['L1','L2'], ['H1','H2']), ...vf('peugeot-expert', ['L1','L2'], ['H1','H2']), ...vf('citroen-jumpy', ['L1','L2'], ['H1','H2']),
  ...vf('opel-vivaro', ['L1','L2'], ['H1','H2']), ...vf('fiat-scudo', ['L1','L2'], ['H1','H2']),
  ...vf('mb-sprinter', ['L1','L2','L3','L4'], ['H1','H2','H3']), ...vf('vw-crafter', ['L2','L3','L4'], ['H1','H2','H3']),
  ...vf('ford-transit', ['L2','L3','L4'], ['H1','H2','H3']), ...vf('renault-master', ['L2','L3'], ['H1','H2','H3']),
  ...vf('peugeot-boxer', ['L2','L3','L4'], ['H1','H2','H3']), ...vf('citroen-jumper', ['L2','L3','L4'], ['H1','H2','H3']),
  ...vf('opel-movano', ['L2','L3'], ['H1','H2','H3']), ...vf('fiat-ducato', ['L2','L3','L4'], ['H1','H2','H3']),
];

export const categories: Category[] = [
  { id: 'vloeren', name: 'Vloeren', slug: 'vloeren', order: 1 },
  { id: 'wandbekleding', name: 'Wandbekleding', slug: 'wandbekleding', order: 2 },
  { id: 'scheidingswanden', name: 'Scheidingswanden', slug: 'scheidingswanden', order: 3 },
  { id: 'kasten', name: 'Kasten', slug: 'kasten', order: 4 },
  { id: 'rekken', name: 'Rekken', slug: 'rekken', order: 5 },
  { id: 'ladenblokken', name: 'Ladenblokken', slug: 'ladenblokken', order: 6 },
  { id: 'werkbanken', name: 'Werkbanken', slug: 'werkbanken', order: 7 },
  { id: 'gereedschapshouders', name: 'Gereedschapshouders', slug: 'gereedschapshouders', order: 8 },
  { id: 'sjorrails', name: 'Sjorrails', slug: 'sjorrails', order: 9 },
  { id: 'dakdragers', name: 'Dakdragers', slug: 'dakdragers', order: 10 },
  { id: 'ladderhouders', name: 'Ladderhouders', slug: 'ladderhouders', order: 11 },
  { id: 'verlichting', name: 'Verlichting', slug: 'verlichting', order: 12 },
  { id: 'elektriciteit', name: 'Elektriciteit', slug: 'elektriciteit', order: 13 },
  { id: 'omvormers', name: 'Omvormers', slug: 'omvormers', order: 14 },
  { id: 'beveiliging', name: 'Beveiliging', slug: 'beveiliging', order: 15 },
  { id: 'accessoires', name: 'Accessoires', slug: 'accessoires', order: 16 },
  { id: 'montage', name: 'Montage', slug: 'montage', order: 17 },
];

const allC = { categories: ['small', 'medium', 'large'] as const };
const medLg = { categories: ['medium', 'large'] as const };
const lgOnly = { categories: ['large'] as const };

function P(p: Partial<Product> & Pick<Product, 'id' | 'sku' | 'categoryId' | 'name' | 'description' | 'price' | 'montagePrice' | 'possiblePositions'>): Product {
  return { btwPercentage: 21, active: true, compatibility: { ...allC }, tags: [], recommendedForProfessions: [], relatedProductIds: [], isDemo: true, ...p };
}

export const products: Product[] = [
  P({ id: 'vloer-multiplex-12', sku: 'VL-MX-12', categoryId: 'vloeren', name: 'Vloer multiplex 12mm', description: 'Stevige multiplex vloer met antislip coating.', dimensions: 'Op maat', price: 320, montagePrice: 120, montageHours: 1.5, montageRequired: true, possiblePositions: ['floor'], tags: ['vloer'], recommendedForProfessions: ['elektricien','loodgieter','technieker','koerier'], relatedProductIds: ['wand-hout','led-basis','sjorrail-set'] }),
  P({ id: 'vloer-multiplex-15', sku: 'VL-MX-15', categoryId: 'vloeren', name: 'Vloer multiplex 15mm heavy duty', description: 'Extra stevige 15mm multiplex.', dimensions: 'Op maat', price: 420, montagePrice: 140, compatibility: { ...medLg }, possiblePositions: ['floor'], tags: ['vloer'], recommendedForProfessions: ['bouw','schrijnwerker','hvac'], relatedProductIds: ['sjorrail-set'] }),
  P({ id: 'wand-hout', sku: 'WB-HOUT', categoryId: 'wandbekleding', name: 'Zijwandbekleding hout', description: 'Houten bekleding links + rechts.', price: 280, montagePrice: 150, possiblePositions: ['left','right'], tags: ['wand'], relatedProductIds: ['vloer-multiplex-12','led-basis'] }),
  P({ id: 'wand-kunststof', sku: 'WB-KS', categoryId: 'wandbekleding', name: 'Zijwandbekleding kunststof', description: 'Kunststof bekleding, makkelijk schoon.', price: 340, montagePrice: 160, compatibility: { ...medLg }, possiblePositions: ['left','right'] }),
  P({ id: 'scheidingswand-basis', sku: 'SW-BAS', categoryId: 'scheidingswanden', name: 'Scheidingswand standaard', description: 'Stalen scheidingswand met raam.', price: 450, montagePrice: 200, compatibility: { ...medLg }, possiblePositions: ['front'] }),
  P({ id: 'kast-links-basis', sku: 'KS-L-BAS', categoryId: 'kasten', name: 'Basis kast links', description: 'Metalen kast links, verstelbare schappen.', dimensions: '1200×400×350 mm', price: 449, montagePrice: 80, compatibility: { ...medLg, maxLengthMm: 1300 }, possiblePositions: ['left'], tags: ['kast','links'], recommendedForProfessions: ['elektricien','loodgieter','technieker','installateur'], relatedProductIds: ['kast-rechts-basis','ladenblok-3','led-basis','sjorrail-set'] }),
  P({ id: 'kast-rechts-basis', sku: 'KS-R-BAS', categoryId: 'kasten', name: 'Basis kast rechts', description: 'Metalen kast rechts, verstelbare schappen.', dimensions: '1200×400×350 mm', price: 449, montagePrice: 80, compatibility: { ...medLg, maxLengthMm: 1300 }, possiblePositions: ['right'], tags: ['kast','rechts'], recommendedForProfessions: ['elektricien','loodgieter','technieker'], relatedProductIds: ['kast-links-basis','ladenblok-3'] }),
  P({ id: 'kast-dubbel', sku: 'KS-DUB', categoryId: 'kasten', name: 'Dubbele gereedschapskast', description: 'Ruime dubbele kast met deuren.', dimensions: '1200×1000×350 mm', price: 549, montagePrice: 100, compatibility: { ...medLg, maxLengthMm: 1300 }, possiblePositions: ['left'], recommendedForProfessions: ['elektricien','schrijnwerker','bouw'], relatedProductIds: ['ladenblok-5','led-premium'] }),
  P({ id: 'kast-hoog', sku: 'KS-HOOG', categoryId: 'kasten', name: 'Hoge kast full height', description: 'Full height kast. Alleen H2/H3.', dimensions: '1800×500×400 mm', price: 689, montagePrice: 120, compatibility: { categories: ['medium','large'], heightCodes: ['H2','H3'], maxHeightMm: 1900 }, possiblePositions: ['left'] }),
  P({ id: 'ladenblok-3', sku: 'LB-3', categoryId: 'ladenblokken', name: 'Ladenblok 3 laden', description: '3 diepe laden soft-close.', dimensions: '600×500×600 mm', price: 389, montagePrice: 70, compatibility: { ...medLg }, possiblePositions: ['any'], recommendedForProfessions: ['elektricien','loodgieter','technieker'], relatedProductIds: ['kast-links-basis'] }),
  P({ id: 'ladenblok-5', sku: 'LB-5', categoryId: 'ladenblokken', name: 'Ladenblok 5 laden', description: '5 laden verschillende hoogtes.', dimensions: '600×500×900 mm', price: 529, montagePrice: 90, compatibility: { ...medLg }, possiblePositions: ['any'] }),
  P({ id: 'rek-open', sku: 'RK-OP', categoryId: 'rekken', name: 'Open rek systeem', description: 'Modulair open rek.', price: 219, montagePrice: 50, possiblePositions: ['any'] }),
  P({ id: 'gereedschap-set', sku: 'GH-SET', categoryId: 'gereedschapshouders', name: 'Gereedschapshouder set', description: 'Houders voor boormachine e.d.', price: 89, montagePrice: 30, possiblePositions: ['any'], recommendedForProfessions: ['elektricien','schrijnwerker'] }),
  P({ id: 'werkbank-vouw', sku: 'WB-VOUW', categoryId: 'werkbanken', name: 'Vouwbare werkbank', description: 'Vouwbare werkbank 1200×600.', price: 349, montagePrice: 60, compatibility: { ...medLg }, possiblePositions: ['any'] }),
  P({ id: 'sjorrail-set', sku: 'SJ-2', categoryId: 'sjorrails', name: 'Sjorrail set (2x)', description: 'Twee stevige sjorrails.', dimensions: '2×2000 mm', price: 159, montagePrice: 70, possiblePositions: ['any'], recommendedForProfessions: ['elektricien','bouw','koerier','hvac'], relatedProductIds: ['vloer-multiplex-12'] }),
  P({ id: 'dakdrager-alu', sku: 'DD-ALU', categoryId: 'dakdragers', name: 'Aluminium dakdrager', description: 'Lichtgewicht, 3 dwarsbalken.', price: 690, montagePrice: 150, compatibility: { ...medLg }, possiblePositions: ['roof'], recommendedForProfessions: ['bouw','schilder','hvac'], relatedProductIds: ['ladderhouder'] }),
  P({ id: 'dakdrager-steel', sku: 'DD-ST', categoryId: 'dakdragers', name: 'Stalen dakdrager heavy duty', description: 'Extra sterke stalen dakdrager.', price: 490, montagePrice: 140, compatibility: { ...lgOnly }, possiblePositions: ['roof'] }),
  P({ id: 'ladderhouder', sku: 'LH-1', categoryId: 'ladderhouders', name: 'Ladderhouder set', description: 'Veilige ladderhouder op het dak.', price: 189, montagePrice: 60, compatibility: { ...medLg }, possiblePositions: ['roof'], relatedProductIds: ['dakdrager-alu'] }),
  P({ id: 'led-basis', sku: 'LED-BAS', categoryId: 'verlichting', name: 'LED laadruimte verlichting', description: 'Heldere LED-strips, set van 4.', price: 120, montagePrice: 40, possiblePositions: ['any'], recommendedForProfessions: ['elektricien','loodgieter','hvac','technieker','installateur'], relatedProductIds: ['stopcontact-set'] }),
  P({ id: 'led-premium', sku: 'LED-PRE', categoryId: 'verlichting', name: 'Premium LED met sensor', description: 'LED met bewegingssensor.', price: 249, montagePrice: 60, compatibility: { ...medLg }, possiblePositions: ['any'] }),
  P({ id: 'stopcontact-set', sku: 'EL-230', categoryId: 'elektriciteit', name: 'Stopcontact set 230V', description: '2×230V met beveiliging.', price: 149, montagePrice: 80, possiblePositions: ['any'], relatedProductIds: ['omvormer-1000'] }),
  P({ id: 'omvormer-1000', sku: 'OM-1000', categoryId: 'omvormers', name: 'Omvormer 1000W pure sine', description: 'Zuivere sinus 1000W.', price: 289, montagePrice: 90, compatibility: { ...medLg }, possiblePositions: ['any'] }),
  P({ id: 'omvormer-2000', sku: 'OM-2000', categoryId: 'omvormers', name: 'Omvormer 2000W pure sine', description: 'Krachtige 2000W.', price: 449, montagePrice: 100, compatibility: { ...lgOnly }, possiblePositions: ['any'] }),
  P({ id: 'alarm', sku: 'BV-AL', categoryId: 'beveiliging', name: 'Alarmsysteem laadruimte', description: 'Alarm met bewegingssensor.', price: 199, montagePrice: 80, possiblePositions: ['any'] }),
  P({ id: 'haak-set', sku: 'AC-HK', categoryId: 'accessoires', name: 'Haak en ophang set', description: 'Set van 10 haken.', price: 49, montagePrice: 20, possiblePositions: ['any'] }),
  P({ id: 'montage-compleet', sku: 'MT-FULL', categoryId: 'montage', name: 'Volledige montage door professional', description: 'Professionele montage van geselecteerde producten.', price: 0, montagePrice: 450, montageHours: 6, montageRequired: true, possiblePositions: ['any'], tags: ['montage'] }),
];

export const packages: Package[] = [
  { id: 'elektricien-start', name: 'ELEKTRICIEN START', description: 'Solide basisinrichting voor de elektricien.', price: 1499, items: [{ productId: 'vloer-multiplex-12', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'sjorrail-set', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['elektricien'], badge: 'Populair bij elektriciens', isDemo: true },
  { id: 'elektricien-pro', name: 'ELEKTRICIEN PRO', description: 'Uitgebreide inrichting met ladenblok.', price: 2499, items: [{ productId: 'vloer-multiplex-15', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'kast-rechts-basis', quantity: 1 }, { productId: 'ladenblok-3', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'sjorrail-set', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['elektricien', 'installateur'], badge: 'Meest gekozen', isDemo: true },
  { id: 'loodgieter-start', name: 'LOODGIETER START', description: 'Praktische startconfiguratie.', price: 1599, items: [{ productId: 'vloer-multiplex-12', quantity: 1 }, { productId: 'wand-hout', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['loodgieter'], badge: 'Populair bij loodgieters', isDemo: true },
  { id: 'loodgieter-pro', name: 'LOODGIETER PRO', description: 'Ruime inrichting met laden.', price: 2599, items: [{ productId: 'vloer-multiplex-15', quantity: 1 }, { productId: 'wand-kunststof', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'ladenblok-3', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'sjorrail-set', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['loodgieter'], isDemo: true },
  { id: 'hvac-tech', name: 'HVAC TECHNICUS', description: 'Stevige vloer, kasten en dakdrager.', price: 2899, items: [{ productId: 'vloer-multiplex-15', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'kast-rechts-basis', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'dakdrager-alu', quantity: 1 }, { productId: 'sjorrail-set', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['hvac'], badge: 'Beste keuze voor servicewagens', isDemo: true },
  { id: 'service-tech', name: 'SERVICE TECHNICUS', description: 'Compacte complete inrichting.', price: 2199, items: [{ productId: 'vloer-multiplex-12', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'ladenblok-3', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'gereedschap-set', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['technieker', 'installateur'], isDemo: true },
  { id: 'schrijnwerker', name: 'SCHRIJNWERKER', description: 'Maximale opbergruimte en stevige vloer.', price: 3199, items: [{ productId: 'vloer-multiplex-15', quantity: 1 }, { productId: 'kast-dubbel', quantity: 1 }, { productId: 'kast-rechts-basis', quantity: 1 }, { productId: 'ladenblok-5', quantity: 1 }, { productId: 'led-premium', quantity: 1 }, { productId: 'sjorrail-set', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['schrijnwerker', 'bouw'], isDemo: true },
  { id: 'starter-algemeen', name: 'STARTER', description: 'De perfecte basisinrichting.', price: 1499, items: [{ productId: 'vloer-multiplex-12', quantity: 1 }, { productId: 'wand-hout', quantity: 1 }, { productId: 'kast-links-basis', quantity: 1 }, { productId: 'led-basis', quantity: 1 }, { productId: 'montage-compleet', quantity: 1 }], popularFor: ['koerier', 'andere'], isDemo: true },
];

export const professions = [
  { id: 'elektricien', name: 'Elektricien', icon: '⚡' },
  { id: 'loodgieter', name: 'Loodgieter', icon: '🔧' },
  { id: 'hvac', name: 'HVAC / Koeltechniek', icon: '❄️' },
  { id: 'schrijnwerker', name: 'Schrijnwerker', icon: '🪚' },
  { id: 'bouw', name: 'Bouw', icon: '🏗️' },
  { id: 'schilder', name: 'Schilder', icon: '🎨' },
  { id: 'installateur', name: 'Installateur', icon: '🔩' },
  { id: 'technieker', name: 'Servicetechnieker', icon: '🛠️' },
  { id: 'koerier', name: 'Koerier', icon: '📦' },
  { id: 'andere', name: 'Andere', icon: '🚛' },
];

export const budgetBands = [
  { id: 'under_1500' as const, label: 'Tot €1.500', max: 1500 },
  { id: '1500_2500' as const, label: '€1.500 – €2.500', max: 2500 },
  { id: '2500_4000' as const, label: '€2.500 – €4.000', max: 4000 },
  { id: 'over_4000' as const, label: '€4.000+', max: 99999 },
];
