import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Configuration, ConfigurationItem, Customer, Quote } from '../types';
import { calculatePricing } from '../lib/pricing';
import { products, packages, vehicleVariants, vehicles } from '../data/demoData';

interface ConfiguratorState {
  step: 'vehicle' | 'profession' | 'configurator' | 'quote';
  configuration: Configuration;
  selectedCategoryId: string | null;
  quotes: Quote[];
  
  // Actions
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
  submitQuote: (customer: Customer) => Quote;
  getPricing: () => ReturnType<typeof calculatePricing>;
  getVehicleLabel: () => string;
}

const initialConfig: Configuration = {
  vehicleVariantId: null,
  items: [],
  packageId: null,
  profession: null,
  includeBTW: true,
};

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      step: 'vehicle',
      configuration: initialConfig,
      selectedCategoryId: null,
      quotes: [],

      setStep: (step) => set({ step }),

      selectVehicleVariant: (variantId) => {
        set((state) => ({
          configuration: {
            ...state.configuration,
            vehicleVariantId: variantId,
          },
          step: 'profession',
        }));
      },

      selectProfession: (professionId) => {
        set((state) => ({
          configuration: {
            ...state.configuration,
            profession: professionId,
          },
          step: 'configurator',
        }));
      },

      selectPackage: (packageId) => {
        set((state) => {
          let newItems = state.configuration.items;
          if (packageId) {
            const pkg = packages.find(p => p.id === packageId);
            if (pkg) {
              newItems = pkg.items.map(i => ({ productId: i.productId, quantity: i.quantity }));
            }
          }
          return {
            configuration: {
              ...state.configuration,
              packageId,
              items: newItems,
            },
          };
        });
      },

      addProduct: (productId, quantity = 1) => {
        set((state) => {
          const existing = state.configuration.items.find(i => i.productId === productId);
          let newItems: ConfigurationItem[];
          if (existing) {
            newItems = state.configuration.items.map(i =>
              i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
            );
          } else {
            newItems = [...state.configuration.items, { productId, quantity }];
          }
          return {
            configuration: {
              ...state.configuration,
              items: newItems,
            },
          };
        });
      },

      removeProduct: (productId) => {
        set((state) => ({
          configuration: {
            ...state.configuration,
            items: state.configuration.items.filter(i => i.productId !== productId),
            packageId: state.configuration.packageId && 
              packages.find(p => p.id === state.configuration.packageId)?.items.some(i => i.productId === productId)
              ? null
              : state.configuration.packageId,
          },
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeProduct(productId);
          return;
        }
        set((state) => ({
          configuration: {
            ...state.configuration,
            items: state.configuration.items.map(i =>
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

      resetConfiguration: () => set({
        configuration: initialConfig,
        step: 'vehicle',
        selectedCategoryId: null,
      }),

      applyProfessionRecommendation: (professionId) => {
        const matchingPkg = packages.find(p => p.popularFor?.includes(professionId));
        if (matchingPkg) {
          get().selectPackage(matchingPkg.id);
        } else {
          const popularProducts = products.filter(p => p.popularFor?.includes(professionId));
          set((state) => ({
            configuration: {
              ...state.configuration,
              profession: professionId,
              items: popularProducts.slice(0, 4).map(p => ({ productId: p.id, quantity: 1 })),
              packageId: null,
            },
            step: 'configurator',
          }));
        }
      },

      submitQuote: (customer) => {
        const state = get();
        const pricing = calculatePricing(state.configuration);
        const quote: Quote = {
          id: `Q-${Date.now()}`,
          createdAt: new Date().toISOString(),
          customer,
          configuration: { ...state.configuration },
          vehicleLabel: state.getVehicleLabel(),
          itemsDetail: pricing.items.map(i => ({
            name: i.name,
            price: i.unitPrice,
            montage: i.montage,
            qty: i.qty,
          })),
          subtotal: pricing.subtotalExcl,
          montageTotal: pricing.montageTotal,
          btw: pricing.btwAmount,
          total: pricing.totalIncl,
          status: 'new',
        };
        set((s) => ({ quotes: [quote, ...s.quotes] }));
        return quote;
      },

      getPricing: () => calculatePricing(get().configuration),

      getVehicleLabel: () => {
        const { vehicleVariantId } = get().configuration;
        if (!vehicleVariantId) return 'Nog niet gekozen';
        const variant = vehicleVariants.find(v => v.id === vehicleVariantId);
        if (!variant) return 'Onbekend';
        const vehicle = vehicles.find(v => v.id === variant.vehicleId);
        return `${vehicle?.brand || ''} ${vehicle?.model || ''} ${variant.name}`.trim();
      },
    }),
    {
      name: 'bedrijfswagen-configurator',
      partialize: (state) => ({
        configuration: state.configuration,
        quotes: state.quotes,
      }),
    }
  )
);
