import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { formatPrice } from '../lib/pricing';
import { CheckCircle, ArrowLeft } from 'lucide-react';

export default function QuoteForm() {
  const {
    getPricing,
    getVehicleLabel,
    submitQuote,
    setStep,
    resetConfiguration,
  } = useConfiguratorStore();

  const pricing = getPricing();
  const vehicleLabel = getVehicleLabel();

  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    postcode: '',
    remarks: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quote = submitQuote({
      name: form.name,
      company: form.company || undefined,
      email: form.email,
      phone: form.phone,
      postcode: form.postcode,
      remarks: form.remarks || undefined,
    });
    setQuoteId(quote.id);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-bold text-industrial-900 mb-3">Offerte aangevraagd!</h2>
        <p className="text-industrial-600 mb-2">
          Bedankt {form.name}. We hebben je configuratie ontvangen.
        </p>
        <p className="text-sm text-industrial-500 mb-6">Referentie: <strong>{quoteId}</strong></p>
        <div className="card p-5 text-left mb-8">
          <p className="text-sm text-industrial-500 mb-1">Voertuig</p>
          <p className="font-semibold mb-3">{vehicleLabel}</p>
          <p className="text-sm text-industrial-500 mb-1">Indicatie totaal</p>
          <p className="text-2xl font-bold text-brand-700">{formatPrice(pricing.totalIncl)}</p>
          <p className="text-xs text-industrial-400 mt-1">incl. 21% BTW</p>
        </div>
        <p className="text-sm text-industrial-600 mb-8">
          We nemen zo snel mogelijk contact met je op via {form.email} of {form.phone}.
        </p>
        <button onClick={resetConfiguration} className="btn-primary">
          Nieuwe configuratie starten
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => setStep('configurator')} className="btn-ghost mb-6 text-sm flex items-center gap-1">
        <ArrowLeft size={16} /> Terug naar configurator
      </button>

      <h2 className="text-2xl font-bold text-industrial-900 mb-2">Ontvang je offerte</h2>
      <p className="text-industrial-600 mb-8">
        Vul je gegevens in. We sturen je een bevestiging en nemen contact op.
      </p>

      <div className="card p-5 mb-8">
        <h3 className="font-semibold text-industrial-900 mb-3">Samenvatting</h3>
        <p className="text-sm text-industrial-600 mb-1">Voertuig</p>
        <p className="font-medium mb-3">{vehicleLabel}</p>
        <ul className="text-sm space-y-1 mb-4">
          {pricing.items.map((item) => (
            <li key={item.productId} className="flex justify-between">
              <span>{item.qty > 1 && `${item.qty}× `}{item.name}</span>
              <span>{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 flex justify-between font-bold">
          <span>Totaal incl. BTW</span>
          <span className="text-brand-700">{formatPrice(pricing.totalIncl)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-industrial-700 mb-1">Naam *</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-industrial-700 mb-1">Bedrijfsnaam</label>
            <input
              type="text"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-industrial-700 mb-1">E-mail *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-industrial-700 mb-1">Telefoon *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-industrial-700 mb-1">Postcode *</label>
          <input
            required
            type="text"
            value={form.postcode}
            onChange={(e) => setForm({ ...form, postcode: e.target.value })}
            className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-xs"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-industrial-700 mb-1">Opmerkingen</label>
          <textarea
            rows={3}
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Bijv. gewenste montagedatum, specifieke wensen..."
          />
        </div>
        <button type="submit" className="btn-primary w-full py-4 text-lg">
          Offerte aanvragen
        </button>
        <p className="text-xs text-center text-industrial-400">
          Door te verzenden ga je akkoord met het opslaan van je configuratie voor offerte-doeleinden.
        </p>
      </form>
    </div>
  );
}
