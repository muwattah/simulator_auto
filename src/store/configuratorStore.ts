import { demoConfiguration } from '../data/demoConfiguration';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConfigStep,
  DetailingConfiguration,
  Quote,
  Customer,
  ConfigurationSnapshot,
  VehicleCategory,
  CabType,
  InstallationType,
  VehicleLength,
  VehicleRoof,
} from '../types';
import { calculatePricing } from '../lib/pricing';
import { computeLayout, estimatedWaterWeight, getCargoSpace } from '../lib/layoutEngine';
import { STEP_ORDER, getVehicleCategory, getProduct } from '../data/detailingCatalog';
import { generateConfigurationId } from '../services/quoteService';
import { defaultVehicleModel, getVehicleModel } from '../data/vehicleModels';

interface State {
  step: ConfigStep;
  configuration: DetailingConfiguration;
  quotes: Quote[];
  selectedProductId: string | null;
  visitedSteps: ConfigStep[];
  setStep: (step: ConfigStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  markVisited: (step: ConfigStep) => void;
  setVehicleCategory: (c: VehicleCategory) => void;
  setVehicleModel: (id: string) => void;
  setVehicleLength: (value: VehicleLength) => void;
  setVehicleRoof: (value: VehicleRoof) => void;
  setCabType: (c: CabType) => void;
  setAvailablePayload: (kg: number | null) => void;
  setTank: (id: string | null) => void;
  setFloatValve: (v: boolean | null) => void;
  setPressureWasher: (id: string | null) => void;
  setPressureReel: (id: string | null) => void;
  setCompressor: (id: string | null) => void;
  setAirReel: (id: string | null) => void;
  setGenerator: (id: string | null) => void;
  setPowerReel: (id: string | null) => void;
  setVacuum: (id: string | null) => void;
  setLining: (id: string | null) => void;
  setFrameCombo: (id: string | null) => void;
  toggleExtra: (id: string) => void;
  setBottleHolder: (v: boolean) => void;
  setBucketHolder: (v: boolean) => void;
  setInstallationType: (t: InstallationType) => void;
  setSpecialRequests: (t: string) => void;
  setSelectedProductId: (id: string | null) => void;
  removeProductById: (id: string) => void;
  resetConfiguration: () => void;
  loadDemo: () => void;
  getPricing: () => ReturnType<typeof calculatePricing>;
  getLayout: () => ReturnType<typeof computeLayout>;
  getCargoSpace: () => ReturnType<typeof getCargoSpace>;
  getVehicleLabel: () => string;
  buildSnapshot: () => ConfigurationSnapshot;
  submitQuote: (customer: Customer, snapshot?: ConfigurationSnapshot) => Quote;
  isStepComplete: (step: ConfigStep) => boolean;
}

const initialConfig: DetailingConfiguration = {
  vehicleCategory: null,
  cabType: null,
  vehicleModelId: null,
  vehicleLength: 'standard',
  vehicleRoof: 'standard',
  tankId: null,
  floatValve: null,
  pressureWasherId: null,
  pressureReelId: null,
  compressorId: null,
  airReelId: null,
  generatorId: null,
  powerReelId: null,
  vacuumId: null,
  liningId: null,
  frameComboId: null,
  extraIds: [],
  bottleHolder: false,
  bucketHolder: false,
  installationType: null,
  specialRequests: '',
  includeBTW: false,
};

export const useConfiguratorStore = create<State>()(
  persist(
    (set, get) => ({
      step: 'vehicle',
      configuration: initialConfig,
      quotes: [],
      selectedProductId: null,
      visitedSteps: [],

      setStep: (step) => set({ step }),

      nextStep: () => {
        const idx = STEP_ORDER.indexOf(get().step);
        const next = STEP_ORDER[idx + (get().configuration.vehicleCategory === 'trailer' && get().step === 'vehicle' ? 2 : 1)];
        if (next) set({ step: next });
      },

      prevStep: () => {
        const idx = STEP_ORDER.indexOf(get().step);
        const previous = STEP_ORDER[idx - (get().configuration.vehicleCategory === 'trailer' && get().step === 'tank' ? 2 : 1)];
        if (previous) set({ step: previous });
      },

      markVisited: (step) =>
        set((s) => ({
          visitedSteps: s.visitedSteps.includes(step) ? s.visitedSteps : [...s.visitedSteps, step],
        })),

      setVehicleCategory: (category) =>
        set((s) => {
          // Known category exclusions are enforced; exact model fitment remains indicative.
          const allowed = (id: string | null) => {
            if (!id) return true;
            const product = getProduct(id);
            return !product?.compatibility.vehicleCategories ||
              product.compatibility.vehicleCategories.includes(category);
          };
          const config = s.configuration;
          return {
            configuration: {
              ...config,
              vehicleCategory: category,
              vehicleModelId: defaultVehicleModel(category).id,
              vehicleLength: 'standard',
              vehicleRoof: 'standard',
              cabType: category === 'trailer' ? 'single' : config.cabType,
              tankId: allowed(config.tankId) ? config.tankId : null,
              floatValve: allowed(config.tankId) ? config.floatValve : null,
              compressorId: allowed(config.compressorId) ? config.compressorId : null,
              airReelId: allowed(config.compressorId) ? config.airReelId : null,
              generatorId: allowed(config.generatorId) ? config.generatorId : null,
              extraIds: config.extraIds.filter(id => allowed(id)),
            },
          };
        }),

      setVehicleModel: (id) => {
        const vehicle = getVehicleModel(id);
        if (!vehicle) return;
        set((s) => ({
          configuration: {
            ...s.configuration,
            vehicleCategory: vehicle.category,
            vehicleModelId: vehicle.id,
          },
        }));
      },
      setVehicleLength: (vehicleLength) => set(s => ({
        configuration: { ...s.configuration, vehicleLength },
      })),
      setVehicleRoof: (vehicleRoof) => set(s => ({
        configuration: { ...s.configuration, vehicleRoof },
      })),
      setAvailablePayload: (kg) => set(s => ({ configuration: { ...s.configuration, availablePayloadKg: kg != null && Number.isFinite(kg) && kg >= 0 ? kg : null } })),
      setCabType: (c) => set((s) => ({ configuration: { ...s.configuration, cabType: c } })),

      setTank: (id) =>
        set((s) => ({
          configuration: {
            ...s.configuration,
            tankId: id,
            floatValve: id ? s.configuration.floatValve : null,
          },
        })),

      setFloatValve: (v) => set((s) => ({ configuration: { ...s.configuration, floatValve: v } })),

      setPressureWasher: (id) => set((s) => ({ configuration: { ...s.configuration, pressureWasherId: id } })),
      setPressureReel: (id) => set((s) => ({ configuration: { ...s.configuration, pressureReelId: id } })),

      setCompressor: (id) =>
        set((s) => ({
          configuration: {
            ...s.configuration,
            compressorId: id,
            airReelId: id ? s.configuration.airReelId : null,
          },
        })),

      setAirReel: (id) => set((s) => ({ configuration: { ...s.configuration, airReelId: id } })),
      setGenerator: (id) => set((s) => ({ configuration: { ...s.configuration, generatorId: id } })),
      setPowerReel: (id) => set((s) => ({ configuration: { ...s.configuration, powerReelId: id } })),
      setVacuum: (id) => set((s) => ({ configuration: { ...s.configuration, vacuumId: id } })),
      setLining: (id) => set((s) => ({ configuration: { ...s.configuration, liningId: id } })),
      setFrameCombo: (id) => set((s) => ({ configuration: { ...s.configuration, frameComboId: id } })),

      toggleExtra: (id) =>
        set((s) => {
          const has = s.configuration.extraIds.includes(id);
          return {
            configuration: {
              ...s.configuration,
              extraIds: has
                ? s.configuration.extraIds.filter((x) => x !== id)
                : [...s.configuration.extraIds, id],
            },
          };
        }),

      setBottleHolder: (v) => set((s) => ({ configuration: { ...s.configuration, bottleHolder: v } })),
      setBucketHolder: (v) => set((s) => ({ configuration: { ...s.configuration, bucketHolder: v } })),
      setInstallationType: (t) => set((s) => ({ configuration: { ...s.configuration, installationType: t } })),
      setSpecialRequests: (t) => set((s) => ({ configuration: { ...s.configuration, specialRequests: t } })),
      setSelectedProductId: (id) => set({ selectedProductId: id }),

      removeProductById: (id) => {
        set((s) => {
          const c = { ...s.configuration };
          if (c.tankId === id) {
            c.tankId = null;
            c.floatValve = null;
          }
          if (c.pressureWasherId === id) c.pressureWasherId = null;
          if (c.pressureWasherId === 'pressure_both') {
            if (id === 'pressure_electric' || id === 'pressure_petrol') c.pressureWasherId = null;
          }
          if (c.pressureReelId === id) c.pressureReelId = null;
          if (c.compressorId === id) {
            c.compressorId = null;
            c.airReelId = null;
          }
          if (c.airReelId === id) c.airReelId = null;
          if (c.generatorId === id) c.generatorId = null;
          if (c.powerReelId === id) c.powerReelId = null;
          if (c.vacuumId === id) c.vacuumId = null;
          if (c.liningId === id) c.liningId = 'lining_none';
          if (c.frameComboId === id) c.frameComboId = null;
          if (id === 'bottle_holder') c.bottleHolder = false;
          if (id === 'bucket_holder') c.bucketHolder = false;
          c.extraIds = c.extraIds.filter((x) => x !== id);
          return { configuration: c, selectedProductId: null };
        });
      },

      loadDemo: () => set({ configuration: { ...demoConfiguration, extraIds: [] }, step: 'vehicle', selectedProductId: null, visitedSteps: [] }),

      resetConfiguration: () =>
        set({ configuration: initialConfig, step: 'vehicle', selectedProductId: null, visitedSteps: [] }),

      getPricing: () => calculatePricing(get().configuration),
      getLayout: () => computeLayout(get().configuration),
      getCargoSpace: () =>
        getCargoSpace(
          get().configuration.vehicleCategory, get().configuration.cabType,
          get().configuration.vehicleLength, get().configuration.vehicleRoof, get().configuration.vehicleModelId
        ),

      getVehicleLabel: () => {
        const { vehicleCategory, cabType, vehicleModelId, vehicleLength, vehicleRoof } = get().configuration;
        const cat = getVehicleCategory(vehicleCategory);
        if (!cat) return 'Nog geen voertuig';
        const cab =
          vehicleCategory === 'trailer'
            ? ''
            : cabType === 'double'
              ? ' · Dubbele cabine'
              : cabType === 'single'
                ? ' · Enkele cabine'
                : '';
        const selected = getVehicleModel(vehicleModelId);
        const model = selected?.category === vehicleCategory ? selected.display : cat.name;
        const length = vehicleLength === 'long' ? ' · Lange wielbasis' : ' · Standaard wielbasis';
        const roof = vehicleRoof === 'high' ? ' · Hoog dak' : '';
        return `${model}${cab}${length}${roof}`;
      },

      buildSnapshot: () => {
        const c = get().configuration;
        const pricing = calculatePricing(c);
        const layout = computeLayout(c);
        return {
          configurationId: generateConfigurationId(),
          createdAt: new Date().toISOString(),
          vehicleCategory: c.vehicleCategory,
          cabType: c.cabType,
          vehicleModelId: c.vehicleModelId ?? null,
          vehicleLength: c.vehicleLength ?? 'standard',
          vehicleRoof: c.vehicleRoof ?? 'standard',
          tank: c.tankId,
          floatValve: c.floatValve,
          pressureWasher: c.pressureWasherId,
          pressureReel: c.pressureReelId,
          compressor: c.compressorId,
          airReel: c.airReelId,
          generator: c.generatorId,
          powerReel: c.powerReelId,
          vacuum: c.vacuumId,
          lining: c.liningId,
          frameCombo: c.frameComboId,
          extras: c.extraIds,
          bottleHolder: c.bottleHolder,
          bucketHolder: c.bucketHolder,
          installationType: c.installationType,
          specialRequests: c.specialRequests,
          knownSubtotal: pricing.knownSubtotal,
          pendingPriceItems: pricing.pendingNames,
          estimatedWaterWeightKg: estimatedWaterWeight(c),
          layoutWarnings: layout.warnings,
        };
      },

      submitQuote: (customer, savedSnapshot) => {
        const snapshot = savedSnapshot ?? get().buildSnapshot();
        const quote: Quote = {
          id: `Q-${Date.now()}`,
          createdAt: new Date().toISOString(),
          customer,
          snapshot,
          status: 'new',
          storage: 'local',
        };
        set((s) => ({ quotes: [quote, ...s.quotes] }));
        return quote;
      },

      isStepComplete: (step) => {
        return get().visitedSteps.includes(step);
      },
    }),
    {
      name: 'detailing-configurator-v1',
      partialize: (s) => ({
        configuration: s.configuration,
        quotes: s.quotes,
        visitedSteps: s.visitedSteps,
      }),
    }
  )
);

void getProduct;
