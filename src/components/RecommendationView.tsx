import { useConfiguratorStore } from '../store/configuratorStore';
import { products, packages } from '../data/demoData';
import { formatPrice } from '../lib/pricing';
import { Check, ArrowRight, Pencil } from 'lucide-react';

export default function RecommendationView() {
  const rec = useConfiguratorStore((s) => s.lastRecommendation);
  const vehicleLabel = useConfiguratorStore((s) => s.getVehicleLabel());
  const acceptRecommendation = useConfiguratorStore((s) => s.acceptRecommendation);
  const setStep = useConfiguratorStore((s) => s.setStep);
  const professionLabel = useConfiguratorStore((s) => s.getProfessionLabel());

  if (!rec) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-industrial-600 mb-4">Geen aanbeveling beschikbaar.</p>
        <button onClick={() => setStep('configurator')} className="btn-primary">Zelf samenstellen</button>
      </div>
    );
  }

  const pkg = packages.find((p) => p.id === rec.packageId);
  const itemNames = (pkg?.items ?? rec.productIds.map((id) => ({ productId: id, quantity: 1 }))).map(
    (i) => products.find((p) => p.id === i.productId)?.name ?? i.productId
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-sm text-brand-600 font-medium mb-1">AANBEVOLEN VOOR JOU</p>
        <h2 className="text-2xl font-bold text-industrial-900 mb-1">{rec.title}</h2>
        <p className="text-industrial-600 text-sm">{vehicleLabel}{professionLabel ? ` · ${professionLabel}` : ''}</p>
      </div>
      <div className="card p-6 mb-6">
        {pkg && (
          <div className="mb-4">
            <span className="inline-block bg-brand-100 text-brand-800 text-xs font-bold px-2 py-1 rounded mb-2">{pkg.name}</span>
            {pkg.badge && <p className="text-sm text-brand-700 font-medium">{pkg.badge}</p>}
          </div>
        )}
        <p className="text-sm text-industrial-600 mb-4">{rec.rationale}</p>
        <ul className="space-y-2 mb-6">
          {itemNames.map((name, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <Check size={18} className="text-green-600 shrink-0 mt-0.5" /><span>{name}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-industrial-100 pt-4">
          <p className="text-sm text-industrial-500">Geschatte prijs</p>
          <p className="text-3xl font-bold text-brand-700">{formatPrice(rec.estimatedExcl)}</p>
          <p className="text-xs text-industrial-400">excl. BTW · indicatief (demo-prijzen)</p>
        </div>
      </div>
      <button onClick={acceptRecommendation} className="btn-primary w-full py-4 text-lg mb-3 inline-flex items-center justify-center gap-2">
        Deze configuratie gebruiken <ArrowRight size={20} />
      </button>
      <button onClick={() => setStep('configurator')} className="btn-secondary w-full py-3 inline-flex items-center justify-center gap-2">
        <Pencil size={16} /> Zelf verder samenstellen
      </button>
    </div>
  );
}
