import { useState } from 'react';
import {
  Box, Check, ChevronRight, ClipboardList, Droplets, Info,
  Minus, Package, Plus, Search, SlidersHorizontal, Wrench,
} from 'lucide-react';
import { useConfiguratorStore } from '../store/configuratorStore';
import { products } from '../data/detailingCatalog';
import { canChooseDemoOption } from '../lib/demoAvailability';
import { estimatedWaterWeight } from '../lib/layoutEngine';
import { formatPriceOrPending } from '../lib/pricing';
import type { DetailingConfiguration, DetailingProduct } from '../types';
import LoadSpaceViewer from './LoadSpaceViewer';
import QuoteForm from './QuoteForm';

type Category = 'tank' | 'pressure' | 'compressor' | 'power' | 'vacuum' | 'lining' | 'frame' | 'extras';
type Panel = 'products' | 'installation' | 'overview';

const CATEGORIES: { id: Category; label: string; kinds: string[] }[] = [
  { id: 'tank', label: 'Water', kinds: ['tank'] },
  { id: 'pressure', label: 'Hogedruk', kinds: ['pressure', 'pressure_reel'] },
  { id: 'compressor', label: 'Lucht', kinds: ['compressor', 'air_reel'] },
  { id: 'power', label: 'Stroom', kinds: ['generator', 'power_reel'] },
  { id: 'vacuum', label: 'Stofzuiging', kinds: ['vacuum'] },
  { id: 'lining', label: 'Afwerking', kinds: ['lining'] },
  { id: 'frame', label: 'Frame', kinds: ['frame'] },
  { id: 'extras', label: "Extra's", kinds: ['extra', 'holder'] },
];
const KIND_LABELS: Record<string, string> = {
  tank: 'Watertank', pressure: 'Hogedrukreiniger', pressure_reel: 'HD haspel',
  compressor: 'Compressor', air_reel: 'Persluchthaspel', generator: 'Generator',
  power_reel: 'Stroomhaspel', vacuum: 'Stofzuiger', lining: 'Bekleding',
  frame: 'Montageframe', extra: 'Accessoires', holder: 'Houder',
};

