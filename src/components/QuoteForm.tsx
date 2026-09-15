import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { formatPrice } from '../lib/pricing';
import { CheckCircle, ArrowLeft, Info, FileText } from 'lucide-react';

export default function QuoteForm() {
  const { getPricing, getVehicleLabel, getProfessionLabel, submitQuote, setStep, resetConfiguration } = useConfiguratorStore();
  const pricing = getPricing();
  const vehicleLabel = getVehicleLabel();
  const professionLabel = getProfessionLabel();
  const [form, setForm] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', postcode: '', vatNumber: '', remarks: '' });
  const [submitted, setSubmitted] = useState(false);
  const [quoteId, setQuoteId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quote = submitQuote({
      firstName: form.firstName, lastName: form.lastName,
      company: form.company || undefined, email: form.email, phone: form.phone,
      postcode: form.postcode, vatNumber: form.vatNumber || undefined, remarks: form.remarks || undefined,
    });
    setQuoteId(quote.id);
    setSubmitted(true);
  };

  const downloadPdfSummary = () => {
    const rows = pricing.items
      .map(
        (i) =>
          `<tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0">${i.qty}× ${i.name}</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${formatPrice(i.lineTotal)}</td></tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="utf-8"><title>Prijsindicatie ${quoteId || 'configuratie'}</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:24px auto;color:#0f172a;line-height:1.45}
h1{font-size:1.35rem;margin:0 0 4px}h2{font-size:1rem;margin:20px 0 8px;color:#334155}
table{width:100%;border-collapse:collapse;font-size:0.9rem}td{vertical-align:top}
.muted{color:#64748b;font-size:0.85rem}.total{font-size:1.25rem;font-weight:700;color:#1d4ed8}
.box{border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:12px 0;background:#f8fafc}
.note{font-size:0.8rem;color:#64748b;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:12px}</style></head><body>
<h1>Prijsindicatie bedrijfswageninrichting</h1>
<p class="muted">Referentie: ${quoteId || '—'} · ${new Date().toLocaleString('nl-NL')}</p>
<div class="box">
<p><strong>Voertuig:</strong> ${vehicleLabel}</p>
${professionLabel ? `<p><strong>Gebruik:</strong> ${professionLabel}</p>` : ''}
${form.company || form.firstName ? `<p><strong>Klant:</strong> ${[form.firstName, form.lastName].filter(Boolean).join(' ')}${form.company ? ` · ${form.company}` : ''}</p>` : ''}
</div>
<h2>Producten & montage</h2>
<table><tbody>${rows}</tbody></table>
<div class="box" style="margin-top:16px">
<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Producten</span><span>${formatPrice(pricing.productSubtotal)}</span></div>
<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Montage</span><span>${formatPrice(pricing.montageTotal)}</span></div>
${pricing.packageDiscount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Korting</span><span>-${formatPrice(pricing.packageDiscount)}</span></div>` : ''}
<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>Subtotaal excl. BTW</span><span>${formatPrice(pricing.subtotalExcl)}</span></div>
<div style="display:flex;justify-content:space-between;margin-bottom:4px"><span>BTW 21%</span><span>${formatPrice(pricing.btwAmount)}</span></div>
<div style="display:flex;justify-content:space-between;margin-top:8px" class="total"><span>Totaal incl. BTW</span><span>${formatPrice(pricing.totalIncl)}</span></div>
</div>
<p class="note">Dit is een prijsindicatie en geen definitieve overeenkomst. Definitieve prijs kan afhankelijk zijn van voertuigcontrole, beschikbaarheid en specifieke montagevereisten. Catalogus bevat demo-data.</p>
<script>window.onload=function(){window.print()}</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-green-100 text-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} /></div>
        <h2 className="text-2xl font-bold text-industrial-900 mb-3">Configuratie opgeslagen</h2>
        <p className="text-industrial-600 mb-2">Bedankt {form.firstName}. Je configuratie is lokaal opgeslagen in deze browser.</p>
        <p className="text-sm text-industrial-500 mb-4">Referentie: <strong>{quoteId}</strong></p>
        <div className="card p-4 mb-6 text-left bg-amber-50 border-amber-200">
          <div className="flex gap-2 text-sm text-amber-900">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p><strong>Let op:</strong> er is nog geen backend gekoppeld. Deze aanvraag is <em>niet</em> automatisch naar het bedrijf verstuurd. Gebruik de admin (tandwiel) om lokaal opgeslagen leads te bekijken.</p>
          </div>
        </div>
        <div className="card p-5 text-left mb-6">
          <p className="text-sm text-industrial-500 mb-1">Voertuig</p>
          <p className="font-semibold mb-3">{vehicleLabel}</p>
          <p className="text-sm text-industrial-500 mb-1">Indicatie totaal (snapshot)</p>
          <p className="text-2xl font-bold text-brand-700">{formatPrice(pricing.totalIncl)}</p>
          <p className="text-xs text-industrial-400 mt-1">incl. 21% BTW</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
          <button onClick={downloadPdfSummary} className="btn-secondary inline-flex items-center justify-center gap-2">
            <FileText size={18} /> PDF / print samenvatting
          </button>
          <button onClick={resetConfiguration} className="btn-primary">Nieuwe configuratie starten</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => setStep('configurator')} className="btn-ghost mb-6 text-sm flex items-center gap-1"><ArrowLeft size={16} /> Terug naar configurator</button>
      <h2 className="text-2xl font-bold text-industrial-900 mb-2">Offerteaanvraag</h2>
      <p className="text-industrial-600 mb-6">Vul je gegevens in. Configuratie en prijzen worden als snapshot vastgelegd.</p>
      <div className="card p-5 mb-8">
        <h3 className="font-semibold text-industrial-900 mb-3">Samenvatting</h3>
        <p className="text-sm text-industrial-600 mb-1">Voertuig</p>
        <p className="font-medium mb-2">{vehicleLabel}</p>
        {professionLabel && (<><p className="text-sm text-industrial-600 mb-1">Gebruik</p><p className="font-medium mb-3">{professionLabel}</p></>)}
        <ul className="text-sm space-y-1 mb-4">
          {pricing.items.map((item) => (
            <li key={item.productId} className="flex justify-between gap-2">
              <span className="truncate">{item.qty > 1 && `${item.qty}× `}{item.name}</span>
              <span className="whitespace-nowrap">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotaal excl. BTW</span><span>{formatPrice(pricing.subtotalExcl)}</span></div>
          <div className="flex justify-between"><span>BTW 21%</span><span>{formatPrice(pricing.btwAmount)}</span></div>
          <div className="flex justify-between font-bold text-lg pt-1"><span>Totaal incl. BTW</span><span className="text-brand-700">{formatPrice(pricing.totalIncl)}</span></div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-industrial-700 mb-1">Voornaam *</label>
            <input required type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-industrial-700 mb-1">Achternaam *</label>
            <input required type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-industrial-700 mb-1">Bedrijfsnaam</label>
          <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-industrial-700 mb-1">E-mail *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-industrial-700 mb-1">Telefoon *</label>
            <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-industrial-700 mb-1">Postcode *</label>
            <input required type="text" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
          <div><label className="block text-sm font-medium text-industrial-700 mb-1">BTW-nummer</label>
            <input type="text" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} placeholder="Optioneel" className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" /></div>
        </div>
        <div><label className="block text-sm font-medium text-industrial-700 mb-1">Opmerkingen</label>
          <textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full border border-industrial-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" placeholder="Gewenste montagedatum, specifieke wensen..." /></div>
        <button type="submit" className="btn-primary w-full py-4 text-lg">Configuratie vastleggen</button>
        <p className="text-xs text-center text-industrial-400">Prijzen worden vastgelegd als snapshot. Zonder backend wordt niets per e-mail verzonden.</p>
      </form>
    </div>
  );
}
