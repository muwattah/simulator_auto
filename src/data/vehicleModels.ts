import type { VehicleCategory } from '../types';

/**
 * Named vehicles are a UI starting point. Their generic 3D silhouette and cargo
 * measurements are approximate and must not be mistaken for manufacturer CAD data.
 * Specific model GLBs and certified dimensions can be added when supplied.
 */
export interface VehicleModelOption {
  id: string;
  category: VehicleCategory;
  make: string;
  model: string;
  display: string;
}

export const vehicleModels: VehicleModelOption[] = [
  { id: 'vw-caddy', category: 'small', make: 'Volkswagen', model: 'Caddy', display: 'Volkswagen Caddy' },
  { id: 'citroen-berlingo', category: 'small', make: 'Citroën', model: 'Berlingo', display: 'Citroën Berlingo' },
  { id: 'peugeot-partner', category: 'small', make: 'Peugeot', model: 'Partner', display: 'Peugeot Partner' },
  { id: 'opel-combo', category: 'small', make: 'Opel', model: 'Combo', display: 'Opel Combo' },
  { id: 'mercedes-vito', category: 'medium', make: 'Mercedes-Benz', model: 'Vito', display: 'Mercedes-Benz Vito' },
  { id: 'vw-transporter', category: 'medium', make: 'Volkswagen', model: 'Transporter', display: 'Volkswagen Transporter' },
  { id: 'ford-transit-custom', category: 'medium', make: 'Ford', model: 'Transit Custom', display: 'Ford Transit Custom' },
  { id: 'renault-trafic', category: 'medium', make: 'Renault', model: 'Trafic', display: 'Renault Trafic' },
  { id: 'peugeot-expert', category: 'medium', make: 'Peugeot', model: 'Expert', display: 'Peugeot Expert' },
  { id: 'mercedes-sprinter', category: 'large', make: 'Mercedes-Benz', model: 'Sprinter', display: 'Mercedes-Benz Sprinter' },
  { id: 'vw-crafter', category: 'large', make: 'Volkswagen', model: 'Crafter', display: 'Volkswagen Crafter' },
  { id: 'ford-transit', category: 'large', make: 'Ford', model: 'Transit', display: 'Ford Transit' },
  { id: 'renault-master', category: 'large', make: 'Renault', model: 'Master', display: 'Renault Master' },
  { id: 'fiat-ducato', category: 'large', make: 'Fiat', model: 'Ducato', display: 'Fiat Ducato' },
  { id: 'gesloten-aanhanger', category: 'trailer', make: 'Aanhangwagen', model: 'Gesloten aanhangwagen', display: 'Gesloten aanhangwagen' },
];

export function getVehicleModel(id?: string | null): VehicleModelOption | undefined {
  return vehicleModels.find(v => v.id === id);
}

export function defaultVehicleModel(category: VehicleCategory): VehicleModelOption {
  return vehicleModels.find(v => v.category === category)!;
}
