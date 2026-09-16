import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { products } from '../data/detailingCatalog';
import { formatPriceOrPending } from '../lib/pricing';
import { X, Package, FileText } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: Props) {
  const quotes = useConfiguratorStore((s) => s.quotes);
  const [tab, setTab] = useState<'quotes' | 'products'>('quotes');

  return (
    <div className="min-h-screen bg-industrial-50">
      <header className="bg-industrial-900 text-white px-4 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">Admin Paneel</h1>
        <button onClick={onClose} className="p-2 hover:bg-industrial-700 rounded-lg">
          <X size={20} />
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('quotes')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              tab === 'quotes' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-700'
            }`}
          >
            <FileText size={16} /> Configuraties ({quotes.length})
          </button>
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              tab === 'products' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-700'
            }`}
          >
            <Package size={16} /> Producten ({products.length})
          </button>
        </div>

        {tab === 'quotes' && (
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="card p-8 text-center text-industrial-500">
                Nog geen opgeslagen configuraties.
              </div>
            ) : (
              quotes.map((q) => (
                <div key={q.id} className="card p-5">
                  <div className="flex flex-wrap justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-industrial-900">
                        {q.customer.firstName} {q.customer.lastName}
                      </p>
                      <p className="text-sm text-industrial-600">
                        {q.customer.company && `${q.customer.company} · `}
                        {q.customer.email} · {q.customer.phone}
                      </p>
                      <p className="text-xs text-industrial-400 mt-1">
                        {new Date(q.createdAt).toLocaleString('nl-NL')} · {q.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-industrial-600">
                        Bekend: {formatPriceOrPending(q.snapshot.knownSubtotal)}
                      </p>
                      <p className="text-xs text-amber-700">
                        {q.snapshot.pendingPriceItems.length}× op aanvraag
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-industrial-800 mb-2">
                    {q.snapshot.vehicleCategory} · {q.snapshot.cabType}
                  </p>
                  {q.snapshot.specialRequests && (
                    <p className="text-sm text-industrial-500 mt-2 italic">"{q.snapshot.specialRequests}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'products' && (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-industrial-100">
                  <tr>
                    <th className="text-left p-3 font-semibold">Naam</th>
                    <th className="text-left p-3 font-semibold">Categorie</th>
                    <th className="text-right p-3 font-semibold">Prijs</th>
                    <th className="text-center p-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-industrial-100">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-industrial-600">{p.category}</td>
                      <td className="p-3 text-right">{formatPriceOrPending(p.price)}</td>
                      <td className="p-3 text-center">
                        {p.priceStatus === 'pending' ? (
                          <span className="text-amber-600 text-xs">pending</span>
                        ) : (
                          <span className="text-green-600">known</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="p-4 text-xs text-industrial-400 border-t">
              Demo-modus: prijzen zijn pending tot echte tarieven beschikbaar zijn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
