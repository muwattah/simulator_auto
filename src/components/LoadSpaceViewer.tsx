import { configurationKey, registerCapture } from '../services/configurationCapture';
import { lazy, Suspense, useState, useCallback, useEffect } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProduct } from '../data/detailingCatalog';
import type { CameraPreset } from './three/VanScene3D';
import type { VanViewSettings } from './three/VanBody3D';
import {
  Box, Maximize2, Minimize2, RotateCcw, Trash2, X,
  SlidersHorizontal, DoorOpen, ScanEye, ZoomIn, ZoomOut,
} from 'lucide-react';
import VanVisualization from './VanVisualization';
import DetailingPhotoGallery, { type PhotoGroup } from './DetailingPhotoGallery';

const VanScene3D = lazy(() => import('./three/VanScene3D'));
const CAMERAS: { id: CameraPreset; label: string }[] = [
  { id: 'top', label: 'Boven' },
  { id: 'overview', label: 'Schuin' },
  { id: 'rear', label: 'Achter' },
  { id: 'left', label: 'Links' },
  { id: 'right', label: 'Rechts' },
  { id: 'front', label: 'Voorkant' },
];

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function LoadSpaceViewer() {
  const configuration = useConfiguratorStore(s => s.configuration);
  const step = useConfiguratorStore(s => s.step);
  const space = useConfiguratorStore(s => s.getCargoSpace());
  const layout = useConfiguratorStore(s => s.getLayout());
  const selectedProductId = useConfiguratorStore(s => s.selectedProductId);
  const setSelectedProductId = useConfiguratorStore(s => s.setSelectedProductId);
  const removeProduct = useConfiguratorStore(s => s.removeProductById);

  const captureKey = configurationKey(configuration);
  const onCaptureReady = useCallback((capture: (() => string | null) | null) =>
    registerCapture(captureKey, capture), [captureKey]);

  const [mode, setMode] = useState<'3d' | '2d' | 'foto'>('3d');
  const [webglOk] = useState(supportsWebGL);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [cameraRevision, setCameraRevision] = useState(0);
  const [zoomStep, setZoomStep] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [vanSettings, setVanSettings] = useState<VanViewSettings>({
    body: 'solid', roofVisible: true, doorsOpen: true, sideDoorOpen:true,
  });

  useEffect(() => {
    const focus = (event: Event) => {
      const door = (event as CustomEvent<string>).detail;
      setMode('3d');setCameraPreset(door === 'rightSideAccess' ? 'right' : 'rear');setCameraRevision(v=>v+1);
      setVanSettings(s=>({...s,doorsOpen:true,sideDoorOpen:true}));
    };
    window.addEventListener('rs-door-focus',focus);return ()=>window.removeEventListener('rs-door-focus',focus);
  },[]);

  const effectiveMode = mode === 'foto' ? 'foto' : !webglOk ? '2d' : mode;
  const photoGroup: PhotoGroup =
    step === 'pressure' ? 'pressure'
      : step === 'power' ? 'generator'
      : step === 'frame' || step === 'lining' ? 'frame'
      : step === 'extras' ? 'accessories'
      : step === 'compressor' ? 'reel' : 'van';
  const selected = selectedProductId ? getProduct(selectedProductId) : null;
  const variant = getProduct(configuration.liningId)?.visual3D.variant ?? 'none';
  const heightClass = expanded
    ? 'h-[80dvh] min-h-[440px]'
    : 'h-[335px] sm:h-[465px] lg:h-[min(64dvh,640px)] lg:min-h-[420px]';

  function chooseCamera(id: CameraPreset) {
    setMode('3d');
    if (id === 'top') setVanSettings(s => ({ ...s, roofVisible: false }));
    setCameraPreset(id);
    setCameraRevision(v => v + 1);
  }

  return (
    <div className="detail-viewer overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
      <div className={'viewer-shell !rounded-none !border-0 relative ' + heightClass}>
        {effectiveMode === '3d' ? (
          <Suspense fallback={
            <div className="relative h-full overflow-hidden bg-[#101720]">
              <img src={import.meta.env.BASE_URL + 'realisations/workbench-01.jpg'} alt=""
                className="h-full w-full object-cover opacity-35" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                <span className="rounded-lg border border-white/10 bg-[#101720]/85 px-4 py-3 text-sm font-medium text-white">
                  Jouw 3D-bestelwagen wordt geladen…
                </span>
              </div>
            </div>
          }>
            <VanScene3D
              space={space} placements={layout.placements} liningVariant={variant} floatValve={!!configuration.floatValve}
              selectedProductId={selectedProductId} onSelectProduct={setSelectedProductId}
              cameraPreset={cameraPreset} cameraRevision={cameraRevision} zoomStep={zoomStep}
              vanSettings={vanSettings} onCaptureReady={onCaptureReady}
            />
          </Suspense>
        ) : effectiveMode === 'foto' ? (
          <div className="h-full overflow-y-auto bg-[var(--bg-secondary)] px-3 pt-12 pb-3">
            <DetailingPhotoGallery group={photoGroup} compact />
          </div>
        ) : (
          <div className="h-full overflow-auto bg-[var(--bg-secondary)] px-3 pt-12 pb-3">
            <VanVisualization />
            {!webglOk && <p className="mt-3 text-center text-xs text-[var(--text-muted)]">Deze browser toont de 2D-weergave omdat 3D niet beschikbaar is.</p>}
          </div>
        )}

        <div className="absolute left-3 top-3 z-20 inline-flex overflow-hidden rounded-lg border border-white/10 bg-[#0b1320]/85 p-1 shadow-lg backdrop-blur-md">
          {([
            { id: '3d' as const, label: '3D' },
            { id: '2d' as const, label: '2D' },
            { id: 'foto' as const, label: "Foto's" },
          ]).map(option => (
            <button key={option.id} type="button" onClick={() => setMode(option.id)}
              aria-pressed={effectiveMode === option.id}
              className={'rounded-md px-3 py-1.5 text-[11px] font-bold transition-colors ' +
                (effectiveMode === option.id ? 'bg-[var(--accent)] text-white' : 'text-white/75 hover:bg-white/10')}>
              {option.label}
            </button>
          ))}
        </div>

        {selected && effectiveMode === '3d' && (
          <aside className="absolute bottom-3 left-3 right-3 z-20 rounded-lg border border-[var(--border)] bg-[#101720]/95 p-3 text-white shadow-xl backdrop-blur-md sm:left-auto sm:w-64">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold">{selected.name}</p>
              <button type="button" onClick={() => setSelectedProductId(null)} aria-label="Sluiten"
                className="text-white/60 hover:text-white"><X size={16} /></button>
            </div>
            {selected.capacityLiters && <p className="mt-1 text-[11px] text-white/70">{selected.capacityLiters} liter</p>}
            <button type="button" onClick={() => removeProduct(selected.id)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-red-400/40 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300">
              <Trash2 size={13} /> Verwijderen
            </button>
          </aside>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden items-center gap-1.5 rounded-md bg-[#101720]/70 px-2.5 py-1.5 text-[10px] text-white/70 backdrop-blur-sm sm:inline-flex">
          <Box size={13} /> Sleep om te draaien · Zoom met het muiswiel
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-[var(--border)] bg-[var(--surface)] p-2.5 scrollbar-thin sm:gap-2 sm:p-3">
        {CAMERAS.map(cam => (
          <button key={cam.id} type="button" onClick={() => chooseCamera(cam.id)}
            aria-pressed={cameraPreset === cam.id && effectiveMode === '3d'}
            className={'inline-flex h-10 shrink-0 items-center justify-center rounded-lg border px-3 text-xs font-bold transition-colors sm:px-4 ' +
              (cameraPreset === cam.id && effectiveMode === '3d'
                ? 'border-sky-500 bg-sky-500/15 text-sky-300'
                : 'border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-white')}>
            {cam.label}
          </button>
        ))}
        <div className="mx-1 h-7 w-px shrink-0 bg-[var(--border)]" />
        <button type="button" aria-label="Inzoomen" title="Inzoomen" onClick={() => setZoomStep(v => v + 1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-white">
          <ZoomIn size={18} />
        </button>
        <button type="button" aria-label="Uitzoomen" title="Uitzoomen" onClick={() => setZoomStep(v => v - 1)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-white">
          <ZoomOut size={18} />
        </button>
        <button type="button" aria-label="Terug naar bovenaanzicht" title="Camera naar bovenaanzicht" onClick={() => chooseCamera('top')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-white">
          <RotateCcw size={16} />
        </button>
        <button type="button" aria-label="Weergave-instellingen" title="Weergave-instellingen"
          aria-expanded={settingsOpen} onClick={() => setSettingsOpen(v => !v)}
          className={'ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ' +
            (settingsOpen ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-[var(--border)] text-[var(--text-secondary)]')}>
          <SlidersHorizontal size={17} />
        </button>
        <button type="button" aria-label={expanded ? 'Verkleinen' : 'Vergroten'} title={expanded ? 'Verkleinen' : 'Vergroten'}
          onClick={() => setExpanded(v => !v)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-white">
          {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      </div>

      {settingsOpen && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-elevated)] p-3">
          {([
            { id: 'transparent' as const, title: 'Transparante bus' },
            { id: 'solid' as const, title: 'Gesloten bus' },
            { id: 'hidden' as const, title: 'Alleen apparatuur' },
          ]).map(o => (
            <button type="button" key={o.id} onClick={() => setVanSettings(s => ({ ...s, body: o.id }))}
              aria-pressed={vanSettings.body === o.id}
              className={'rounded-md border px-2.5 py-2 text-xs ' +
                (vanSettings.body === o.id ? 'border-sky-500 bg-sky-500/10 text-sky-300' : 'border-[var(--border)]')}>
              {o.title}
            </button>
          ))}
          <button type="button" onClick={() => setVanSettings(s => ({ ...s, roofVisible: !s.roofVisible }))}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-2 text-xs">
            <ScanEye size={14} /> {vanSettings.roofVisible ? 'Dak verbergen' : 'Dak tonen'}
          </button>
          <button type="button" onClick={() => setVanSettings(s => ({...s,sideDoorOpen:!s.sideDoorOpen}))}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-2 text-xs">
            <DoorOpen size={14} /> {vanSettings.sideDoorOpen ? 'Zijdeur sluiten' : 'Zijdeur openen'}
          </button>
          <button type="button" onClick={() => setVanSettings(s => ({ ...s, doorsOpen: !s.doorsOpen }))}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2.5 py-2 text-xs">
            <DoorOpen size={14} /> {vanSettings.doorsOpen ? 'Deuren sluiten' : 'Deuren openen'}
          </button>
        </div>
      )}
    </div>
  );
}
