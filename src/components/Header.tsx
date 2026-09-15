import { Truck, Settings } from 'lucide-react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { formatPrice } from '../lib/pricing';

interface Props {
  onAdminClick: () => void;
}

export default function Header({ onAdminClick }: Props) {
  const step = useConfiguratorStore((s) => s.step);
  const pricing = useConfiguratorStore((s) => s.getPricing());
  const includeBTW = useConfiguratorStore((s) => s.configuration.includeBTW);
  const vehicleLabel = useConfiguratorStore((s) => s.getVehicleLabel());
  const hasConfig = useConfiguratorStore((s) => s.configuration.vehicleVariantId);

  return (
    <header className="bg-white border-b border-industrial-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-600 text-white p-2 rounded-lg">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg text-industrial-900 leading-tight">Bedrijfswagen Configurator</h1>
            <p className="text-xs text-industrial-500 hidden sm:block">Professionele inrichting · Directe prijsindicatie</p>
          </div>
        </div>

        {hasConfig && step !== 'vehicle' && (
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-industrial-500">Voertuig</p>
              <p className="font-medium text-sm text-industrial-800">{vehicleLabel}</p>
            </div>
            <div className="h-8 w-px bg-industrial-200" />
            <div className="text-right">
              <p className="text-xs text-industrial-500">Totaal {includeBTW ? 'incl.' : 'excl.'} BTW</p>
              <p className="font-bold text-lg text-brand-700">
                {formatPrice(includeBTW ? pricing.totalIncl : pricing.totalExcl)}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onAdminClick}
          className="p-2 text-industrial-400 hover:text-industrial-600 hover:bg-industrial-100 rounded-lg transition-colors"
          title="Admin"
        >
          <Settings size={20} />
        </button>
      </div>

      {hasConfig && step === 'configurator' && (
        <div className="md:hidden bg-brand-50 border-t border-brand-100 px-4 py-2 flex justify-between items-center">
          <span className="text-sm text-brand-800 font-medium">Totaal {includeBTW ? 'incl.' : 'excl.'} BTW</span>
          <span className="font-bold text-brand-700">{formatPrice(includeBTW ? pricing.totalIncl : pricing.totalExcl)}</span>
        </div>
      )}
    </header>
  );
}
