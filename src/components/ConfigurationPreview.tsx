import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProduct } from '../data/detailingCatalog';
import { createConfigurationFallbackImage } from '../lib/previewImage';

const VanScene3D = lazy(() => import('./three/VanScene3D'));

export default function ConfigurationPreview({ onCaptureReady }: {
  onCaptureReady: (capture: (() => string | null) | null) => void;
}) {
  const configuration = useConfiguratorStore(s => s.configuration);
  const space = useConfiguratorStore(s => s.getCargoSpace());
  const layout = useConfiguratorStore(s => s.getLayout());
  const [webgl, setWebgl] = useState(true);
  useEffect(() => {
    try {
      const element = document.createElement('canvas');
      setWebgl(Boolean(element.getContext('webgl2') || element.getContext('webgl')));
    } catch {
      setWebgl(false);
    }
  }, []);
  const fallback = useMemo(
    () => webgl ? null : createConfigurationFallbackImage(configuration, layout),
    [configuration, layout, webgl],
  );
  const lining = getProduct(configuration.liningId)?.visual3D.variant ?? 'none';

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="flex flex-wrap justify-between gap-2 px-4 py-3 border-b border-[var(--border)]">
        <div>
          <p className="font-semibold text-sm">Jouw installatie in beeld</p>
          <p className="text-xs text-[var(--text-muted)]">Deze afbeelding wordt meegestuurd bij je aanvraag.</p>
        </div>
        <span className="text-xs text-[var(--text-muted)]">Indicatieve visualisatie</span>
      </div>
      <div className="h-[245px] sm:h-[335px]">
        {webgl ? (
          <Suspense fallback={<div className="h-full grid place-items-center text-sm text-[var(--text-muted)]">3D-preview wordt geladen…</div>}>
            <VanScene3D
              space={space}
              placements={layout.placements}
              liningVariant={lining}
              selectedProductId={null}
              onSelectProduct={() => {}}
              cameraPreset="overview"
              presentationMode
              onCaptureReady={onCaptureReady}
            />
          </Suspense>
        ) : (
          fallback && <img src={fallback} className="w-full h-full object-contain" alt="2D-overzicht van de gekozen configuratie" />
        )}
      </div>
      <p className="px-4 py-2 text-[11px] leading-relaxed text-[var(--text-muted)]">
        De preview geeft je gekozen onderdelen weer. Afmetingen, montage en technische haalbaarheid
        worden altijd door onze installateur gecontroleerd.
      </p>
    </div>
  );
}
