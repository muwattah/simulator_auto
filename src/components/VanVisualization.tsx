import type { ConfigurationItem } from '../types';
import { products } from '../data/demoData';

interface Props {
  items: ConfigurationItem[];
}

export default function VanVisualization({ items }: Props) {
  const positions = { floor: false, left: false, right: false, roof: false, front: false, any: false };
  for (const item of items) {
    const p = products.find((pr) => pr.id === item.productId);
    if (!p) continue;
    for (const pos of p.possiblePositions) {
      if (pos === 'any') positions.any = true;
      else if (pos in positions) (positions as Record<string, boolean>)[pos] = true;
    }
  }
  return (
    <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-industrial-100 to-industrial-200 rounded-lg overflow-hidden border border-industrial-200">
      <svg viewBox="0 0 400 250" className="w-full h-full">
        <rect x="40" y="40" width="320" height="170" rx="12" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
        <rect x="40" y="40" width="70" height="170" rx="8" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
        <text x="75" y="130" textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">CABINE</text>
        <rect x="110" y="50" width="240" height="150" rx="4" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1.5" />
        {positions.floor && <rect x="115" y="175" width="230" height="20" fill="#92400e" opacity="0.75" rx="2" />}
        <text x="230" y="188" textAnchor="middle" fontSize="9" fill={positions.floor ? '#fff' : '#94a3b8'}>{positions.floor ? 'VLOER ✓' : 'VLOER'}</text>
        {positions.left && <rect x="115" y="55" width="40" height="115" fill="#0369a1" opacity="0.85" rx="3" />}
        <text x="135" y="120" textAnchor="middle" fontSize="9" fill={positions.left ? '#fff' : '#94a3b8'} transform="rotate(-90 135 120)">{positions.left ? 'LINKS ✓' : 'LINKS'}</text>
        {positions.right && <rect x="305" y="55" width="40" height="115" fill="#0369a1" opacity="0.85" rx="3" />}
        <text x="325" y="120" textAnchor="middle" fontSize="9" fill={positions.right ? '#fff' : '#94a3b8'} transform="rotate(90 325 120)">{positions.right ? 'RECHTS ✓' : 'RECHTS'}</text>
        {positions.front && <rect x="115" y="55" width="230" height="18" fill="#475569" opacity="0.85" rx="2" />}
        <text x="230" y="68" textAnchor="middle" fontSize="9" fill={positions.front ? '#fff' : '#94a3b8'}>{positions.front ? 'SCHEIDINGSWAND ✓' : 'VOORZIJDE'}</text>
        {positions.roof && <rect x="150" y="25" width="160" height="12" fill="#0f766e" opacity="0.9" rx="2" />}
        <text x="230" y="34" textAnchor="middle" fontSize="9" fill={positions.roof ? '#fff' : '#94a3b8'}>{positions.roof ? 'DAK ✓' : 'DAK'}</text>
        {positions.any && <text x="230" y="125" textAnchor="middle" fontSize="10" fill="#7c3aed" fontWeight="600">+ accessoires</text>}
      </svg>
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 justify-center">
        {items.length === 0 ? (
          <span className="text-xs bg-white/80 px-2 py-1 rounded text-industrial-500">Voeg producten toe om ze hier te zien</span>
        ) : (
          <span className="text-xs bg-white/90 px-2 py-1 rounded text-industrial-700 font-medium">{items.length} product{items.length !== 1 ? 'en' : ''} in configuratie</span>
        )}
      </div>
    </div>
  );
}
