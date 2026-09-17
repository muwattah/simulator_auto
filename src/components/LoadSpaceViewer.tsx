import { lazy, Suspense, useState, useEffect } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProduct } from '../data/detailingCatalog';
import { formatPriceOrPending } from '../lib/pricing';
import type { CameraPreset } from './three/VanScene3D';
import { Box, Maximize2, RotateCcw, Trash2, X, AlertTriangle } from 'lucide-react';
import VanVisualization from './VanVisualization';

const VanScene3D = lazy(() => import('./three/VanScene3D'));

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

const CAMERAS: { id: CameraPreset; label: string }[] = [
  { id: 'overview', label: '3D' },
  { id: 'rear', label: 'Achter' },
  { id: 'left', label: 'Links' },
  { id: 'right', label: 'Rechts' },
  { id: 'top', label: 'Boven' },
];

export default function LoadSpaceViewer() {
  const configuration = useConfiguratorStore((s) => s.configuration);
  const space = useConfiguratorStore((s) => s.getCargoSpace());
  const layout = useConfiguratorStore((s) => s.getLayout());
  const selectedProductId = useConfiguratorStore((s) => s.selectedProductId);
  const setSelectedProductId = useConfiguratorStore((s) => s.setSelectedProductId);
  const removeProductById = useConfiguratorStore((s) => s.removeProductById);

  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [force2d, setForce2d] = useState(false);
  const [webglOk, setWebglOk] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('rear');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { setWebglOk(supportsWebGL()); }, []);

  const effectiveMode = !webglOk || force2d ? '2d' : mode;
  const selected = selectedProductId ? getProduct(selectedProductId) : null;
  const selectedPlacement = layout.placements.find((p) => p.productId === selectedProductId);
  const liningVariant = getProduct(configuration.liningId)?.visual3D.variant ?? 'none';
  const heightClass = expanded ? 'h-[72vh] min-h-[440px]' : 'h-[300px] sm:h-[380px] lg:h-[460px]';

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
        <div className="flex items-center gap-2 min-w-0">
          <Box size={15} className="text-[var(--accent)] shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] leading-tight">3D View</h3>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Live configuratie</p>
          </div>
          <span className="hidden sm:inline text-[10px] uppercase tracking-wide text-[var(--warning)] bg-[var(--warning)]/10 border border-[var(--warning)]/30 px-1.5 py-0.5 rounded">Demo</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex rounded-md border border-[var(--border)] overflow-hidden text-xs font-semibold">
            <button type="button" onClick={() => { setMode('3d'); setForce2d(false); }} className={`px-2.5 py-1.5 transition-colors ${effectiveMode === '3d' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)]'}`}>3D</button>
            <button type="button" onClick={() => setForce2d(true)} className={`px-2.5 py-1.5 transition-colors ${effectiveMode === '2d' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface)] text-[var(--text-secondary)]'}`}>2D</button>
          </div>
          <button type="button" onClick={() => setExpanded((v) => !v)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface)]" title={expanded ? 'Verkleinen' : 'Vergroten'} aria-label={expanded ? 'Verkleinen' : 'Vergroten'}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      {effectiveMode === '3d' && (
        <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          {CAMERAS.map((cam) => (
            <button key={cam.id} type="button" onClick={() => setCameraPreset(cam.id)} className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors ${cameraPreset === cam.id ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-muted)]' : 'text-[var(--text-muted)] border border-transparent'}`}>{cam.label}</button>
          ))}
          <button type="button" onClick={() => setCameraPreset('rear')} className="ml-auto p-1 text-[var(--text-muted)]" title="Reset camera" aria-label="Reset camera"><RotateCcw size={14} /></button>
        </div>
      )}

      {layout.warnings.length > 0 && (
        <div className="mx-3 mt-3 rounded-lg border border-[var(--warning)]/35 bg-[var(--warning)]/10 px-3 py-2 flex gap-2 text-xs text-[var(--warning)]">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Ruimtecontrole</p>
            {layout.warnings.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        </div>
      )}

      <div className={`relative ${heightClass} viewer-shell !rounded-none !border-0`}>
        {effectiveMode === '3d' ? (
          <Suspense fallback={<div className="h-full flex items-center justify-center text-sm text-[var(--text-muted)]">3D laden…</div>}>
            <VanScene3D space={space} placements={layout.placements} liningVariant={liningVariant} selectedProductId={selectedProductId} onSelectProduct={setSelectedProductId} cameraPreset={cameraPreset} />
          </Suspense>
        ) : (
          <div className="p-3 h-full overflow-auto bg-[var(--bg-secondary)]">
            <VanVisualization />
            {(!webglOk || force2d) && <p className="text-xs text-center text-[var(--warning)] mt-2">2D-weergave actief{!webglOk ? ' (WebGL niet beschikbaar)' : ''}.</p>}
          </div>
        )}

        {selected && effectiveMode === '3d' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-72 bg-[var(--surface-elevated)]/95 backdrop-blur border border-[var(--border)] rounded-lg shadow-elevated p-3 z-10">
            <div className="flex justify-between items-start gap-2 mb-1">
              <p className="font-semibold text-sm text-[var(--text-primary)] leading-tight">{selected.name}</p>
              <button type="button" onClick={() => setSelectedProductId(null)} className="text-[var(--text-muted)]" aria-label="Sluiten"><X size={16} /></button>
            </div>
            <p className="text-[var(--accent)] font-bold text-sm">{formatPriceOrPending(selected.price)}</p>
            {selectedPlacement && <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Zone: {selectedPlacement.zone}</p>}
            {selected.capacityLiters && <p className="text-xs text-[var(--text-secondary)] mt-1">Capaciteit {selected.capacityLiters} L · Water ±{selected.capacityLiters} kg</p>}
            {selected.specifications && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{Object.entries(selected.specifications).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
            )}
            <button type="button" onClick={() => removeProductById(selected.id)} className="mt-2 w-full text-xs py-2 rounded-md bg-[var(--danger)]/15 text-[var(--danger)] hover:bg-[var(--danger)]/25 border border-[var(--danger)]/25 inline-flex items-center justify-center gap-1 font-semibold">
              <Trash2 size={12} /> Verwijderen
            </button>
          </div>
        )}
      </div>
      <p className="text-[10px] text-[var(--text-muted)] px-3 py-2 border-t border-[var(--border)]">Generieke 3D-demo · Klik object voor details · Muis/touch: draaien · Scroll: zoom</p>
    </div>
  );
}
