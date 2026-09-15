import { professions } from '../data/demoData';
import { useConfiguratorStore } from '../store/configuratorStore';
import { ArrowRight } from 'lucide-react';

export default function ProfessionSelector() {
  const selectProfession = useConfiguratorStore((s) => s.selectProfession);
  const applyProfessionRecommendation = useConfiguratorStore((s) => s.applyProfessionRecommendation);
  const vehicleLabel = useConfiguratorStore((s) => s.getVehicleLabel());
  const setStep = useConfiguratorStore((s) => s.setStep);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button onClick={() => setStep('vehicle')} className="btn-ghost mb-6 text-sm">
        ← Andere wagen
      </button>

      <div className="text-center mb-10">
        <p className="text-sm text-brand-600 font-medium mb-2">{vehicleLabel}</p>
        <h2 className="text-3xl font-bold text-industrial-900 mb-3">
          Waarvoor gebruik je je bedrijfswagen?
        </h2>
        <p className="text-industrial-600">
          We tonen een aanbevolen inrichting op basis van je beroep. Je kunt alles daarna nog aanpassen.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
        {professions.map((prof) => (
          <button
            key={prof.id}
            onClick={() => {
              applyProfessionRecommendation(prof.id);
            }}
            className="card p-4 text-center hover:border-brand-400 hover:shadow-md transition-all group"
          >
            <span className="text-3xl block mb-2">{prof.icon}</span>
            <span className="text-sm font-medium text-industrial-800 group-hover:text-brand-700">
              {prof.name}
            </span>
          </button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => selectProfession(null)}
          className="btn-secondary inline-flex items-center gap-2"
        >
          Overslaan, ik stel zelf samen
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