/** Category-level reference imagery. These are NOT photos of the exact SKU. */
function photoFor(kind: string): string {
  if (kind === 'pressure') return 'realisations/interior-03.jpg';
  if (['pressure_reel', 'air_reel', 'power_reel'].includes(kind)) return 'realisations/interior-02.jpg';
  if (kind === 'generator') return 'realisations/interior-01.jpg';
  if (kind === 'holder') return 'productfotos/hygiemeca/02_support_pinceaux_et_pulverisateurs/01.jpg';
  if (kind === 'extra') return 'productfotos/hygiemeca/01_support_pour_brosses/01.jpg';
  return 'realisations/workbench-01.jpg';
}
function chosen(c: DetailingConfiguration, p: DetailingProduct): boolean {
  switch (p.category) {
    case 'tank': return c.tankId === p.id;
    case 'pressure': return c.pressureWasherId === p.id || (c.pressureWasherId === 'pressure_both' && ['pressure_electric', 'pressure_petrol'].includes(p.id));
    case 'pressure_reel': return c.pressureReelId === p.id;
    case 'compressor': return c.compressorId === p.id;
    case 'air_reel': return c.airReelId === p.id;
    case 'generator': return c.generatorId === p.id;
    case 'power_reel': return c.powerReelId === p.id;
    case 'vacuum': return c.vacuumId === p.id;
    case 'lining': return c.liningId === p.id;
    case 'frame': return c.frameComboId === p.id;
    case 'holder': return p.id === 'bottle_holder' ? c.bottleHolder : c.bucketHolder;
    case 'extra': return c.extraIds.includes(p.id);
    default: return false;
  }
}
function patch(c: DetailingConfiguration, p: DetailingProduct): Partial<DetailingConfiguration> {
  switch (p.category) {
    case 'tank': return { tankId: p.id };
    case 'pressure': return { pressureWasherId: p.id };
    case 'pressure_reel': return { pressureReelId: p.id };
    case 'compressor': return { compressorId: p.id };
    case 'air_reel': return { airReelId: p.id };
    case 'generator': return { generatorId: p.id };
    case 'power_reel': return { powerReelId: p.id };
    case 'vacuum': return { vacuumId: p.id };
    case 'lining': return { liningId: p.id };
    case 'frame': return { frameComboId: p.id };
    case 'holder': return p.id === 'bottle_holder' ? { bottleHolder: true } : { bucketHolder: true };
    case 'extra': return { extraIds: [...c.extraIds, p.id] };
    default: return {};
  }
}
function ProductCard({ item, active, onSelect }: {
  item: DetailingProduct; active: boolean; onSelect: () => void;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const d = item.dimensions;
  const dims = d.width && d.height && d.depth
    ? [d.width, d.height, d.depth].map(n => Math.round(n * 100)).join(' × ') + ' cm'
    : 'Op maat';
  return (
    <article className={'flex min-w-0 flex-col overflow-hidden rounded-xl border transition-colors ' +
      (active ? 'border-sky-500 bg-sky-500/10' : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)]')}>
      <div className="relative h-24 overflow-hidden bg-[#11171f] sm:h-28 2xl:h-30">
        {photoFailed ? (
          <div className="flex h-full items-center justify-center text-sky-400"><Package size={34} strokeWidth={1.5} /></div>
        ) : (
          <img src={import.meta.env.BASE_URL + photoFor(item.category)}
            alt={'Referentiefoto voor ' + (KIND_LABELS[item.category] || 'onderdeel')}
            onError={() => setPhotoFailed(true)} loading="lazy" decoding="async"
            className="h-full w-full object-cover opacity-90 transition-transform duration-300 hover:scale-105" />
        )}
        <span className="absolute left-2 top-2 rounded-md bg-[#09101b]/85 px-2 py-1 text-[10px] font-semibold text-white">
          {KIND_LABELS[item.category] || 'Onderdeel'}
        </span>
        <span title="Referentiefoto, geen exacte productfoto" className="absolute right-2 top-2 rounded-full bg-[#09101b]/80 p-1.5 text-white/80">
          <Info size={14} />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="min-h-10 text-xs font-bold leading-snug text-[var(--text-primary)] sm:text-[13px]">{item.name}</h3>
        <p className="mt-1 text-[11px] text-[var(--text-muted)]">{dims}</p>
        <div className="mt-auto pt-2.5">
          <p className="mb-2 text-[11px] text-[var(--text-secondary)]">
            {item.price === null ? 'Prijs op aanvraag' : formatPriceOrPending(item.price)}
          </p>
          <button type="button" onClick={onSelect} aria-pressed={active}
            className={'flex h-9 w-full items-center justify-center gap-1 rounded-lg text-xs font-bold transition-colors ' +
              (active ? 'border border-sky-500/60 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20' :
                'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]')}>
            {active ? <><Check size={14} /> Verwijderen</> : <><Plus size={15} /> Toevoegen</>}
          </button>
        </div>
      </div>
    </article>
  );
}

function InstallationPanel() {
  const config = useConfiguratorStore(s => s.configuration);
  const setType = useConfiguratorStore(s => s.setInstallationType);
  const setRequests = useConfiguratorStore(s => s.setSpecialRequests);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Hoe wil je de installatie ontvangen?</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">We controleren de echte bestelwagen vóór de definitieve offerte.</p>
      </div>
      {([
        { id: 'installed' as const, name: 'Door ons laten inbouwen', desc: 'Wij plaatsen de installatie professioneel in jouw bus.' },
        { id: 'pickup' as const, name: 'Zelf monteren / ophalen', desc: 'Je ontvangt een pakket voor eigen montage.' },
      ]).map(o => (
        <button key={o.id} type="button" onClick={() => setType(o.id)} aria-pressed={config.installationType === o.id}
          className={'block w-full rounded-lg border px-3 py-3 text-left ' +
            (config.installationType === o.id ? 'border-sky-500 bg-sky-500/10' : 'border-[var(--border)] bg-[var(--surface)] hover:border-slate-500')}>
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className={'flex h-4 w-4 items-center justify-center rounded-full border ' +
              (config.installationType === o.id ? 'border-sky-500 bg-sky-500' : 'border-[var(--border-strong)]')}>
              {config.installationType === o.id && <Check size={12} />}
            </span>
            {o.name}
          </span>
          <span className="mt-1 block pl-6 text-xs text-[var(--text-muted)]">{o.desc}</span>
        </button>
      ))}
      <label htmlFor="rs-requests" className="block text-xs font-semibold">Extra wensen</label>
      <textarea id="rs-requests" rows={4} value={config.specialRequests} onChange={e => setRequests(e.target.value)}
        placeholder="Bijvoorbeeld extra ruimte voor een eigen machine..."
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-sky-500" />
    </div>
  );
}

