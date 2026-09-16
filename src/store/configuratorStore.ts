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
} from '../types';
import { calculatePricing } from '../lib/pricing';
import { computeLayout, estimatedWaterWeight, getCargoSpace } from '../lib/layoutEngine';
import { STEP_ORDER, getVehicleCategory, getProduct } from '../data/detailingCatalog';

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
  setCabType: (c: CabType) => void;
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
  getPricing: () => ReturnType<typeof calculatePricing>;
  getLayout: () => ReturnType<typeof computeLayout>;
  getCargoSpace: () => ReturnType<typeof getCargoSpace>;
  getVehicleLabel: () => string;
  buildSnapshot: () => ConfigurationSnapshot;
  submitQuote: (customer: Customer) => Quote;
  isStepComplete: (step: ConfigStep) => boolean;
}

const initialConfig: DetailingConfiguration = {
  vehicleCategory: null,
  cabType: null,
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
        if (idx < STEP_ORDER.length - 1) set({ step: STEP_ORDER[idx + 1] });
      },

      prevStep: () => {
        const idx = STEP_ORDER.indexOf(get().step);
        if (idx > 0) set({ step: STEP_ORDER[idx - 1] });
      },

      markVisited: (step) =>
        set((s) => ({
          visitedSteps: s.visitedSteps.includes(step) ? s.visitedSteps : [...s.visitedSteps, step],
        })),

      setVehicleCategory: (c) =>
        set((s) => ({
          configuration: {
            ...s.configuration,
            vehicleCategory: c,
            cabType: c === 'trailer' ? 'single' : s.configuration.cabType,
          },
        })),

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

      resetConfiguration: () =>
        set({ configuration: initialConfig, step: 'vehicle', selectedProductId: null, visitedSteps: [] }),

      getPricing: () => calculatePricing(get().configuration),
      getLayout: () => computeLayout(get().configuration),
      getCargoSpace: () =>
        getCargoSpace(get().configuration.vehicleCategory, get().configuration.cabType),

      getVehicleLabel: () => {
        const { vehicleCategory, cabType } = get().configuration;
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
        return `${cat.name}${cab}`;
      },

      buildSnapshot: () => {
        const c = get().configuration;
        const pricing = calculatePricing(c);
        const layout = computeLayout(c);
        return {
          configurationId: `CFG-${Date.now()}`,
          createdAt: new Date().toISOString(),
          vehicleCategory: c.vehicleCategory,
          cabType: c.cabType,
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

      submitQuote: (customer) => {
        const snapshot = get().buildSnapshot();
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
