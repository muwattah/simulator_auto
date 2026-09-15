import { useState } from 'react';
import { categories, products, packages } from '../data/demoData';
import { useConfiguratorStore } from '../store/configuratorStore';
import { formatPrice, getCompatibleProducts } from '../lib/pricing';
import { Plus, Minus, Trash2, Package, ChevronRight, X, ShoppingCart } from 'lucide-react';
import VanVisualization from './VanVisualization';

export default function Configurator() {
  const {
    configuration,
    selectedCategoryId,
    setSelectedCategory,
    addProduct,
    removeProduct,
    updateQuantity,
    selectPackage,
    setIncludeBTW,
    setStep,
    getPricing,
    getVehicleLabel,
  } = useConfiguratorStore();

  const pricing = getPricing();
  const vehicleLabel = getVehicleLabel();
  const [showMobileCart, setShowMobileCart] = useState(false);

  const activeCategories = categories;
  const currentProducts = selectedCategoryId
    ? getCompatibleProducts(configuration.vehicleVariantId, selectedCategoryId)
    : [];

  const isInConfig = (productId: string) =>
    configuration.items.some((i) => i.productId === productId);

  const getQty = (productId: string) =>
    configuration.items.find((i) => i.productId === productId)?.quantity || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-industrial-500">Configuratie voor</p>
          <h2 className="text-xl font-bold text-industrial-900">{vehicleLabel}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep('profession')} className="btn-ghost text-sm">Beroep wijzigen</button>
          <button onClick={() => setStep('vehicle')} className="btn-ghost text-sm">Wagen wijzigen</button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-industrial-500 uppercase tracking-wider mb-3">Complete pakketten</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const isSelected = configuration.packageId === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => selectPackage(isSelected ? null : pkg.id)}
                className={`card p-5 text-left transition-all relative ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-200 shadow-md' : 'hover:border-brand-300 hover:shadow-md'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded">Geselecteerd</span>
                )}
                <p className="text-lg font-bold text-industrial-900">{pkg.name}</p>
                <p className="text-2xl font-bold text-brand-700 my-2">{formatPrice(pkg.price)}</p>
                <p className="text-sm text-industrial-600 mb-3">{pkg.description}</p>
                <ul className="text-xs text-industrial-500 space-y-1">
                  {pkg.items.slice(0, 4).map((item) => {
                    const p = products.find((pr) => pr.id === item.productId);
                    return <li key={item.productId}>• {p?.name || item.productId}</li>;
                  })}
                  {pkg.items.length > 4 && <li>• +{pkg.items.length - 4} meer</li>}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-industrial-900 mb-3 flex items-center gap-2">
              <Package size={18} /> Categorieën
            </h3>
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === selectedCategoryId ? null : cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategoryId === cat.id ? 'bg-brand-100 text-brand-800' : 'text-industrial-700 hover:bg-industrial-50'
                  }`}
                >
                  {cat.name}
                  <ChevronRight size={16} className={selectedCategoryId === cat.id ? 'rotate-90' : ''} />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-5 space-y-6">
          <div className="card p-4">
            <h3 className="font-semibold text-industrial-900 mb-3">Jouw laadruimte</h3>
            <VanVisualization items={configuration.items} />
          </div>

          {selectedCategoryId ? (
            <div>
              <h3 className="font-semibold text-industrial-900 mb-3">
                {categories.find((c) => c.id === selectedCategoryId)?.name}
              </h3>
              <div className="space-y-3">
                {currentProducts.map((product) => {
                  const inConfig = isInConfig(product.id);
                  const qty = getQty(product.id);
                  return (
                    <div key={product.id} className={`card p-4 transition-all ${inConfig ? 'border-brand-300 bg-brand-50/30' : ''}`}>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-industrial-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-industrial-900">{product.name}</h4>
                          <p className="text-sm text-industrial-600 mt-0.5 line-clamp-2">{product.description}</p>
                          {product.dimensions && <p className="text-xs text-industrial-400 mt-1">{product.dimensions}</p>}
                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="price-tag text-lg">{formatPrice(product.price)}</span>
                              {product.montagePrice > 0 && (
                                <span className="text-xs text-industrial-500 ml-2">+ {formatPrice(product.montagePrice)} montage</span>
                              )}
                            </div>
                            {inConfig ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(product.id, qty - 1)} className="p-1.5 rounded bg-industrial-100 hover:bg-industrial-200"><Minus size={16} /></button>
                                <span className="font-semibold w-6 text-center">{qty}</span>
                                <button onClick={() => updateQuantity(product.id, qty + 1)} className="p-1.5 rounded bg-industrial-100 hover:bg-industrial-200"><Plus size={16} /></button>
                                <button onClick={() => removeProduct(product.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 ml-1"><Trash2 size={16} /></button>
                              </div>
                            ) : (
                              <button onClick={() => addProduct(product.id)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1">
                                <Plus size={16} /> Toevoegen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {currentProducts.length === 0 && <p className="text-industrial-500 text-sm">Geen producten in deze categorie.</p>}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-industrial-500">
              <p>Selecteer een categorie om producten te bekijken</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-industrial-900 flex items-center gap-2">
                <ShoppingCart size={18} /> Jouw configuratie
              </h3>
              <div className="flex rounded-lg border border-industrial-200 overflow-hidden text-xs">
                <button onClick={() => setIncludeBTW(false)} className={`px-3 py-1.5 ${!configuration.includeBTW ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}>Excl. BTW</button>
                <button onClick={() => setIncludeBTW(true)} className={`px-3 py-1.5 ${configuration.includeBTW ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}>Incl. BTW</button>
              </div>
            </div>

            {pricing.items.length === 0 ? (
              <p className="text-sm text-industrial-500 py-6 text-center">Nog geen producten toegevoegd.</p>
            ) : (
              <ul className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {pricing.items.map((item) => (
                  <li key={item.productId} className="flex justify-between text-sm gap-2">
                    <span className="text-industrial-700 truncate">{item.qty > 1 && `${item.qty}× `}{item.name}</span>
                    <span className="font-medium text-industrial-900 whitespace-nowrap">{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-industrial-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-industrial-600">Subtotaal excl. BTW</span>
                <span>{formatPrice(pricing.subtotalExcl)}</span>
              </div>
              {configuration.includeBTW && (
                <div className="flex justify-between">
                  <span className="text-industrial-600">BTW 21%</span>
                  <span>{formatPrice(pricing.btwAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-industrial-100">
                <span>Totaal {configuration.includeBTW ? 'incl.' : 'excl.'} BTW</span>
                <span className="text-brand-700">{formatPrice(configuration.includeBTW ? pricing.totalIncl : pricing.totalExcl)}</span>
              </div>
            </div>

            <button onClick={() => setStep('quote')} disabled={pricing.items.length === 0} className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
              Ontvang mijn offerte
            </button>
            <p className="text-xs text-center text-industrial-400 mt-3">Vrijblijvende prijsindicatie · Geen verplichting</p>
          </div>
        </aside>
      </div>

      <button onClick={() => setShowMobileCart(true)} className="lg:hidden fixed bottom-6 right-6 bg-brand-600 text-white p-4 rounded-full shadow-lg z-40 flex items-center gap-2">
        <ShoppingCart size={22} />
        <span className="font-bold">{formatPrice(configuration.includeBTW ? pricing.totalIncl : pricing.totalExcl)}</span>
      </button>

      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Jouw configuratie</h3>
              <button onClick={() => setShowMobileCart(false)}><X size={24} /></button>
            </div>
            {pricing.items.map((item) => (
              <div key={item.productId} className="flex justify-between py-2 border-b text-sm">
                <span>{item.qty > 1 && `${item.qty}× `}{item.name}</span>
                <span className="font-medium">{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
            <div className="mt-4 text-lg font-bold flex justify-between">
              <span>Totaal</span>
              <span className="text-brand-700">{formatPrice(configuration.includeBTW ? pricing.totalIncl : pricing.totalExcl)}</span>
            </div>
            <button onClick={() => { setShowMobileCart(false); setStep('quote'); }} className="btn-primary w-full mt-4">Ontvang mijn offerte</button>
          </div>
        </div>
      )}
    </div>
  );
}
