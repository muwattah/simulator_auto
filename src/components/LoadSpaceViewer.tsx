import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import type { ConfigurationItem } from '../types';
import { products } from '../data/demoData';
import { formatPrice } from '../lib/pricing';
import VanVisualization from './VanVisualization';
import type { CameraPreset } from './three/VanScene3D';
import { Box, Maximize2, RotateCcw, Trash2, X } from 'lucide-react';

const VanScene3D = lazy(() => import('./three/VanScene3D'));

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

interface Props {
  items: ConfigurationItem[];
  vehicleVariantId: string | null;
  onRemoveProduct: (productId: string) => void;
}

export default function LoadSpaceViewer({ items, vehicleVariantId, onRemoveProduct }: Props) {
  const [mode, setMode] = useState<'3d' | '2d'>('3d');
  const [webglOk, setWebglOk] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setWebglOk(supportsWebGL());
  }, []);

  useEffect(() => {
    if (selectedId && !items.some((i) => i.productId === selectedId)) {
      setSelectedId(null);
    }
  }, [items, selectedId]);

  const effectiveMode = !webglOk ? '2d' : mode;
  const selectedProduct = selectedId ? products.find((p) => p.id === selectedId) : null;

  const applyPreset = useCallback((p: CameraPreset) => {
    setCameraPreset(p);
  }, []);

  const heightClass = expanded ? 'h-[70vh] min-h-[420px]' : 'h-[320px] sm:h-[380px] lg:h-[420px]';

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-industrial-100 bg-industrial-50/80">
        <div className="flex items-center gap-2">
          <Box size={16} className="text-brand-600" />
          <h3 className="font-semibold text-industrial-900 text-sm">Jouw laadruimte</h3>
          <span className="text-[10px] uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            Demo 3D
          </span>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {webglOk && (
            <div className="flex rounded-md border border-industrial-200 overflow-hidden text-xs mr-1">
              <button
                type="button"
                onClick={() => setMode('3d')}
                className={`px-2.5 py-1 ${effectiveMode === '3d' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}
              >
                3D
              </button>
              <button
                type="button"
                onClick={() => setMode('2d')}
                className={`px-2.5 py-1 ${effectiveMode === '2d' ? 'bg-brand-600 text-white' : 'bg-white text-industrial-600'}`}
              >
                2D
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="btn-ghost text-xs py-1 px-2 flex items-center gap-1"
            title="Vergroot"
          >
            <Maximize2 size={14} />
            <span className="hidden sm:inline">{expanded ? 'Kleiner' : 'Vergroot'}</span>
          </button>
        </div>
      </div>

      {effectiveMode === '3d' && (
        <div className="flex flex-wrap gap-1 px-2 py-1.5 border-b border-industrial-100 bg-white">
          {(
            [
              ['overview', '3D'],
              ['left', 'Links'],
              ['right', 'Rechts'],
              ['rear', 'Achter'],
              ['top', 'Boven'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className={`text-xs px-2 py-1 rounded border ${
                cameraPreset === key
                  ? 'border-brand-500 bg-brand-50 text-brand-800'
                  : 'border-industrial-200 text-industrial-600 hover:border-brand-300'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => applyPreset('overview')}
            className="text-xs px-2 py-1 rounded border border-industrial-200 text-industrial-600 hover:border-brand-300 inline-flex items-center gap-1 ml-auto"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      )}

      <div className={`relative bg-slate-100 ${heightClass}`}>
        {effectiveMode === '3d' ? (
          <Suspense
            fallback={
              <div className="absolute inset-0 flex items-center justify-center text-sm text-industrial-500">
                3D laden…
              </div>
            }
          >
            <VanScene3D
              items={items}
              vehicleVariantId={vehicleVariantId}
              selectedProductId={selectedId}
              onSelectProduct={setSelectedId}
              cameraPreset={cameraPreset}
            />
          </Suspense>
        ) : (
          <div className="p-3 h-full flex items-center justify-center">
            <div className="w-full max-w-md">
              <VanVisualization items={items} />
              {!webglOk && (
                <p className="text-xs text-center text-amber-700 mt-2">
                  WebGL niet beschikbaar — 2D-weergave actief.
                </p>
              )}
            </div>
          </div>
        )}

        {selectedProduct && effectiveMode === '3d' && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-64 bg-white/95 backdrop-blur border border-industrial-200 rounded-lg shadow-lg p-3 z-10">
            <div className="flex justify-between items-start gap-2 mb-1">
              <p className="font-semibold text-sm text-industrial-900 leading-tight">{selectedProduct.name}</p>
              <button type="button" onClick={() => setSelectedId(null)} className="text-industrial-400 hover:text-industrial-600">
                <X size={16} />
              </button>
            </div>
            <p className="text-brand-700 font-bold text-sm">{formatPrice(selectedProduct.price)} excl. btw</p>
            <p className="text-xs text-industrial-500 mt-0.5 uppercase tracking-wide">
              {selectedProduct.possiblePositions.includes('left')
                ? 'Linkerzijde'
                : selectedProduct.possiblePositions.includes('right')
                  ? 'Rechterzijde'
                  : selectedProduct.possiblePositions.includes('floor')
                    ? 'Vloer'
                    : selectedProduct.possiblePositions.includes('roof')
                      ? 'Dak'
                      : selectedProduct.possiblePositions.includes('front')
                        ? 'Voorzijde'
                        : 'Accessoire'}
            </p>
            <button
              type="button"
              onClick={() => {
                onRemoveProduct(selectedProduct.id);
                setSelectedId(null);
              }}
              className="mt-2 w-full text-xs py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 inline-flex items-center justify-center gap-1"
            >
              <Trash2 size={12} /> Verwijderen
            </button>
          </div>
        )}
      </div>

      <p className="text-[10px] text-industrial-400 px-3 py-1.5 border-t border-industrial-100">
        Generieke 3D-demo-assets · Muis/touch: draaien · Scroll/pinch: zoom · Afmetingen schalen met voertuigvariant
      </p>
    </div>
  );
}
