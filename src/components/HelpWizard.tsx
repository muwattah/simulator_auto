import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { professions, budgetBands } from '../data/demoData';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function HelpWizard() {
  const vehicleLabel = useConfiguratorStore((s) => s.getVehicleLabel());
  const runHelpWizard = useConfiguratorStore((s) => s.runHelpWizard);
  const setStep = useConfiguratorStore((s) => s.setStep);
  const [professionId, setProfessionId] = useState<string | null>(null);
  const [budgetBand, setBudgetBand] = useState<string | null>(null);
  const canSubmit = professionId && budgetBand;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => setStep('profession')} className="btn-ghost mb-6 text-sm flex items-center gap-1">
        <ArrowLeft size={16} /> Terug
      </button>
      <div className="text-center mb-8">
        <p className="text-sm text-brand-600 font-medium mb-2">{vehicleLabel}</p>
        <h2 className="text-3xl font-bold text-industrial-900 mb-2">Help mij kiezen</h2>
        <p className="text-industrial-600">Beantwoord twee korte vragen. Wij stellen een passende inrichting voor die je daarna kunt aanpassen.</p>
      </div>
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-industrial-900 mb-3">1. Wat is je beroep?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {professions.map((p) => (
            <button key={p.id} onClick={() => setProfessionId(p.id)}
              className={`p-3 rounded-lg border text-left text-sm transition-all ${
                professionId === p.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-industrial-200 hover:border-brand-300'
              }`}>
              <span className="mr-2">{p.icon}</span>{p.name}
            </button>
          ))}
        </div>
      </div>
      <div className="card p-6 mb-8">
        <h3 className="font-semibold text-industrial-900 mb-3">2. Wat is ongeveer je budget?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {budgetBands.map((b) => (
            <button key={b.id} onClick={() => setBudgetBand(b.id)}
              className={`p-4 rounded-lg border text-left font-medium transition-all ${
                budgetBand === b.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-industrial-200 hover:border-brand-300'
              }`}>{b.label}</button>
          ))}
        </div>
      </div>
      <button disabled={!canSubmit} onClick={() => canSubmit && runHelpWizard(professionId!, budgetBand!)}
        className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2">
        Toon mijn aanbeveling <ArrowRight size={20} />
      </button>
    </div>
  );
}
