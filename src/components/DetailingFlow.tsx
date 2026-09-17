import type { ReactNode } from 'react';
import { useState } from 'react';
import { useConfiguratorStore } from '../store/configuratorStore';
import {
  vehicleCategories,
  tankOptions,
  pressureOptions,
  pressureReelOptions,
  compressorOptions,
  airReelOptions,
  generatorOptions,
  powerReelOptions,
  vacuumOptions,
  liningOptions,
  frameOptions,
  extraOptions,
  STEP_ORDER,
  STEP_LABELS,
  getProduct,
} from '../data/detailingCatalog';
import LoadSpaceViewer from './LoadSpaceViewer';
import QuoteForm from './QuoteForm';
import { formatPriceOrPending } from '../lib/pricing';
import { estimatedWaterWeight } from '../lib/layoutEngine';
import { DEMO_MODE } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Truck,
  Droplets,
  Zap,
  Wind,
  Package,
  List,
  Box,
  LayoutGrid,
} from 'lucide-react';

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  children,
  disabled,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-selected={selected}
      data-disabled={disabled || undefined}
      aria-pressed={selected}
      className="option-card"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-[var(--text-primary)] leading-snug">{title}</p>
          {subtitle && <p className="text-sm text-[var(--text-secondary)] mt-0.5 leading-snug">{subtitle}</p>}
          {children}
        </div>
        <span
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            selected
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'border-[var(--border-strong)] text-transparent'
          }`}
          aria-hidden
        >
          <Check size={12} strokeWidth={3} />
        </span>
      </div>
    </button>
  );
}

function ProgressBar() {
  const step = useConfiguratorStore((s) => s.step);
  const setStep = useConfiguratorStore((s) => s.setStep);
  const configuration = useConfiguratorStore((s) => s.configuration);
  const compact = STEP_ORDER.filter((s) => s !== 'cab' || configuration.vehicleCategory !== 'trailer');
  const currentIdx = Math.max(0, compact.indexOf(step as (typeof compact)[number]));
  const total = compact.length;
  const progress = total > 0 ? ((currentIdx + 1) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="sm:hidden flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Stap {currentIdx + 1} van {total}
          </p>
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {STEP_LABELS[step] ?? step}
          </p>
        </div>
        <div className="flex-1 max-w-[140px] h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-base"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="hidden sm:block overflow-x-auto scrollbar-thin pb-0.5">
        <div className="flex items-center gap-1 min-w-max" role="tablist" aria-label="Configuratiestappen">
          {compact.map((s, i) => {
            const done = i < currentIdx;
            const active = s === step;
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStep(s)}
                className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-full border transition-all duration-base inline-flex items-center gap-1.5 ${
                  active
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : done
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-muted)]'
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : <span className="tabular-nums opacity-70">{String(i + 1).padStart(2, '0')}</span>}
                {STEP_LABELS[s]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Checklist() {
  const c = useConfiguratorStore((s) => s.configuration);
  const visited = useConfiguratorStore((s) => s.visitedSteps);
  const items: { label: string; ok: boolean }[] = [
    { label: 'VOERTUIG', ok: !!c.vehicleCategory },
    { label: 'CABINE', ok: c.vehicleCategory === 'trailer' || !!c.cabType },
    { label: 'WATER', ok: visited.includes('tank') },
    { label: 'HOGEDRUK', ok: visited.includes('pressure') },
    { label: 'LUCHT', ok: visited.includes('compressor') },
    { label: 'STROOM', ok: visited.includes('power') },
    { label: 'STOFZUIGING', ok: visited.includes('vacuum') },
    { label: 'FRAME', ok: !!c.frameComboId || visited.includes('frame') },
    { label: "EXTRA'S", ok: visited.includes('extras') },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 text-[10px]">
      {items.map((it) => (
        <span
          key={it.label}
          className={`px-1.5 py-0.5 rounded border ${
            it.ok ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/30' : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)]'
          }`}
        >
          {it.label} {it.ok ? '✓' : '—'}
        </span>
      ))}
    </div>
  );
}

function ConfigSummary() {
  const c = useConfiguratorStore((s) => s.configuration);
  const pricing = useConfiguratorStore((s) => s.getPricing());
  const removeProductById = useConfiguratorStore((s) => s.removeProductById);
  const water = estimatedWaterWeight(c);

  const rows: { label: string; value: string; id?: string }[] = [];
  if (c.tankId) {
    const p = getProduct(c.tankId);
    rows.push({
      label: 'Watertank',
      value: `${p?.name ?? ''}${c.floatValve ? ' · met vlotter' : c.floatValve === false ? ' · zonder vlotter' : ''}`,
      id: c.tankId,
    });
  }
  if (c.pressureWasherId === 'pressure_both') {
    rows.push({ label: 'Hogedruk', value: 'Elektrisch + benzine' });
  } else if (c.pressureWasherId) {
    rows.push({ label: 'Hogedruk', value: getProduct(c.pressureWasherId)?.name ?? '', id: c.pressureWasherId });
  }
  if (c.pressureReelId)
    rows.push({ label: 'HD-haspel', value: getProduct(c.pressureReelId)?.name ?? '', id: c.pressureReelId });
  if (c.compressorId)
    rows.push({ label: 'Compressor', value: getProduct(c.compressorId)?.name ?? '', id: c.compressorId });
  if (c.airReelId)
    rows.push({ label: 'Persluchthaspel', value: getProduct(c.airReelId)?.name ?? '', id: c.airReelId });
  if (c.generatorId)
    rows.push({ label: 'Generator', value: getProduct(c.generatorId)?.name ?? '', id: c.generatorId });
  if (c.powerReelId)
    rows.push({ label: 'Stroomhaspel', value: getProduct(c.powerReelId)?.name ?? '', id: c.powerReelId });
  if (c.vacuumId)
    rows.push({ label: 'Stofzuiger', value: getProduct(c.vacuumId)?.name ?? '', id: c.vacuumId });
  if (c.liningId && c.liningId !== 'lining_none')
    rows.push({ label: 'Bekleding', value: getProduct(c.liningId)?.name ?? '', id: c.liningId });
  if (c.frameComboId)
    rows.push({ label: 'Frame', value: getProduct(c.frameComboId)?.name ?? '', id: c.frameComboId });
  if (c.bottleHolder) rows.push({ label: 'Bottle holder', value: 'Ja', id: 'bottle_holder' });
  if (c.bucketHolder) rows.push({ label: 'Bucket holder', value: 'Ja', id: 'bucket_holder' });
  for (const e of c.extraIds) {
    rows.push({ label: 'Extra', value: getProduct(e)?.name ?? e, id: e });
  }
  if (c.installationType)
    rows.push({
      label: 'Installatie',
      value: c.installationType === 'installed' ? 'Door ons geïnstalleerd' : 'Ophaalpakket',
    });

  return (
    <div className="card p-4 sticky top-24">
      <h3 className="font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
        <Package size={18} /> Jouw detailing unit
      </h3>
      <Checklist />
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-6 text-center">Nog geen onderdelen geselecteerd.</p>
      ) : (
        <ul className="mt-3 space-y-2 max-h-64 overflow-y-auto text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex justify-between gap-2 border-b border-[var(--border)] pb-1.5">
              <div className="min-w-0">
                <p className="text-[10px] uppercase text-[var(--text-muted)]">{r.label}</p>
                <p className="text-[var(--text-primary)] truncate">{r.value}</p>
              </div>
              {r.id && (
                <button type="button" className="text-xs text-[var(--danger)] shrink-0" onClick={() => removeProductById(r.id!)}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {water > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Geschat watergewicht
          </p>
          <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">±{water} kg</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
            Alleen het watergewicht (±1 kg per liter). Toegestane voertuigbelasting moet afzonderlijk gecontroleerd worden.
          </p>
        </div>
      )}
      <div className="border-t border-[var(--border)] mt-3 pt-3 text-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Prijsstatus</p>
        {pricing.items.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Nog geen selectie</p>
        ) : pricing.hasPending ? (
          <>
            {pricing.knownSubtotal > 0 && (
              <p className="text-sm text-[var(--text-secondary)]">
                Bekend subtotaal:{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {formatPriceOrPending(pricing.knownSubtotal)}
                </span>
              </p>
            )}
            <p className="text-base font-bold text-[var(--accent)] mt-0.5">Op aanvraag</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {pricing.pendingCount} onderdeel{pricing.pendingCount !== 1 ? 'en' : ''} wachten op prijs
            </p>
          </>
        ) : (
          <p className="text-lg font-bold text-[var(--accent)]">{formatPriceOrPending(pricing.knownSubtotal)}</p>
        )}
      </div>
    </div>
  );
}

function StepContent() {
  const step = useConfiguratorStore((s) => s.step);
  const c = useConfiguratorStore((s) => s.configuration);
  const markVisited = useConfiguratorStore((s) => s.markVisited);
  const {
    setVehicleCategory,
    setCabType,
    setTank,
    setFloatValve,
    setPressureWasher,
    setPressureReel,
    setCompressor,
    setAirReel,
    setGenerator,
    setPowerReel,
    setVacuum,
    setLining,
    setFrameCombo,
    toggleExtra,
    setBottleHolder,
    setBucketHolder,
    setInstallationType,
    setSpecialRequests,
  } = useConfiguratorStore();

  if (step === 'vehicle') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Truck size={20} /> Welk type voertuig wil je inrichten?
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {vehicleCategories.map((v) => (
            <OptionCard
              key={v.id}
              selected={c.vehicleCategory === v.id}
              onClick={() => { setVehicleCategory(v.id); markVisited('vehicle'); }}
              title={v.name}
              subtitle={v.description}
            >
              <p className="text-xs text-[var(--text-muted)] mt-2">{v.examples.slice(0, 3).join(' · ')}</p>
            </OptionCard>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'cab') {
    if (c.vehicleCategory === 'trailer') {
      return (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Cabine</h2>
          <p className="text-sm text-[var(--text-secondary)]">Niet van toepassing op aanhangwagen.</p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Welke cabine heeft het voertuig?</h2>
        <p className="text-sm text-[var(--text-muted)]">Dubbele cabine = minder laadlengte in de 3D-simulatie (demo-afmetingen).</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <OptionCard selected={c.cabType === 'single'} onClick={() => { setCabType('single'); markVisited('cab'); }} title="Enkele cabine" subtitle="Maximale laadlengte" />
          <OptionCard selected={c.cabType === 'double'} onClick={() => { setCabType('double'); markVisited('cab'); }} title="Dubbele cabine" subtitle="Kortere laadruimte" />
        </div>
      </div>
    );
  }

  if (step === 'tank') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Droplets size={20} /> Welke watertank wil je?
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {tankOptions.map((o) => (
            <OptionCard
              key={String(o.id)}
              selected={c.tankId === o.id}
              onClick={() => { setTank(o.id); markVisited('tank'); }}
              title={o.label}
            />
          ))}
        </div>
        {c.tankId && (
          <div>
            <h3 className="font-semibold mb-2">Vlotter</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              <OptionCard selected={c.floatValve === true} onClick={() => setFloatValve(true)} title="Met vlotter" />
              <OptionCard selected={c.floatValve === false} onClick={() => setFloatValve(false)} title="Zonder vlotter" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (step === 'pressure') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Hogedrukoplossing</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {pressureOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.pressureWasherId === o.id} onClick={() => { setPressureWasher(o.id); markVisited('pressure'); }} title={o.label} />
          ))}
        </div>
        <h3 className="font-semibold">Hogedrukhaspel — 200 bar</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {pressureReelOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.pressureReelId === o.id} onClick={() => { setPressureReel(o.id); markVisited('pressure'); }} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'compressor') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Wind size={20} /> Compressor
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {compressorOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.compressorId === o.id} onClick={() => { setCompressor(o.id); markVisited('compressor'); }} title={o.label} />
          ))}
        </div>
        {c.compressorId && (
          <>
            <h3 className="font-semibold">Persluchthaspel — 20 bar</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {airReelOptions.map((o) => (
                <OptionCard key={String(o.id)} selected={c.airReelId === o.id} onClick={() => setAirReel(o.id)} title={o.label} />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (step === 'power') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Zap size={20} /> Generator
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {generatorOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.generatorId === o.id} onClick={() => { setGenerator(o.id); markVisited('power'); }} title={o.label} />
          ))}
        </div>
        <h3 className="font-semibold">Stroomhaspel</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {powerReelOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.powerReelId === o.id} onClick={() => { setPowerReel(o.id); markVisited('power'); }} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'vacuum') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Stofzuiger</h2>
        <div className="grid sm:grid-cols-1 gap-2">
          {vacuumOptions.map((o) => (
            <OptionCard key={String(o.id)} selected={c.vacuumId === o.id} onClick={() => { setVacuum(o.id); markVisited('vacuum'); }} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'lining') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Laadruimtebekleding</h2>
        <div className="grid sm:grid-cols-1 gap-2">
          {liningOptions.map((o) => (
            <OptionCard key={o.id} selected={c.liningId === o.id} onClick={() => { setLining(o.id); markVisited('lining'); }} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'frame') {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Frame-opstelling</h2>
        <div className="grid gap-2">
          {frameOptions.map((o) => (
            <OptionCard key={o.id} selected={c.frameComboId === o.id} onClick={() => { setFrameCombo(o.id); markVisited('frame'); }} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'extras') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Extra's</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <OptionCard selected={c.bottleHolder} onClick={() => { setBottleHolder(!c.bottleHolder); markVisited('extras'); }} title="Bottle holder set" />
          <OptionCard selected={c.bucketHolder} onClick={() => { setBucketHolder(!c.bucketHolder); markVisited('extras'); }} title="Bucket holder set" />
        </div>
        <h3 className="font-semibold">Extra apparatuur</h3>
        <div className="grid sm:grid-cols-2 gap-2">
          {extraOptions.map((o) => (
            <OptionCard key={o.id} selected={c.extraIds.includes(o.id)} onClick={() => { toggleExtra(o.id); markVisited('extras'); }} title={o.label} />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'installation') {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Hoe wil je het pakket ontvangen?</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <OptionCard selected={c.installationType === 'installed'} onClick={() => { setInstallationType('installed'); markVisited('installation'); }} title="Door ons geïnstalleerd" subtitle="Prijs installatie later" />
          <OptionCard selected={c.installationType === 'pickup'} onClick={() => { setInstallationType('pickup'); markVisited('installation'); }} title="Ophaalpakket" subtitle="Zelf monteren" />
        </div>
        <div>
          <label className="font-semibold text-sm block mb-1">Opmerkingen / speciale wensen</label>
          <textarea
            className="w-full border border-[var(--border)] rounded-lg p-3 text-sm min-h-[100px] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            placeholder="Bijvoorbeeld: drie haspels naast elkaar, extra ruimte vrijhouden voor eigen machine..."
            value={c.specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
        </div>
      </div>
    );
  }

  const snap = useConfiguratorStore.getState().buildSnapshot();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Overzicht configuratie</h2>
        <div className="card p-4 text-sm space-y-1 mt-3">
          <p><strong>Voertuig:</strong> {useConfiguratorStore.getState().getVehicleLabel()}</p>
          <p><strong>Onderdelen:</strong> {snap.pendingPriceItems.length} geselecteerd (prijzen op aanvraag)</p>
          <p><strong>Watergewicht:</strong> ±{snap.estimatedWaterWeightKg} kg</p>
          <p className="text-[10px] text-[var(--text-muted)]">Geschat gewicht van het water; voertuigbelasting en toegestane massa moeten afzonderlijk gecontroleerd worden.</p>
          {snap.layoutWarnings.length > 0 && (
            <div className="text-[var(--warning)] text-xs mt-2">{snap.layoutWarnings.map((w, i) => <p key={i}>{w}</p>)}</div>
          )}
          {snap.specialRequests && <p className="mt-2"><strong>Wensen:</strong> {snap.specialRequests}</p>}
        </div>
      </div>
      <div className="border-t border-[var(--border)] pt-6">
        <QuoteForm />
      </div>
    </div>
  );
}

export default function DetailingFlow() {
  const step = useConfiguratorStore((s) => s.step);
  const nextStep = useConfiguratorStore((s) => s.nextStep);
  const prevStep = useConfiguratorStore((s) => s.prevStep);
  const markVisited = useConfiguratorStore((s) => s.markVisited);
  const configuration = useConfiguratorStore((s) => s.configuration);

  const canNext = (() => {
    if (step === 'vehicle') return !!configuration.vehicleCategory;
    if (step === 'cab') return configuration.vehicleCategory === 'trailer' || !!configuration.cabType;
    return true;
  })();

  const handleNext = () => {
    markVisited(step);
    nextStep();
  };

  const [mobileTab, setMobileTab] = useState<'keuzes' | '3d' | 'overzicht'>('keuzes');

  return (
    <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-4 pb-safe lg:pb-8">
      {DEMO_MODE && (
        <div className="mb-3 rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-3 py-2 text-xs text-[var(--warning)]">
          <strong>Demoversie</strong> — productgegevens en prijzen worden nog aangevuld. Geen bindende offerte.
        </div>
      )}
      <div className="mb-4"><ProgressBar /></div>

      <div className="hidden lg:grid lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-5">
            <StepContent />
            <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-[var(--border)]">
              <button type="button" onClick={prevStep} className="btn-secondary btn-sm" disabled={step === 'vehicle'}>
                <ChevronLeft size={16} /> Terug
              </button>
              {step !== 'overview' && (
                <button type="button" onClick={handleNext} disabled={!canNext} className="btn-primary btn-sm">
                  Volgende <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-6"><LoadSpaceViewer /></div>
        <div className="lg:col-span-3"><ConfigSummary /></div>
      </div>

      <div className="lg:hidden">
        <div className="mb-3">
          {mobileTab === 'keuzes' && (
            <div className="card p-4">
              <StepContent />
              <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-[var(--border)]">
                <button type="button" onClick={prevStep} className="btn-secondary btn-sm" disabled={step === 'vehicle'}>
                  <ChevronLeft size={16} /> Terug
                </button>
                {step !== 'overview' && (
                  <button type="button" onClick={handleNext} disabled={!canNext} className="btn-primary btn-sm">
                    Volgende <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
          {mobileTab === '3d' && <LoadSpaceViewer />}
          {mobileTab === 'overzicht' && <ConfigSummary />}
        </div>
        <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-md bottom-nav-safe" aria-label="Configurator navigatie">
          <div className="grid grid-cols-3 max-w-lg mx-auto">
            {([
              { id: 'keuzes' as const, label: 'Keuzes', icon: List },
              { id: '3d' as const, label: '3D', icon: Box },
              { id: 'overzicht' as const, label: 'Overzicht', icon: LayoutGrid },
            ]).map((tab) => {
              const Icon = tab.icon;
              const active = mobileTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setMobileTab(tab.id)} className={`flex flex-col items-center gap-0.5 py-3 text-[11px] font-semibold transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
