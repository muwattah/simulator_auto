/** Simple 2D fallback schematic for detailing unit */
import { useConfiguratorStore } from '../store/configuratorStore';
import { getProduct } from '../data/detailingCatalog';

export default function VanVisualization() {
  const configuration = useConfiguratorStore((s) => s.configuration);
  const layout = useConfiguratorStore((s) => s.getLayout());

  const labels = layout.placements.map((p) => getProduct(p.productId)?.name).filter(Boolean);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative border-2 border-industrial-300 rounded-lg bg-industrial-50 aspect-[4/3] p-3">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] text-industrial-400">VOOR</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-industrial-400">ACHTER</div>
        <div className="h-full flex flex-col justify-end gap-1">
          {configuration.tankId && (
            <div className="mx-auto w-2/5 h-10 bg-blue-800/80 rounded text-white text-[10px] flex items-center justify-center">
              Tank
            </div>
          )}
          <div className="flex justify-center gap-1 flex-wrap">
            {layout.placements
              .filter((p) => getProduct(p.productId)?.visual3D.type === 'hoseReel')
              .map((p) => (
                <div key={p.productId} className="w-8 h-8 rounded-full border-2 border-brand-600 bg-brand-100" title={getProduct(p.productId)?.name} />
              ))}
          </div>
          <div className="flex justify-between px-2">
            {configuration.compressorId && (
              <div className="w-12 h-8 bg-industrial-400 rounded text-[9px] text-white flex items-center justify-center">CMP</div>
            )}
            {configuration.generatorId && (
              <div className="w-12 h-8 bg-industrial-600 rounded text-[9px] text-white flex items-center justify-center">GEN</div>
            )}
          </div>
          {configuration.frameComboId && (
            <div className="h-3 border border-dashed border-industrial-400 mx-4" />
          )}
        </div>
      </div>
      {labels.length > 0 && (
        <ul className="mt-2 text-xs text-industrial-600 space-y-0.5">
          {labels.slice(0, 8).map((l, i) => (
            <li key={i}>• {l}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
