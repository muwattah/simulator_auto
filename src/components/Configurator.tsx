import { useState, useMemo } from 'react';
import { categories, products, packages } from '../data/demoData';
import { useConfiguratorStore } from '../store/configuratorStore';
import { formatPrice, priceIncl } from '../lib/pricing';
import { getCompatibleProducts } from '../lib/compatibility';
import { Plus, Minus, Trash2, Package, ChevronRight, X, ShoppingCart } from 'lucide-react';
import VanVisualization from './VanVisualization';

export default function Configurator() {
  const {
    configuration, selectedCategoryId, setSelectedCategory,
    addProduct, removeProduct, updateQuantity, selectPackage,
    setIncludeBTW, setStep, getPricing, getVehicleLabel, getProfessionLabel,
  } = useConfiguratorStore();

  const pricing = getPricing();
  const vehicleLabel = getVehicleLabel();
  const professionLabel = getProfessionLabel();
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  const currentProducts = selectedCategoryId
    ? getCompatibleProducts(configuration.vehicleVariantId, selectedCategoryId)
    : [];

  const isInConfig = (productId: string) =>
    configuration.items.some((i) => i.productId === productId) ||
    (configuration.packageId
      ? !!packages.find((p) => p.id === configuration.packageId)?.items.some((i) => i.productId === productId)
      : false);

  const getQty = (productId: string) =>
    configuration.items.find((i) => i.productId === productId)?.quantity || 0;

  const upsellProducts = useMemo(() => {
    if (!lastAddedId) return [];
    const prod = products.find((p) => p.id === lastAddedId);
    if (!prod?.relatedProductIds?.length) return [];
    const compatible = getCompatibleProducts(configuration.vehicleVariantId);
    return prod.relatedProductIds
      .map((id) => compatible.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p && !isInConfig(p.id))
      .slice(0, 3);
  }, [lastAddedId, configuration.vehicleVariantId, configuration.items, configuration.packageId]);

  const relevantPackages = packages.filter((pkg) => {
    if (!configuration.profession) return true;
    return !pkg.popularFor?.length || pkg.popularFor.includes(configuration.profession);
  });

  const handleAdd = (productId: string) => {
    addProduct(productId);
    setLastAddedId(productId);
  };

  const displayTotal = configuration.includeBTW ? pricing.totalIncl : pricing.totalExcl;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-28 lg:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm text-industrial-500">Configuratie voor</p>
          <h2 className="text-xl font-bold text-industrial-900">{vehicleLabel}</h2>
          {professionLabel && <p className="text-sm text-brand-600">{professionLabel}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep('profession')} className="btn-ghost text-sm">Beroep</button>
          <button onClick={() => setStep('vehicle')} className="btn-ghost text-sm">Wagen</button>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-industrial-500 uppercase tracking-wider mb-3">Pakketten</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relevantPackages.slice(0, 6).map((pkg) => {
            const isSelected = configuration.packageId === pkg.id;
            return (
              <button key={pkg.id} onClick={() => selectPackage(isSelected ? null : pkg.id)}
                className={`card p-5 text-left transition-all relative ${
                  isSelected ? 'border-brand-500 ring-2 ring-brand-200 shadow-md' : 'hover:border-brand-300 hover:shadow-md'
                }`}>
                {pkg.badge && <span className="absolute top-3 right-3 bg-industrial-800 text-white text-[10px] font-bold px-2 py-0.5 rounded">{pkg.badge}</span>}
                {isSelected && <span className="absolute top-3 left-3 bg-brand-600 text-white text-xs font-bold px-2 py-1 rounded">Geselecteerd</span>}
                <p className="text-lg font-bold text-industrial-900 pr-16">{pkg.name}</p>
                <p className="text-2xl font-bold text-brand-700 my-2">{formatPrice(pkg.price)}</p>
                <p className="text-xs text-industrial-400 mb-2">excl. BTW · incl. montage</p>
                <p className="text-sm text-industrial-600">{pkg.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3">
          <div className="card p-4 sticky top-24">
            <h3 className="font-semibold text-industrial-900 mb-3 flex items-center gap-2"><Package size={18} /> Categorieën</h3>
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id === selectedCategoryId ? null : cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                    selectedCategoryId === cat.id ? 'bg-brand-100 text-brand-800' : 'text-industrial-700 hover:bg-industrial-50'
                  }`}>
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

          {upsellProducts.length > 0 && (
            <div className="card p-4 border-brand-200 bg-brand-50/40">
              <h3 className="font-semibold text-industrial-900 mb-2 text-sm">Vaak gecombineerd met</h3>
              <div className="space-y-2">
                {upsellProducts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 bg-white rounded-lg p-3 border border-industrial-100">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-brand-700 font-semibold">+{formatPrice(p.price)} excl. BTW</p>
                    </div>
                    <button onClick={() => handleAdd(p.id)} className="btn-primary py-1.5 px-3 text-xs shrink-0">+ Toevoegen</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCategoryId ? (
            <div>
              <h3 className="font-semibold text-industrial-900 mb-3">{categories.find((c) => c.id === selectedCategoryId)?.name}</h3>
              <div className="space-y-3">
                {currentProducts.map((product) => {
                  const inConfig = isInConfig(product.id);
                  const qty = getQty(product.id);
                  return (
                    <div key={product.id} className={`card p-4 transition-all ${inConfig ? 'border-brand-300 bg-brand-50/30' : ''}`}>
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-industrial-100 rounded-lg flex items-center justify-center shrink-0"><span className="text-2xl">📦</span></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-industrial-900">{product.name}</h4>
                          <p className="text-sm text-industrial-600 mt-0.5 line-clamp-2">{product.description}</p>
                          {product.dimensions && <p className="text-xs text-industrial-400 mt-1">{product.dimensions}</p>}
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            <span className="font-bold text-brand-700">{formatPrice(product.price)} excl.</span>
                            <span className="text-industrial-500">{formatPrice(priceIncl(product.price))} incl.</span>
                            {product.montagePrice > 0 && <span className="text-industrial-500">Montage {formatPrice(product.montagePrice)}</span>}
                          </div>
                          <div className="flex items-center justify-end mt-3">
                            {inConfig && qty > 0 ? (
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateQuantity(product.id, qty - 1)} className="p-1.5 rounded bg-industrial-100 hover:bg-industrial-200"><Minus size={16} /></button>
                                <span className="font-semibold w-6 text-center">{qty}</span>
                                <button onClick={() => updateQuantity(product.id, qty + 1)} className="p-1.5 rounded bg-industrial-100 hover:bg-industrial-200"><Plus size={16} /></button>
                                <button onClick={() => removeProduct(product.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50 ml-1" title="Verwijderen"><Trash2 size={16} /></button>
                              </div>
                            ) : inConfig ? (
                              <span className="text-xs text-brand-700 font-medium">In pakket</span>
                            ) : (
                              <button onClick={() => handleAdd(product.id)} className="btn-primary py-2 px-4 text-sm flex items-center gap-1"><Plus size={16} /> Toevoegen</button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {currentProducts.length === 0 && <p className="text-industrial-500 text-sm">Geen compatibele producten in deze categorie voor dit voertuig.</p>}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-industrial-500"><p>Selecteer een categorie om producten te bekijken</p></div>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="card p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-industrial-900 flex items-center gap-2"><ShoppingCart size={18} /> Jouw configuratie</h3>
              <div className="flex rounded-lg border border-industrial-200 overflow-hidden text-xs">
                <button onClick={() => setIncludeBTW(false)} className={`px-3 py-1.5 ${!configuration.includeBTW ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}>Excl. BTW</button>
                <button onClick={() => setIncludeBTW(true)} className={`px-3 py-1.5 ${configuration.includeBTW ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}>Incl. BTW</button>
              </div>
            </div>
            <p className="text-xs text-industrial-500 mb-3">{vehicleLabel}</p>
            {pricing.items.length === 0 ? (
              <p className="text-sm text-industrial-500 py-6 text-center">Nog geen producten. Kies een pakket of individuele producten.</p>
            ) : (
              <ul className="space-y-2 mb-4 max-h-56 overflow-y-auto">
                {pricing.items.map((item) => (
                  <li key={item.productId} className="flex justify-between text-sm gap-2">
                    <span className="text-industrial-700 truncate">{item.qty > 1 && `${item.qty}× `}{item.name}</span>
                    <span className="font-medium text-industrial-900 whitespace-nowrap">{formatPrice(configuration.includeBTW ? item.lineTotal * (1 + pricing.btwRate) : item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-industrial-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-industrial-600">Producten</span><span>{formatPrice(pricing.productSubtotal)}</span></div>
              {pricing.montageTotal > 0 && <div className="flex justify-between"><span className="text-industrial-600">Montage</span><span>{formatPrice(pricing.montageTotal)}</span></div>}
              {pricing.packageDiscount > 0 && <div className="flex justify-between text-green-700"><span>Korting</span><span>−{formatPrice(pricing.packageDiscount)}</span></div>}
              <div className="flex justify-between"><span className="text-industrial-600">Subtotaal excl. BTW</span><span>{formatPrice(pricing.subtotalExcl)}</span></div>
              {configuration.includeBTW && <div className="flex justify-between"><span className="text-industrial-600">BTW 21%</span><span>{formatPrice(pricing.btwAmount)}</span></div>}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-industrial-100">
                <span>Totaal {configuration.includeBTW ? 'incl.' : 'excl.'} BTW</span>
                <span className="text-brand-700">{formatPrice(displayTotal)}</span>
              </div>
            </div>
            <button onClick={() => setStep('quote')} disabled={pricing.items.length === 0} className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed">Offerte aanvragen</button>
            <p className="text-xs text-center text-industrial-400 mt-3">Indicatieve demo-prijzen · Geen verplichting</p>
          </div>
        </aside>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-industrial-200 p-3 z-40 shadow-lg">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          <div>
            <p className="text-xs text-industrial-500">Totaal {configuration.includeBTW ? 'incl.' : 'excl.'} BTW</p>
            <p className="font-bold text-brand-700 text-lg">{formatPrice(displayTotal)}</p>
          </div>
          <button onClick={() => setShowMobileCart(true)} className="btn-primary py-2.5 px-4 text-sm">Bekijk configuratie</button>
        </div>
      </div>

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
              <span>Totaal excl. BTW</span>
              <span className="text-brand-700">{formatPrice(pricing.totalExcl)}</span>
            </div>
            <button onClick={() => { setShowMobileCart(false); setStep('quote'); }} className="btn-primary w-full mt-4">Offerte aanvragen</button>
          </div>
        </div>
      )}
    </div>
  );
}
