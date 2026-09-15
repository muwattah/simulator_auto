import { useState } from 'react';
import { vehicles, vehicleVariants } from '../data/demoData';
import { useConfiguratorStore } from '../store/configuratorStore';
import { ChevronRight, Truck } from 'lucide-react';

export default function VehicleSelector() {
  const selectVehicleVariant = useConfiguratorStore((s) => s.selectVehicleVariant);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const variants = selectedVehicleId
    ? vehicleVariants.filter((v) => v.vehicleId === selectedVehicleId)
    : [];

  const uniqueBrands = [...new Set(vehicles.map((v) => v.brand))];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-industrial-900 mb-3">
          Welke bedrijfswagen wil je inrichten?
        </h2>
        <p className="text-industrial-600 text-lg max-w-2xl mx-auto">
          Kies je voertuig en uitvoering. Daarna stel je zelf je inrichting samen en zie je direct de prijs.
        </p>
      </div>

      {!selectedVehicleId ? (
        <div className="space-y-8">
          {uniqueBrands.map((brand) => (
            <div key={brand}>
              <h3 className="text-sm font-semibold text-industrial-500 uppercase tracking-wider mb-3">{brand}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicles
                  .filter((v) => v.brand === brand)
                  .map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className="card p-5 text-left hover:border-brand-300 hover:shadow-md transition-all group flex items-center gap-4"
                    >
                      <div className="bg-industrial-100 group-hover:bg-brand-100 p-3 rounded-lg transition-colors">
                        <Truck className="text-industrial-600 group-hover:text-brand-600" size={28} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-industrial-900">{vehicle.model}</p>
                        <p className="text-sm text-industrial-500">{vehicle.brand}</p>
                      </div>
                      <ChevronRight className="text-industrial-300 group-hover:text-brand-500" size={20} />
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedVehicleId(null)}
            className="btn-ghost mb-6 text-sm"
          >
            ← Andere wagen kiezen
          </button>
          <h3 className="text-xl font-bold text-industrial-900 mb-2">
            Kies de uitvoering
          </h3>
          <p className="text-industrial-600 mb-6">
            {vehicles.find((v) => v.id === selectedVehicleId)?.brand}{' '}
            {vehicles.find((v) => v.id === selectedVehicleId)?.model}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => selectVehicleVariant(variant.id)}
                className="card p-6 text-left hover:border-brand-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-brand-700 mb-1">{variant.name}</p>
                    <p className="text-sm text-industrial-600">
                      Lengte: {variant.length} · Hoogte: {variant.height}
                    </p>
                    {variant.description && (
                      <p className="text-sm text-industrial-500 mt-2">{variant.description}</p>
                    )}
                  </div>
                  <ChevronRight className="text-industrial-300 group-hover:text-brand-500 mt-1" size={24} />
                </div>
              </button>
            ))}
          </div>
          {variants.length === 0 && (
            <p className="text-industrial-500">Geen uitvoeringen beschikbaar voor dit model in de demo.</p>
          )}
        </div>
      )}
    </div>
  );
}