function OverviewPanel({ showProducts }: { showProducts: () => void }) {
  const config = useConfiguratorStore(s => s.configuration);
  const remove = useConfiguratorStore(s => s.removeProductById);
  const selectedItems = products.filter(p => chosen(config, p) && p.id !== 'lining_none');
  const water = estimatedWaterWeight(config);
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold">Jouw gekozen installatie</h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Controleer de samenstelling voordat je de offerte voorbereidt.</p>
      </div>
      {selectedItems.length ? (
        <ul className="space-y-1.5">
          {selectedItems.map(p => (
            <li key={p.id} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Check size={15} className="shrink-0 text-sky-400" />
              <span className="min-w-0 flex-1 text-xs font-semibold">{p.name}</span>
              <button type="button" onClick={() => remove(p.id)} aria-label={'Verwijder ' + p.name}
                className="rounded-md p-1.5 text-[var(--text-muted)] hover:text-red-400"><Minus size={15} /></button>
            </li>
          ))}
        </ul>
      ) : <button type="button" onClick={showProducts} className="block w-full rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-6 text-xs text-sky-400">Nog geen onderdelen. Kies eerst je installatie.</button>}
      {water > 0 && <p className="rounded-lg bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
        Alleen het water weegt gevuld ongeveer {water} kg. Laadvermogen en montage controleren we vóór de offerte.
      </p>}
      <div className="border-t border-[var(--border)] pt-4"><QuoteForm /></div>
    </div>
  );
}

