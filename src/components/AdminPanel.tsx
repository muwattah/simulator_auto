import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { products, packages, categories } from '../data/demoData';
import { formatPrice } from '../lib/pricing';
import { X, Package, FileText, Truck } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: Props) {
  const quotes = useConfiguratorStore((s) => s.quotes);
  const [tab, setTab] = useState<'quotes' | 'products' | 'packages'>('quotes');

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
            <FileText size={16} /> Offertes ({quotes.length})
          </button>
          <button
            onClick={() => setTab('products')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              tab === 'products' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-700'
            }`}
          >
            <Package size={16} /> Producten ({products.length})
          </button>
          <button
            onClick={() => setTab('packages')}
            className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              tab === 'packages' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-700'
            }`}
          >
            <Truck size={16} /> Pakketten ({packages.length})
          </button>
        </div>

        {tab === 'quotes' && (
          <div className="space-y-4">
            {quotes.length === 0 ? (
              <div className="card p-8 text-center text-industrial-500">
                Nog geen offertes ontvangen. Test de configurator om leads te genereren.
              </div>
            ) : (
              quotes.map((q) => (
                <div key={q.id} className="card p-5">
                  <div className="flex flex-wrap justify-between gap-3 mb-3">
                    <div>
                      <p className="font-bold text-industrial-900">{q.customer.name}</p>
                      <p className="text-sm text-industrial-600">
                        {q.customer.company && `${q.customer.company} · `}
                        {q.customer.email} · {q.customer.phone}
                      </p>
                      <p className="text-xs text-industrial-400 mt-1">
                        {new Date(q.createdAt).toLocaleString('nl-NL')} · {q.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-brand-700">{formatPrice(q.total)}</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                        {q.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-industrial-800 mb-2">{q.vehicleLabel}</p>
                  <ul className="text-sm text-industrial-600 space-y-0.5">
                    {q.itemsDetail.map((item, idx) => (
                      <li key={idx}>
                        {item.qty > 1 && `${item.qty}× `}{item.name} — {formatPrice(item.price * item.qty + item.montage * item.qty)}
                      </li>
                    ))}
                  </ul>
                  {q.customer.remarks && (
                    <p className="text-sm text-industrial-500 mt-2 italic">"{q.customer.remarks}"</p>
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
                    <th className="text-right p-3 font-semibold">Montage</th>
                    <th className="text-center p-3 font-semibold">Actief</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-industrial-100">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3 text-industrial-600">
                        {categories.find((c) => c.id === p.categoryId)?.name}
                      </td>
                      <td className="p-3 text-right">{formatPrice(p.price)}</td>
                      <td className="p-3 text-right">{formatPrice(p.montagePrice)}</td>
                      <td className="p-3 text-center">
                        {p.active ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-500">✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="p-4 text-xs text-industrial-400 border-t">
              Demo-modus: prijzen en producten zijn hardcoded. In productie koppel je dit aan een database of CMS.
            </p>
          </div>
        )}

        {tab === 'packages' && (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="card p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{pkg.name}</h3>
                    <p className="text-sm text-industrial-600">{pkg.description}</p>
                  </div>
                  <p className="text-xl font-bold text-brand-700">{formatPrice(pkg.price)}</p>
                </div>
                <ul className="mt-3 text-sm text-industrial-600 space-y-1">
                  {pkg.items.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <li key={item.productId}>
                        {item.quantity}× {prod?.name || item.productId}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
