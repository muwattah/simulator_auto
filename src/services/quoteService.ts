/**
 * Quote request architecture — Fase 5.2
 *
 * - Unieke configurationId (RS-YYYY-XXXXXXXX)
 * - Gestructureerde QuotePayload
 * - Human-readable samenvatting
 * - Abstracte submitQuoteRequest (geen secrets in frontend)
 *
 * MAIL DELIVERY: NOT IMPLEMENTED
 * GitHub Pages is static. Echte e-mail vereist een veilige server-side endpoint.
 */

import type {
  ConfigurationSnapshot,
  Customer,
  DetailingConfiguration,
  PricingResult,
} from '../types';
import { getProduct, getVehicleCategory } from '../data/detailingCatalog';
import { company } from '../config/company';

/** Unieke configuratiereferentie: RS-2026-A1B2C3D4 */
export function generateConfigurationId(): string {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(8);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 8; i++) suffix += chars[arr[i]! % chars.length];
  } else {
    for (let i = 0; i < 8; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RS-${year}-${suffix}`;
}

export interface QuoteCustomer {
  name: string;
  company?: string;
  email: string;
  phone: string;
  location?: string;
  remarks?: string;
}

export interface QuotePayload {
  configurationId: string;
  createdAt: string;
  source: 'web-configurator';
  company: {
    name: string;
    website: string;
  };
  customer: QuoteCustomer;
  vehicle: {
    categoryId: string | null;
    categoryName: string | null;
    cabType: string | null;
  };
  systems: {
    tankId: string | null;
    tankName: string | null;
    floatValve: boolean | null;
    pressureWasherId: string | null;
    pressureWasherName: string | null;
    pressureReelId: string | null;
    pressureReelName: string | null;
    compressorId: string | null;
    compressorName: string | null;
    airReelId: string | null;
    airReelName: string | null;
    generatorId: string | null;
    generatorName: string | null;
    powerReelId: string | null;
    powerReelName: string | null;
    vacuumId: string | null;
    vacuumName: string | null;
  };
  installation: {
    liningId: string | null;
    liningName: string | null;
    frameComboId: string | null;
    frameComboName: string | null;
    bottleHolder: boolean;
    bucketHolder: boolean;
    installationType: string | null;
  };
  extras: Array<{ id: string; name: string }>;
  specialRequests: string;
  pricing: {
    status: 'pending' | 'partial' | 'known';
    knownSubtotal: number;
    pendingCount: number;
    pendingNames: string[];
  };
  estimatedWaterWeightKg: number;
  layoutWarnings: string[];
  privacyConsent: boolean;
}

function productName(id: string | null): string | null {
  if (!id) return null;
  const p = getProduct(id);
  return p?.name ?? id;
}

export function buildQuotePayload(params: {
  configurationId: string;
  createdAt: string;
  customer: QuoteCustomer;
  configuration: DetailingConfiguration;
  pricing: PricingResult;
  estimatedWaterWeightKg: number;
  layoutWarnings: string[];
  privacyConsent: boolean;
}): QuotePayload {
  const c = params.configuration;
  const cat = getVehicleCategory(c.vehicleCategory);

  let pricingStatus: QuotePayload['pricing']['status'] = 'known';
  if (params.pricing.pendingCount > 0 && params.pricing.knownSubtotal === 0) pricingStatus = 'pending';
  else if (params.pricing.pendingCount > 0) pricingStatus = 'partial';

  return {
    configurationId: params.configurationId,
    createdAt: params.createdAt,
    source: 'web-configurator',
    company: {
      name: company.name,
      website: company.website,
    },
    customer: params.customer,
    vehicle: {
      categoryId: c.vehicleCategory,
      categoryName: cat?.name ?? null,
      cabType: c.cabType,
    },
    systems: {
      tankId: c.tankId,
      tankName: productName(c.tankId),
      floatValve: c.floatValve,
      pressureWasherId: c.pressureWasherId,
      pressureWasherName: productName(c.pressureWasherId),
      pressureReelId: c.pressureReelId,
      pressureReelName: productName(c.pressureReelId),
      compressorId: c.compressorId,
      compressorName: productName(c.compressorId),
      airReelId: c.airReelId,
      airReelName: productName(c.airReelId),
      generatorId: c.generatorId,
      generatorName: productName(c.generatorId),
      powerReelId: c.powerReelId,
      powerReelName: productName(c.powerReelId),
      vacuumId: c.vacuumId,
      vacuumName: productName(c.vacuumId),
    },
    installation: {
      liningId: c.liningId,
      liningName: productName(c.liningId),
      frameComboId: c.frameComboId,
      frameComboName: productName(c.frameComboId),
      bottleHolder: c.bottleHolder,
      bucketHolder: c.bucketHolder,
      installationType: c.installationType,
    },
    extras: c.extraIds.map((id) => ({ id, name: productName(id) ?? id })),
    specialRequests: c.specialRequests || '',
    pricing: {
      status: pricingStatus,
      knownSubtotal: params.pricing.knownSubtotal,
      pendingCount: params.pricing.pendingCount,
      pendingNames: params.pricing.pendingNames,
    },
    estimatedWaterWeightKg: params.estimatedWaterWeightKg,
    layoutWarnings: params.layoutWarnings,
    privacyConsent: params.privacyConsent,
  };
}

/** Menselijke samenvatting van de offerteaanvraag */
export function formatQuoteSummary(payload: QuotePayload): string {
  const lines: string[] = [];
  lines.push(`${company.name.toUpperCase()} — OFFERTEAANVRAAG`);
  lines.push('');
  lines.push('Configuratie:');
  lines.push(`- Referentie: ${payload.configurationId}`);
  lines.push(`- Datum/tijd: ${new Date(payload.createdAt).toLocaleString('nl-BE')}`);
  lines.push('');
  lines.push('Klant:');
  lines.push(`- Naam: ${payload.customer.name}`);
  if (payload.customer.company) lines.push(`- Bedrijf: ${payload.customer.company}`);
  lines.push(`- E-mail: ${payload.customer.email}`);
  lines.push(`- Telefoon: ${payload.customer.phone}`);
  if (payload.customer.location) lines.push(`- Locatie: ${payload.customer.location}`);
  lines.push('');
  lines.push('Voertuig:');
  lines.push(`- Type: ${payload.vehicle.categoryName ?? '—'}`);
  lines.push(`- Cabine: ${payload.vehicle.cabType ?? '—'}`);
  lines.push('');
  lines.push('Water:');
  lines.push(`- Tank: ${payload.systems.tankName ?? '—'}`);
  lines.push(`- Vlotter: ${payload.systems.floatValve === true ? 'Ja' : payload.systems.floatValve === false ? 'Nee' : '—'}`);
  lines.push(`- Geschat watergewicht: ~${Math.round(payload.estimatedWaterWeightKg)} kg (indicatie: 1 L ≈ 1 kg)`);
  lines.push('');
  lines.push('Hogedruk:');
  lines.push(`- Machine: ${payload.systems.pressureWasherName ?? '—'}`);
  lines.push(`- Haspel: ${payload.systems.pressureReelName ?? '—'}`);
  lines.push('');
  lines.push('Lucht:');
  lines.push(`- Compressor: ${payload.systems.compressorName ?? '—'}`);
  lines.push(`- Luchthaspel: ${payload.systems.airReelName ?? '—'}`);
  lines.push('');
  lines.push('Stroom:');
  lines.push(`- Generator: ${payload.systems.generatorName ?? '—'}`);
  lines.push(`- Stroomhaspel: ${payload.systems.powerReelName ?? '—'}`);
  lines.push('');
  lines.push('Stofzuiger:');
  lines.push(`- Systeem: ${payload.systems.vacuumName ?? '—'}`);
  lines.push('');
  lines.push('Afwerking:');
  lines.push(`- Bekleding: ${payload.installation.liningName ?? '—'}`);
  lines.push(`- Bottle holder: ${payload.installation.bottleHolder ? 'Ja' : 'Nee'}`);
  lines.push(`- Bucket holder: ${payload.installation.bucketHolder ? 'Ja' : 'Nee'}`);
  lines.push(`- Framecombinatie: ${payload.installation.frameComboName ?? '—'}`);
  lines.push('');
  lines.push('Installatie:');
  lines.push(`- Keuze: ${payload.installation.installationType ?? '—'}`);
  lines.push('');
  if (payload.extras.length > 0) {
    lines.push("Extra's:");
    payload.extras.forEach((e) => lines.push(`- ${e.name}`));
    lines.push('');
  }
  if (payload.specialRequests.trim()) {
    lines.push('Speciale wensen:');
    lines.push(payload.specialRequests.trim());
    lines.push('');
  }
  lines.push('Prijsstatus:');
  if (payload.pricing.status === 'pending') {
    lines.push('- Alle geselecteerde onderdelen: prijs op aanvraag');
  } else if (payload.pricing.status === 'partial') {
    lines.push(`- Deels bekend · ${payload.pricing.pendingCount} item(s) op aanvraag`);
    if (payload.pricing.pendingNames.length) {
      lines.push(`- Pending: ${payload.pricing.pendingNames.join(', ')}`);
    }
  } else {
    lines.push('- Alle bekende prijzen beschikbaar (offerte op maat volgt)');
  }
  lines.push('');
  lines.push(`Bron: ${payload.source}`);
  lines.push(`Privacy-consent: ${payload.privacyConsent ? 'Ja' : 'Nee'}`);
  return lines.join('\n');
}

export type SubmitQuoteResult =
  | { ok: true; mode: 'local'; configurationId: string; message: string }
  | { ok: false; error: string };

/**
 * Abstracte submit-laag.
 * Momenteel: lokale opslag + download/copy van de payload.
 * GEEN echte e-mailverzending (geen backend / secrets in frontend).
 *
 * Toekomst: POST naar veilige server-side endpoint.
 */
export async function submitQuoteRequest(payload: QuotePayload): Promise<SubmitQuoteResult> {
  try {
    const key = 'rs-quote-requests';
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as QuotePayload[];
    existing.unshift(payload);
    localStorage.setItem(key, JSON.stringify(existing.slice(0, 20)));
  } catch {
    // ignore storage errors
  }

  return {
    ok: true,
    mode: 'local',
    configurationId: payload.configurationId,
    message:
      'Uw aanvraag is lokaal vastgelegd met referentie ' +
      payload.configurationId +
      '. Er is nog geen automatische e-mailverzending. Neem contact op via WhatsApp of telefoon, of stuur de samenvatting handmatig.',
  };
}

export function snapshotFromPayload(payload: QuotePayload): ConfigurationSnapshot {
  return {
    configurationId: payload.configurationId,
    createdAt: payload.createdAt,
    vehicleCategory: payload.vehicle.categoryId as ConfigurationSnapshot['vehicleCategory'],
    cabType: payload.vehicle.cabType as ConfigurationSnapshot['cabType'],
    tank: payload.systems.tankId,
    floatValve: payload.systems.floatValve,
    pressureWasher: payload.systems.pressureWasherId,
    pressureReel: payload.systems.pressureReelId,
    compressor: payload.systems.compressorId,
    airReel: payload.systems.airReelId,
    generator: payload.systems.generatorId,
    powerReel: payload.systems.powerReelId,
    vacuum: payload.systems.vacuumId,
    lining: payload.installation.liningId,
    frameCombo: payload.installation.frameComboId,
    extras: payload.extras.map((e) => e.id),
    bottleHolder: payload.installation.bottleHolder,
    bucketHolder: payload.installation.bucketHolder,
    installationType: payload.installation.installationType as ConfigurationSnapshot['installationType'],
    specialRequests: payload.specialRequests,
    knownSubtotal: payload.pricing.knownSubtotal,
    pendingPriceItems: payload.pricing.pendingNames,
    estimatedWaterWeightKg: payload.estimatedWaterWeightKg,
    layoutWarnings: payload.layoutWarnings,
  };
}

export function toQuoteCustomer(c: Customer): QuoteCustomer {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.firstName || c.lastName;
  return {
    name,
    company: c.company,
    email: c.email,
    phone: c.phone,
    location: c.postcode || undefined,
    remarks: c.remarks,
  };
}
