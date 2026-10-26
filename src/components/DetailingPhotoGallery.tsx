import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export type PhotoGroup = 'van' | 'pressure' | 'reel' | 'generator' | 'frame' | 'accessories';

type Photo = {
  path: string;
  caption: string;
  alt: string;
};

const PHOTOS: Record<PhotoGroup, Photo[]> = {
  van: [
    { path: 'realisations/workbench-01.jpg', caption: 'Voorbeeld van een ingerichte detailingbestelwagen', alt: 'Detailingbestelwagen met open achterdeuren en opbergruimte' },
    { path: 'realisations/interior-01.jpg', caption: 'Generator en uittrekbare opstelling in een bestelwagen', alt: 'Voorbeeld van generatorinstallatie in een bestelwagen' },
    { path: 'realisations/interior-02.jpg', caption: 'Professionele haspel en hogedruklans', alt: 'Slanghaspel met aangesloten hogedruklans' },
    { path: 'realisations/interior-03.jpg', caption: 'Hogedrukinstallatie in een detailingbus', alt: 'Hogedrukreiniger met pomp en leidingwerk in een bestelwagen' },
  ],
  pressure: [
    { path: 'realisations/interior-03.jpg', caption: 'Voorbeeld van een gemonteerde hogedrukreiniger', alt: 'Gemonteerde hogedrukreiniger in een detaillingsysteem' },
    { path: 'realisations/interior-02.jpg', caption: 'Bijpassende hogedruklans en haspel', alt: 'Slanghaspel en hogedrukpistool in een detailingbus' },
  ],
  reel: [
    { path: 'realisations/interior-02.jpg', caption: 'Voorbeeld van een slanghaspel en hogedrukpistool', alt: 'Slanghaspel en hogedrukpistool' },
    { path: 'realisations/workbench-01.jpg', caption: 'Haspels in een complete installatie', alt: 'Ingerichte detailingbus met haspels' },
  ],
  generator: [
    { path: 'realisations/interior-01.jpg', caption: 'Generator in een uitschuifbare installatie', alt: 'Generator met schuiflade in een bestelwagen' },
    { path: 'realisations/workbench-01.jpg', caption: 'Complete inrichting met stroomvoorziening', alt: 'Detailingbus met elektrische apparatuur' },
  ],
  frame: [
    { path: 'realisations/workbench-01.jpg', caption: 'Voorbeeld van een afgewerkte detailingopbouw', alt: 'Achterzijde van een professioneel ingerichte detailingbus' },
    { path: 'realisations/interior-01.jpg', caption: 'Uittrekbaar frame en traanplaatbekleding', alt: 'Uittrekbaar generatorframe en metalen bekleding' },
  ],
  accessories: [
    { path: 'productfotos/hygiemeca/01_support_pour_brosses/01.jpg', caption: 'Borstelhouder — referentiefoto', alt: 'Borstelhouder voor detailingaccessoires' },
    { path: 'productfotos/hygiemeca/02_support_pinceaux_et_pulverisateurs/01.jpg', caption: 'Penseel- en sproeifleshouder — referentiefoto', alt: 'Houder voor penselen en detailingflessen' },
    { path: 'productfotos/hygiemeca/03_support_polisseuse/01.jpg', caption: 'Polijstmachinehouder — referentiefoto', alt: 'Houder voor een polijstmachine' },
    { path: 'productfotos/hygiemeca/04_support_pour_pinceaux/01.jpg', caption: 'Penseelhouder — referentiefoto', alt: 'Wandhouder voor detailingpenselen' },
    { path: 'productfotos/hygiemeca/05_support_mural_boite_de_gants/01.jpg', caption: 'Wandhouder handschoenendoos — referentiefoto', alt: 'Houder voor doos met beschermhandschoenen' },
  ],
};

function assetUrl(path: string) {
  return `${import.meta.env.BASE_URL}${path}`;
}

/**
 * Existing repository photography is illustrative. Never represent it as the
 * user's generated 3D configuration or an exact image of the selected SKU.
 */
export default function DetailingPhotoGallery({
  group,
  compact = false,
}: {
  group: PhotoGroup;
  compact?: boolean;
}) {
  const photos = PHOTOS[group];
  const [active, setActive] = useState(0);
  const selected = photos[active] || photos[0];
  const move = (direction: number) =>
    setActive(current => (current + direction + photos.length) % photos.length);

  return (
    <section aria-label="Foto's van eerdere realisaties en producten" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-[var(--border)]">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)]">
          <Camera size={15} className="text-[var(--accent)]" />
          {compact ? "Foto's ter inspiratie" : "Echte foto’s van opbouwen en accessoires"}
        </span>
        <span className="text-[10px] text-[var(--text-muted)]">Foto {active + 1} / {photos.length}</span>
      </div>
      <div className="relative bg-[#10141b]">
        <img
          key={selected.path}
          src={assetUrl(selected.path)}
          alt={selected.alt}
          loading="lazy"
          className={`w-full object-contain ${compact ? 'h-44 sm:h-52' : 'h-[280px] sm:h-[390px] lg:h-[480px]'}`}
        />
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => move(-1)} aria-label="Vorige foto"
              className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/70 text-white p-2 hover:bg-black/90">
              <ChevronLeft size={17} />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="Volgende foto"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/70 text-white p-2 hover:bg-black/90">
              <ChevronRight size={17} />
            </button>
          </>
        )}
      </div>
      <div className="px-3 py-3">
        <p className="text-xs font-semibold text-[var(--text-primary)]">{selected.caption}</p>
        <p className="text-[11px] mt-1 leading-relaxed text-[var(--text-muted)]">
          Voorbeeldfoto — dit is niet de persoonlijk samengestelde 3D-configuratie.
          Uitvoering en producten kunnen afwijken.
        </p>
      </div>
      {!compact && photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-3 pb-3" aria-label="Fotokeuze">
          {photos.map((photo, index) => (
            <button key={photo.path} type="button"
              aria-label={photo.caption} aria-pressed={active === index}
              onClick={() => setActive(index)}
              className={`shrink-0 rounded-lg border-2 overflow-hidden ${active === index ? 'border-[var(--accent)]' : 'border-transparent'}`}>
              <img src={assetUrl(photo.path)} loading="lazy" alt="" className="w-[74px] h-[64px] object-cover"/>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
