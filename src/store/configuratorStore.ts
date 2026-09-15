import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Configuration, ConfigurationItem, Customer, Quote, RecommendationResult } from '../types';
import { calculatePricing, toPriceSnapshot } from '../lib/pricing';
import { packages, vehicleVariants, vehicles, professions } from '../data/demoData';
import { recommend, recommendForProfession } from '../lib/recommendations';

interface ConfiguratorState {
  step: 'vehicle' | 'profession' | 'help' | 'recommendation' | 'configurator' | 'quote';
  configuration: Configuration;
  selectedCategoryId: string | null;
  quotes: Quote[];
  lastRecommendation: RecommendationResult | null;
  helpAnswers: { professionId: string | null; budgetBand: string | null };
  setStep: (step: ConfiguratorState['step']) => void;
  selectVehicleVariant: (variantId: string) => void;
  selectProfession: (professionId: string | null) => void;
  selectPackage: (packageId: string | null) => void;
  addProduct: (productId: string, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setIncludeBTW: (include: boolean) => void;
  setSelectedCategory: (categoryId: string | null) => void;
  resetConfiguration: () => void;
  applyProfessionRecommendation: (professionId: string) => void;
  runHelpWizard: (professionId: string, budgetBand: string) => void;
  acceptRecommendation: () => void;
  submitQuote: (customer: Customer) => Quote;
  getPricing: () => ReturnType<typeof calculatePricing>;
  getVehicleLabel: () => string;
  getProfessionLabel: () => string;
}

const initialConfig: Configuration = {
  vehicleVariantId: null,
  items: [],
  packageId: null,
  profession: null,
  budgetBand: null,
  includeBTW: false,
};

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      step: 'vehicle',
      configuration: initialConfig,
      selectedCategoryId: null,
      quotes: [],
      lastRecommendation: null,
      helpAnswers: { professionId: null, budgetBand: null },

      setStep: (step) => set({ step }),

      selectVehicleVariant: (variantId) => {
        set((state) => ({
          configuration: { ...state.configuration, vehicleVariantId: variantId },
          step: 'profession',
        }));
      },

      selectProfession: (professionId) => {
        set((state) => ({
          configuration: { ...state.configuration, profession: professionId },
          step: 'configurator',
        }));
      },

      selectPackage: (packageId) => {
        set((state) => {
          let newItems = state.configuration.items;
          if (packageId) {
            const pkg = packages.find((p) => p.id === packageId);
            if (pkg) {
              newItems = pkg.items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
                includeMontage: true,
              }));
            }
          }
          return {
            configuration: { ...state.configuration, packageId, items: newItems },
          };
        });
      },

      addProduct: (productId, quantity = 1) => {
        set((state) => {
          const existing = state.configuration.items.find((i) => i.productId === productId);
          let newItems: ConfigurationItem[];
          if (existing) {
            newItems = state.configuration.items.map((i) =>
              i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newItems = [...state.configuration.items, { productId, quantity, includeMontage: true }];
          }
          return { configuration: { ...state.configuration, items: newItems } };
        });
      },

      removeProduct: (productId) => {
        set((state) => {
          const pkg = state.configuration.packageId
            ? packages.find((p) => p.id === state.configuration.packageId)
            : null;
          const isPackageItem = pkg?.items.some((i) => i.productId === productId);
          return {
            configuration: {
              ...state.configuration,
              items: state.configuration.items.filter((i) => i.productId !== productId),
              packageId: isPackageItem ? null : state.configuration.packageId,
            },
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeProduct(productId);
          return;
        }
        set((state) => ({
          configuration: {
            ...state.configuration,
            items: state.configuration.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          },
        }));
      },

      setIncludeBTW: (include) => {
        set((state) => ({
          configuration: { ...state.configuration, includeBTW: include },
        }));
      },

      setSelectedCategory: (categoryId) => set({ selectedCategoryId: categoryId }),

      resetConfiguration: () =>
        set({
          configuration: initialConfig,
          step: 'vehicle',
          selectedCategoryId: null,
          lastRecommendation: null,
          helpAnswers: { professionId: null, budgetBand: null },
        }),

      applyProfessionRecommendation: (professionId) => {
        const variantId = get().configuration.vehicleVariantId;
        if (!variantId) {
          set((state) => ({
            configuration: { ...state.configuration, profession: professionId },
            step: 'configurator',
          }));
          return;
        }
        const rec = recommendForProfession(professionId, variantId);
        const pkg = packages.find((p) => p.id === rec.packageId);
        const items = pkg
          ? pkg.items.map((i) => ({ productId: i.productId, quantity: i.quantity, includeMontage: true as const }))
          : rec.productIds.map((id) => ({ productId: id, quantity: 1, includeMontage: true as const }));
        set((state) => ({
          configuration: {
            ...state.configuration,
            profession: professionId,
            packageId: rec.packageId ?? null,
            items,
          },
          lastRecommendation: rec,
          step: 'recommendation',
        }));
      },

      runHelpWizard: (professionId, budgetBand) => {
        const variantId = get().configuration.vehicleVariantId;
        if (!variantId) return;
        const rec = recommend({
          vehicleVariantId: variantId,
          professionId,
          budgetBand: budgetBand as 'under_1500' | '1500_2500' | '2500_4000' | 'over_4000',
        });
        set({
          helpAnswers: { professionId, budgetBand },
          lastRecommendation: rec,
          configuration: { ...get().configuration, profession: professionId, budgetBand },
          step: 'recommendation',
        });
      },

      acceptRecommendation: () => {
        const rec = get().lastRecommendation;
        if (!rec) {
          set({ step: 'configurator' });
          return;
        }
        const pkg = packages.find((p) => p.id === rec.packageId);
        const items = pkg
          ? pkg.items.map((i) => ({ productId: i.productId, quantity: i.quantity, includeMontage: true as const }))
          : rec.productIds.map((id) => ({ productId: id, quantity: 1, includeMontage: true as const }));
        set((state) => ({
          configuration: { ...state.configuration, packageId: rec.packageId ?? null, items },
          step: 'configurator',
        }));
      },

      submitQuote: (customer) => {
        const state = get();
        const pricing = calculatePricing(state.configuration);
        const snapshot = toPriceSnapshot(pricing);
        const quote: Quote = {
          id: `Q-${Date.now()}`,
          configurationId: `CFG-${Date.now()}`,
          createdAt: new Date().toISOString(),
          customer,
          configuration: { ...state.configuration },
          vehicleLabel: state.getVehicleLabel(),
          professionLabel: state.getProfessionLabel(),
          priceSnapshot: snapshot,
          status: 'new',
          storage: 'local',
        };
        set((s) => ({ quotes: [quote, ...s.quotes] }));
        return quote;
      },

      getPricing: () => calculatePricing(get().configuration),

      getVehicleLabel: () => {
        const { vehicleVariantId } = get().configuration;
        if (!vehicleVariantId) return 'Nog niet gekozen';
        const variant = vehicleVariants.find((v) => v.id === vehicleVariantId);
        if (!variant) return 'Onbekend';
        const vehicle = vehicles.find((v) => v.id === variant.vehicleId);
        return `${vehicle?.brand || ''} ${vehicle?.model || ''} ${variant.name}`.trim();
      },

      getProfessionLabel: () => {
        const id = get().configuration.profession;
        if (!id) return '';
        return professions.find((p) => p.id === id)?.name ?? id;
      },
    }),
    {
      name: 'bedrijfswagen-configurator-v2',
      partialize: (state) => ({
        configuration: state.configuration,
        quotes: state.quotes,
      }),
    }
  )
);
