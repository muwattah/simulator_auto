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

  useEffect(() => {
    setWebglOk(supportsWebGL());
  }, []);

  const effectiveMode = !webglOk || force2d ? '2d' : mode;
  const selected = selectedProductId ? getProduct(selectedProductId) : null;
  const selectedPlacement = layout.placements.find((p) => p.productId === selectedProductId);
  const liningVariant = getProduct(configuration.liningId)?.visual3D.variant ?? 'none';
  const heightClass = expanded ? 'h-[70vh] min-h-[420px]' : 'h-[300px] sm:h-[360px] lg:h-[420px]';

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-industrial-100 bg-industrial-50/80">
        <div className="flex items-center gap-2">
          <Box size={16} className="text-brand-600" />
          <h3 className="font-semibold text-industrial-900 text-sm">Jouw detailing unit</h3>
          <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Demo 3D</span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {webglOk && (
            <div className="flex rounded-md border border-industrial-200 overflow-hidden text-xs mr-1">
              <button type="button" onClick={() => { setMode('3d'); setForce2d(false); }} className={`px-2.5 py-1 ${effectiveMode === '3d' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}>3D</button>
              <button type="button" onClick={() => setMode('2d')} className={`px-2.5 py-1 ${effectiveMode === '2d' && !force2d ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}>2D</button>
            </div>
          )}
          <button type="button" onClick={() => setExpanded((e) => !e)} className="btn-ghost text-xs py-1 px-2 flex items-center gap-1">
            <Maximize2 size={14} />
            <span className="hidden sm:inline">{expanded ? 'Kleiner' : 'Vergroot'}</span>
          </button>
        </div>
      </div>

      {effectiveMode === '3d' && (
        <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-industrial-100 bg-white">
          {([['rear', 'Achter'], ['overview', '3D'], ['left', 'Links'], ['right', 'Rechts'], ['top', 'Boven']] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setCameraPreset(key)} className={`text-xs px-2 py-1 rounded border ${
              cameraPreset === key ? 'border-brand-500 bg-brand-50 text-brand-800' : 'border-industrial-200 text-industrial-600'
            }`}>{label}</button>
          ))}
          <button type="button" onClick={() => setCameraPreset('rear')} className="text-xs px-2 py-1 rounded border border-industrial-200 text-industrial-600 inline-flex items-center gap-1 ml-auto">
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      )}

      {layout.warnings.length > 0 && (
        <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-900 flex gap-2 items-start">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <div>{layout.warnings.map((w, i) => <p key={i}>{w}</p>)}</div>
        </div>
      )}

      <div className={`relative bg-slate-100 ${heightClass}`}>
        {effectiveMode === '3d' ? (
          <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center text-sm text-industrial-500">3D laden…</div>}>
            <VanScene3D
              space={space}
              placements={layout.placements}
              liningVariant={liningVariant}
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
              cameraPreset={cameraPreset}
            />
          </Suspense>
        ) : (
          <div className="p-3 h-full overflow-auto">
            <VanVisualization />
            {(!webglOk || force2d) && (
              <p className="text-xs text-center text-amber-700 mt-2">2D-weergave actief{!webglOk ? ' (WebGL niet beschikbaar)' : ''}.</p>
            )}
          </div>
        )}

        {selected && effectiveMode === '3d' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-72 bg-white/95 backdrop-blur border border-industrial-200 rounded-lg shadow-lg p-3 z-10">
            <div className="flex justify-between items-start gap-2 mb-1">
              <p className="font-semibold text-sm text-industrial-900 leading-tight">{selected.name}</p>
              <button type="button" onClick={() => setSelectedProductId(null)} className="text-industrial-400"><X size={16} /></button>
            </div>
            <p className="text-brand-700 font-bold text-sm">{formatPriceOrPending(selected.price)}</p>
            {selectedPlacement && (
              <p className="text-[10px] text-industrial-500 mt-0.5">Zone: {selectedPlacement.zone}</p>
            )}
            {selected.capacityLiters && (
              <p className="text-xs text-industrial-600 mt-1">Capaciteit {selected.capacityLiters} L · Water ±{selected.capacityLiters} kg</p>
            )}
            {selected.specifications && (
              <p className="text-xs text-industrial-500 mt-0.5">
                {Object.entries(selected.specifications).map(([k, v]) => `${k}: ${v}`).join(' · ')}
              </p>
            )}
            <button
              type="button"
              onClick={() => removeProductById(selected.id)}
              className="mt-2 w-full text-xs py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 inline-flex items-center justify-center gap-1"
            >
              <Trash2 size={12} /> Verwijderen
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-industrial-400 px-3 py-1.5 border-t border-industrial-100">
        Generieke 3D-demo · Klik object voor details · Muis/touch: draaien · Scroll: zoom
      </p>
    </div>
  );
}