export default function DetailingFlow() {
  const store = useConfiguratorStore();
  const config = store.configuration;
  const [panel, setPanel] = useState<Panel>('products');
  const [category, setCategory] = useState<Category>('tank');
  const [search, setSearch] = useState('');
  const [onlyChosen, setOnlyChosen] = useState(false);
  const selectedItems = products.filter(p => chosen(config, p) && p.id !== 'lining_none');
  const term = search.trim().toLocaleLowerCase('nl-BE');
  const availableItems = products.filter(p => {
    if (!p.active) return false;
    const active = chosen(config, p);
    if (onlyChosen && !active) return false;
    const group = CATEGORIES.find(g => g.kinds.includes(p.category));
    if (!group || (!term && group.id !== category)) return false;
    if (term && ![p.name, p.description, group.label].join(' ').toLocaleLowerCase('nl-BE').includes(term)) return false;
    if (p.category === 'air_reel' && !config.compressorId && !active) return false;
    return canChooseDemoOption(config, patch(config, p), p.id, active);
  });
  function selectCategory(id: Category) {
    setCategory(id);
    setSearch('');
    setOnlyChosen(false);
    setPanel('products');
    store.setStep(id);
    store.markVisited(id);
  }
  function selectProduct(p: DetailingProduct) {
    const on = chosen(config, p);
    switch (p.category) {
      case 'tank': store.setTank(on ? null : p.id); break;
      case 'pressure': store.setPressureWasher(on ? null : p.id); break;
      case 'pressure_reel': store.setPressureReel(on ? null : p.id); break;
      case 'compressor': store.setCompressor(on ? null : p.id); break;
      case 'air_reel': store.setAirReel(on ? null : p.id); break;
      case 'generator': store.setGenerator(on ? null : p.id); break;
      case 'power_reel': store.setPowerReel(on ? null : p.id); break;
      case 'vacuum': store.setVacuum(on ? null : p.id); break;
      case 'lining': store.setLining(on ? 'lining_none' : p.id); break;
      case 'frame': store.setFrameCombo(on ? null : p.id); break;
      case 'holder': if (p.id === 'bottle_holder') store.setBottleHolder(!on); else store.setBucketHolder(!on); break;
      case 'extra': store.toggleExtra(p.id); break;
    }
    const group = CATEGORIES.find(g => g.kinds.includes(p.category));
    if (group) store.markVisited(group.id);
  }
  return (
    <div className="mx-auto max-w-[1920px] px-2 py-2 sm:px-3 lg:px-4 lg:py-3">
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-3.5">
        <section className="min-w-0">
          <div className="mb-3 flex min-h-[70px] items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 sm:flex"><Box size={22} /></span>
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold tracking-tight sm:text-xl">Jouw mobiele werkplaats, in 3D</h1>
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)] sm:text-xs">Eén algemene voorbeeldbestelwagen · Direct samenstellen</p>
              </div>
            </div>
            <button type="button" onClick={() => setPanel('overview')}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface-elevated)] px-3 py-2.5 text-xs font-semibold">
              <ClipboardList size={16} /><span className="hidden sm:inline">Overzicht</span>
              <span className="rounded-full bg-sky-500/20 px-1.5 py-0.5 text-sky-300">{selectedItems.length}</span>
            </button>
          </div>
          <LoadSpaceViewer />
        </section>

        <section aria-label="Onderdelen en offerte" className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] lg:h-[calc(100dvh-82px)] lg:min-h-[600px]">
          <div className="shrink-0 border-b border-[var(--border)] p-3">
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-[var(--surface)] p-1">
              {([
                { id: 'products' as const, label: 'Onderdelen', icon: Package },
                { id: 'installation' as const, label: 'Installatie', icon: Wrench },
                { id: 'overview' as const, label: 'Overzicht', icon: ClipboardList },
              ]).map(o => {
                const Icon = o.icon;
                return (
                  <button key={o.id} type="button" onClick={() => setPanel(o.id)} aria-pressed={panel === o.id}
                    className={'flex items-center justify-center gap-1.5 rounded-lg px-2 py-3 text-[11px] font-semibold transition-colors sm:text-xs ' +
                      (panel === o.id ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]')}>
                    <Icon size={15} />{o.label}
                  </button>
                );
              })}
            </div>
            {panel === 'products' && (
              <>
                <nav aria-label="Productcategorieën" className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {CATEGORIES.map(o => (
                    <button key={o.id} type="button" onClick={() => selectCategory(o.id)} aria-pressed={category === o.id}
                      className={'shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold transition-colors ' +
                        (category === o.id && !term ? 'border-[var(--accent)] bg-[var(--accent)] text-white' :
                          'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-slate-500')}>
                      {o.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-2.5 flex gap-2">
                  <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 focus-within:border-sky-500">
                    <Search size={17} className="shrink-0 text-[var(--text-muted)]" />
                    <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Zoek een onderdeel..."
                      aria-label="Zoek onderdelen" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]" />
                  </label>
                  <button type="button" onClick={() => setOnlyChosen(v => !v)} aria-pressed={onlyChosen}
                    aria-label={onlyChosen ? 'Alle passende onderdelen tonen' : 'Alleen gekozen onderdelen tonen'}
                    title={onlyChosen ? 'Alle passende onderdelen tonen' : 'Alleen gekozen onderdelen tonen'}
                    className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ' +
                      (onlyChosen ? 'border-sky-500 bg-sky-500/10 text-sky-400' : 'border-[var(--border-strong)] bg-[var(--surface)]')}>
                    <SlidersHorizontal size={17} />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin p-3">
            {panel === 'products' && (
              <>
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold">{term ? 'Zoekresultaten' : onlyChosen ? 'Gekozen onderdelen' : CATEGORIES.find(o => o.id === category)?.label}</h2>
                  <span className="text-[11px] text-[var(--text-muted)]">{availableItems.length} opties</span>
                </div>
                {availableItems.length ? (
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 2xl:grid-cols-3">
                    {availableItems.map(p => (
                      <ProductCard key={p.id} item={p} active={chosen(config, p)} onSelect={() => selectProduct(p)} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--border-strong)] px-4 py-8 text-center">
                    <Package size={26} className="mx-auto text-[var(--text-muted)]" />
                    <p className="mt-2 text-sm font-semibold">Geen beschikbare onderdelen</p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">Zoek anders of verwijder een gekozen onderdeel.</p>
                    <button type="button" onClick={() => { setSearch(''); setOnlyChosen(false); }}
                      className="mt-3 text-xs font-semibold text-sky-400 underline">Filters wissen</button>
                  </div>
                )}
                {category === 'tank' && config.tankId && !term && (
                  <div className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                    <p className="mb-2 text-xs font-bold">Watertankvlotter</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([true, false] as const).map(yes => (
                        <button key={String(yes)} type="button" onClick={() => store.setFloatValve(yes)} aria-pressed={config.floatValve === yes}
                          className={'rounded-md border px-2 py-2 text-xs ' +
                            (config.floatValve === yes ? 'border-sky-500 bg-sky-500/10 text-sky-300' : 'border-[var(--border)]')}>
                          {yes ? 'Met vlotter' : 'Zonder vlotter'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {category === 'compressor' && !config.compressorId && !term && (
                  <p className="mt-3 text-xs text-[var(--text-muted)]">Kies eerst een compressor om persluchthaspels te zien.</p>
                )}
                <p className="mt-4 text-[10px] leading-relaxed text-[var(--text-muted)]">
                  Dit zijn referentiefoto’s, geen exacte productfoto’s. Maten en montage zijn voorlopig;
                  de werkelijke voertuigpassing en belading controleren we bij de offerte.
                </p>
              </>
            )}
            {panel === 'installation' && <InstallationPanel />}
            {panel === 'overview' && <OverviewPanel showProducts={() => setPanel('products')} />}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
              <Box size={14} className="text-sky-400" /> <strong className="text-white">{selectedItems.length}</strong> gekozen
            </span>
            {panel === 'products' ? (
              <button type="button" onClick={() => setPanel('installation')}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white">
                Installatie <ChevronRight size={15} />
              </button>
            ) : panel === 'installation' ? (
              <button type="button" onClick={() => setPanel('overview')}
                className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-3 py-2 text-xs font-bold text-white">
                Offerte aanvragen <ChevronRight size={15} />
              </button>
            ) : (
              <button type="button" onClick={() => setPanel('products')}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] px-3 py-2 text-xs font-semibold">
                <Droplets size={15} /> Verder kiezen
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
